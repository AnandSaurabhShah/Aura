from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import database
import schemas
from services.payment_service import (
    create_mock_authorization,
    create_payment_order,
    get_payment_order,
    verify_payment_signature,
)

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/orders", response_model=schemas.PaymentOrderResponse)
def create_order(
    payload: schemas.PaymentOrderCreateRequest,
    db: Session = Depends(database.get_db),
):
    try:
        return create_payment_order(db, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/orders/{order_id}", response_model=schemas.PaymentOrderResponse)
def get_order(
    order_id: str,
    db: Session = Depends(database.get_db),
):
    try:
        return get_payment_order(db, order_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.post(
    "/orders/{order_id}/mock-authorize",
    response_model=schemas.PaymentMockAuthorizeResponse,
)
def mock_authorize_order(
    order_id: str,
    db: Session = Depends(database.get_db),
):
    try:
        return create_mock_authorization(db, order_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.post("/verify", response_model=schemas.PaymentVerificationResponse)
def verify_order(
    payload: schemas.PaymentVerificationRequest,
    db: Session = Depends(database.get_db),
):
    try:
        return verify_payment_signature(db, payload)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
