from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timezone
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import uuid4

from sqlalchemy.orm import Session

import models

RAZORPAY_ORDER_URL = "https://api.razorpay.com/v1/orders"
DEFAULT_PUBLIC_KEY = "rzp_test_aura_platform"
DEFAULT_MOCK_SECRET = "aura_razorpay_mock_secret"

PIPELINE_LABELS = [
    ("order_created", "Order created"),
    ("checkout_opened", "Checkout opened"),
    ("authorized", "Payment authorized"),
    ("signature_verified", "Signature verified"),
    ("settlement", "Settlement recorded"),
]


def _to_float(value: Decimal | float | int | None) -> float:
    if value is None:
        return 0.0
    return round(float(value), 2)


def _resolve_gateway_credentials(
    force_mode: str | None = None,
) -> tuple[str, str, str]:
    if force_mode == "MOCK":
        mock_key_id = os.getenv("NEXT_PUBLIC_RAZORPAY_KEY_ID", DEFAULT_PUBLIC_KEY)
        mock_secret = os.getenv("RAZORPAY_MOCK_SECRET", DEFAULT_MOCK_SECRET)
        return mock_key_id, mock_secret, "MOCK"

    live_key_id = os.getenv("RAZORPAY_KEY_ID")
    live_key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if force_mode == "LIVE":
        if not live_key_id or not live_key_secret:
            raise ValueError("Live Razorpay credentials are not configured")
        return live_key_id, live_key_secret, "LIVE"

    if live_key_id and live_key_secret:
        return live_key_id, live_key_secret, "LIVE"

    mock_key_id = os.getenv("NEXT_PUBLIC_RAZORPAY_KEY_ID", DEFAULT_PUBLIC_KEY)
    mock_secret = os.getenv("RAZORPAY_MOCK_SECRET", DEFAULT_MOCK_SECRET)
    return mock_key_id, mock_secret, "MOCK"


def _build_basic_auth_header(key_id: str, key_secret: str) -> str:
    token = base64.b64encode(f"{key_id}:{key_secret}".encode("utf-8")).decode("ascii")
    return f"Basic {token}"


def _to_subunits(amount: float) -> int:
    return int(round(amount * 100))


def _build_pipeline(status: str, detail: str | None = None) -> list[dict]:
    stages: list[dict] = []
    status_order = {
        "CREATED": 0,
        "AUTHORIZED": 2,
        "VERIFIED": 3,
        "CAPTURED": 4,
    }
    completed_index = status_order.get(status, -1)
    active_index = 1 if status == "CREATED" else 4 if status == "VERIFIED" else -1

    for index, (key, label) in enumerate(PIPELINE_LABELS):
        if status == "FAILED" and index >= 2:
            stage_status = "failed" if index == 2 else "pending"
        elif index <= completed_index:
            stage_status = "completed"
        elif index == active_index:
            stage_status = "active"
        else:
            stage_status = "pending"

        stage_detail = detail
        if not stage_detail:
            if key == "order_created":
                stage_detail = "Order has been minted for checkout."
            elif key == "checkout_opened":
                stage_detail = "Customer can select UPI, card, netbanking or wallet."
            elif key == "authorized":
                stage_detail = "Issuer or payment instrument authorization is being confirmed."
            elif key == "signature_verified":
                stage_detail = "Server-side signature validation protects against tampering."
            else:
                stage_detail = "Funds movement is recorded against the Aura journey."

        stages.append(
            {
                "key": key,
                "label": label,
                "status": stage_status,
                "detail": stage_detail,
                "timestamp": datetime.now(timezone.utc) if stage_status == "completed" else None,
            }
        )
    return stages


def _serialize_order(order: models.PaymentOrder) -> dict:
    key_id, _, _ = _resolve_gateway_credentials(order.provider_mode)
    user = order.owner
    amount = _to_float(order.amount)
    notice = None
    if order.provider_mode == "MOCK":
        notice = (
            "Using a Razorpay-compatible mock checkout. Add RAZORPAY_KEY_ID and "
            "RAZORPAY_KEY_SECRET for live gateway calls."
        )

    return {
        "gateway": order.gateway,
        "provider_mode": order.provider_mode,
        "order_id": order.gateway_order_id,
        "receipt": order.receipt,
        "status": order.status,
        "amount": amount,
        "amount_subunits": _to_subunits(amount),
        "currency": order.currency,
        "destination": order.destination,
        "note": order.note,
        "notice": notice,
        "transaction_reference": order.transaction_reference,
        "checkout": {
            "key_id": key_id,
            "amount": _to_subunits(amount),
            "currency": order.currency,
            "merchant_name": "Aura Premier Banking",
            "description": order.route_title,
            "order_id": order.gateway_order_id,
            "prefill": {
                "name": user.full_name,
                "email": user.email,
                "contact": user.mobile_number,
            },
            "theme_color": "#db1f35",
        },
        "pipeline": _build_pipeline(order.status, order.status_message),
    }


def _call_live_razorpay_order_api(payload: dict) -> dict:
    key_id, key_secret, _ = _resolve_gateway_credentials("LIVE")
    request = Request(
        RAZORPAY_ORDER_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": _build_basic_auth_header(key_id, key_secret),
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urlopen(request, timeout=10) as response:  # noqa: S310
        return json.loads(response.read().decode("utf-8"))


def create_payment_order(db: Session, payload) -> dict:
    user = db.get(models.User, payload.user_id)
    if not user:
        raise ValueError("User not found")

    source_account = db.get(models.Account, payload.source_account_id)
    if not source_account or source_account.user_id != user.id:
        raise ValueError("Source account is invalid for this user")

    amount = round(payload.amount, 2)
    available_balance = _to_float(source_account.available_balance)
    if available_balance < amount:
        raise ValueError("Insufficient available balance for this payment")

    key_id, _, provider_mode = _resolve_gateway_credentials()
    gateway_order_id = f"order_mock_{uuid4().hex[:14]}"
    status_message = "Order created and ready for Razorpay checkout."

    if provider_mode == "LIVE":
        live_payload = {
            "amount": _to_subunits(amount),
            "currency": payload.currency.upper(),
            "receipt": f"Aura-{uuid4().hex[:10].upper()}",
            "notes": {
                "route_slug": payload.route_slug,
                "destination": payload.destination,
            },
        }
        try:
            response = _call_live_razorpay_order_api(live_payload)
            gateway_order_id = response["id"]
            receipt = response.get("receipt", live_payload["receipt"])
        except (HTTPError, URLError, KeyError, TimeoutError, json.JSONDecodeError):
            provider_mode = "MOCK"
            key_id, _, _ = _resolve_gateway_credentials("MOCK")
            receipt = f"Aura-{uuid4().hex[:10].upper()}"
            status_message = (
                "Live gateway was unavailable, so the Aura Razorpay simulation was activated."
            )
    else:
        receipt = f"Aura-{uuid4().hex[:10].upper()}"

    order = models.PaymentOrder(
        user_id=user.id,
        source_account_id=source_account.id,
        route_slug=payload.route_slug,
        route_title=payload.route_title,
        gateway="RAZORPAY",
        provider_mode=provider_mode,
        gateway_order_id=gateway_order_id,
        receipt=receipt,
        amount=amount,
        currency=payload.currency.upper(),
        destination=payload.destination,
        note=payload.note,
        payment_mode=payload.payment_mode,
        origin_country=payload.origin_country.upper() if payload.origin_country else None,
        destination_country=(
            payload.destination_country.upper() if payload.destination_country else None
        ),
        purpose_code=payload.purpose_code,
        status="CREATED",
        status_message=status_message,
        gateway_payload={
            "public_key": key_id,
            "route_title": payload.route_title,
            "payment_mode": payload.payment_mode,
        },
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return _serialize_order(order)


def create_mock_authorization(db: Session, gateway_order_id: str) -> dict:
    order = (
        db.query(models.PaymentOrder)
        .filter(models.PaymentOrder.gateway_order_id == gateway_order_id)
        .first()
    )
    if not order:
        raise ValueError("Payment order not found")

    if order.provider_mode != "MOCK":
        raise ValueError("Mock authorization is only available for simulated checkout")

    _, secret, _ = _resolve_gateway_credentials(order.provider_mode)
    payment_id = f"pay_mock_{uuid4().hex[:14]}"
    signature = hmac.new(
        secret.encode("utf-8"),
        f"{order.gateway_order_id}|{payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    order.status = "AUTHORIZED"
    order.gateway_payment_id = payment_id
    order.status_message = "Payment instrument authorized in Razorpay simulation."
    db.commit()
    db.refresh(order)

    return {
        "order_id": order.gateway_order_id,
        "payment_id": payment_id,
        "signature": signature,
        "provider_mode": order.provider_mode,
        "pipeline": _build_pipeline(order.status, order.status_message),
    }


def _build_transaction_type(order: models.PaymentOrder) -> str:
    if order.route_slug == "global-transfers":
        return "REMITTANCE"
    if order.currency != "INR" or order.route_slug == "fx-retail":
        return "FX"
    return "BILL_PAYMENT"


def verify_payment_signature(db: Session, payload) -> dict:
    order = (
        db.query(models.PaymentOrder)
        .filter(models.PaymentOrder.gateway_order_id == payload.order_id)
        .first()
    )
    if not order:
        raise ValueError("Payment order not found")

    _, secret, _ = _resolve_gateway_credentials(order.provider_mode)
    expected_signature = hmac.new(
        secret.encode("utf-8"),
        f"{payload.order_id}|{payload.payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, payload.signature):
        order.status = "FAILED"
        order.status_message = "Signature verification failed."
        db.commit()
        db.refresh(order)
        return {
            "verified": False,
            "status": order.status,
            "message": order.status_message,
            "provider_mode": order.provider_mode,
            "amount": _to_float(order.amount),
            "currency": order.currency,
            "order_id": order.gateway_order_id,
            "payment_id": payload.payment_id,
            "transaction_reference": order.transaction_reference,
            "pipeline": _build_pipeline(order.status, order.status_message),
        }

    order.gateway_payment_id = payload.payment_id
    order.status = "VERIFIED"
    order.verified_at = datetime.now(timezone.utc)
    order.status_message = "Signature verified and settlement is being recorded."

    source_account = (
        db.get(models.Account, order.source_account_id) if order.source_account_id else None
    )
    if source_account and not order.transaction_reference:
        source_account.current_balance = _to_float(source_account.current_balance) - _to_float(
            order.amount
        )
        source_account.available_balance = _to_float(
            source_account.available_balance
        ) - _to_float(order.amount)

        transaction_reference = f"PAY{uuid4().hex[:10].upper()}"
        transaction = models.Transaction(
            reference=transaction_reference,
            from_account_id=source_account.id,
            amount=_to_float(order.amount),
            currency=order.currency,
            direction="DEBIT",
            transaction_type=_build_transaction_type(order),
            merchant_name=order.destination[:120],
            merchant_category="Payments",
            mcc_code="6540",
            origin_country=order.origin_country,
            destination_country=order.destination_country,
            narration=order.note or order.route_title,
            status="BOOKED",
        )
        db.add(transaction)
        order.transaction_reference = transaction_reference

    order.status = "CAPTURED"
    order.status_message = "Payment captured and recorded in the Aura ledger."
    db.commit()
    db.refresh(order)

    return {
        "verified": True,
        "status": order.status,
        "message": order.status_message,
        "provider_mode": order.provider_mode,
        "amount": _to_float(order.amount),
        "currency": order.currency,
        "order_id": order.gateway_order_id,
        "payment_id": payload.payment_id,
        "transaction_reference": order.transaction_reference,
        "pipeline": _build_pipeline(order.status, order.status_message),
    }


def get_payment_order(db: Session, gateway_order_id: str) -> dict:
    order = (
        db.query(models.PaymentOrder)
        .filter(models.PaymentOrder.gateway_order_id == gateway_order_id)
        .first()
    )
    if not order:
        raise ValueError("Payment order not found")
    return _serialize_order(order)
