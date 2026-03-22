"""
Investments router — SIP, Mutual Funds, portfolio holdings, and rebalancing.
"""
from __future__ import annotations

import random
import uuid
from datetime import date, datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException  # type: ignore
from pydantic import BaseModel, Field
from sqlalchemy import select  # type: ignore
from sqlalchemy.orm import Session  # type: ignore

import database  # type: ignore
import models  # type: ignore

router = APIRouter(prefix="/api/investments", tags=["investments"])

# ---------------------------------------------------------------------------
# In-memory stores (persist for server session)
# ---------------------------------------------------------------------------
_SIP_STORE: dict[str, dict] = {}
_MF_STORE: dict[str, dict] = {}

# ---------------------------------------------------------------------------
# Fund catalog — realistic mock data
# ---------------------------------------------------------------------------
FUND_CATALOG = [
    {
        "fund_id": "FND-Aura-ESG-001",
        "name": "Aura ESG Leaders Fund",
        "category": "Equity - ESG",
        "risk": "Moderate",
        "nav": 42.75,
        "ytd_return": 14.2,
        "one_yr_return": 18.5,
        "three_yr_return": 11.8,
        "esg_score": 87,
        "min_sip": 1000,
        "min_lumpsum": 5000,
    },
    {
        "fund_id": "FND-Aura-LGCAP-002",
        "name": "Aura Large Cap Fund",
        "category": "Equity - Large Cap",
        "risk": "Moderate",
        "nav": 88.12,
        "ytd_return": 12.1,
        "one_yr_return": 16.3,
        "three_yr_return": 13.4,
        "esg_score": 72,
        "min_sip": 500,
        "min_lumpsum": 5000,
    },
    {
        "fund_id": "FND-Aura-SMCAP-003",
        "name": "Aura Small Cap Opportunities",
        "category": "Equity - Small Cap",
        "risk": "High",
        "nav": 29.44,
        "ytd_return": 22.8,
        "one_yr_return": 31.2,
        "three_yr_return": 19.7,
        "esg_score": 58,
        "min_sip": 1000,
        "min_lumpsum": 10000,
    },
    {
        "fund_id": "FND-Aura-BOND-004",
        "name": "Aura Corporate Bond Fund",
        "category": "Debt - Corporate Bond",
        "risk": "Low",
        "nav": 15.91,
        "ytd_return": 7.1,
        "one_yr_return": 8.4,
        "three_yr_return": 6.9,
        "esg_score": 65,
        "min_sip": 500,
        "min_lumpsum": 5000,
    },
    {
        "fund_id": "FND-Aura-BAL-005",
        "name": "Aura Balanced Advantage Fund",
        "category": "Hybrid",
        "risk": "Moderate",
        "nav": 61.30,
        "ytd_return": 10.5,
        "one_yr_return": 13.7,
        "three_yr_return": 10.2,
        "esg_score": 70,
        "min_sip": 500,
        "min_lumpsum": 5000,
    },
    {
        "fund_id": "FND-Aura-INFRA-006",
        "name": "Aura Infrastructure Fund",
        "category": "Sectoral - Infrastructure",
        "risk": "High",
        "nav": 19.87,
        "ytd_return": 27.4,
        "one_yr_return": 35.1,
        "three_yr_return": 22.3,
        "esg_score": 61,
        "min_sip": 1000,
        "min_lumpsum": 10000,
    },
]

FUND_MAP = {f["fund_id"]: f for f in FUND_CATALOG}

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class SIPCreateRequest(BaseModel):
    user_id: int = 1
    fund_id: str
    monthly_amount: float = Field(gt=0)
    start_date: date | None = None
    horizon_months: int = Field(gt=0, le=360)
    linked_account_id: int | None = None
    verified_documents: list[str] = []


class SIPCreateResponse(BaseModel):
    sip_id: str
    fund_id: str
    fund_name: str
    monthly_amount: float
    horizon_months: int
    start_date: str
    projected_value: float
    projected_returns: float
    status: str
    missing_documents: list[str]


class SIPTriggerResponse(BaseModel):
    sip_id: str
    installment_number: int
    amount_debited: float
    units_allotted: float
    current_nav: float
    total_units: float
    total_invested: float
    current_value: float
    account_balance_after: float | None
    message: str


class MFBuyRequest(BaseModel):
    user_id: int = 1
    fund_id: str
    amount: float = Field(gt=0)
    linked_account_id: int | None = None
    verified_documents: list[str] = []


class MFBuyResponse(BaseModel):
    transaction_id: str
    fund_id: str
    fund_name: str
    amount: float
    nav: float
    units: float
    account_balance_after: float | None
    message: str


class HoldingItem(BaseModel):
    fund_id: str
    fund_name: str
    category: str
    units: float
    avg_nav: float
    current_nav: float
    invested: float
    current_value: float
    pnl: float
    pnl_pct: float
    via: str


class PortfolioResponse(BaseModel):
    user_id: int
    total_invested: float
    current_value: float
    total_pnl: float
    total_pnl_pct: float
    holdings: list[HoldingItem]


class RebalanceResponse(BaseModel):
    user_id: int
    suggested_allocation: list[dict]
    rationale: list[str]
    confidence_pct: float


# ---------------------------------------------------------------------------
# Required documents for investment
# ---------------------------------------------------------------------------
INVEST_REQUIRED_DOCS = ["KYC", "PAN"]
INVEST_DOC_SAMPLES = {"KYC": "KYC-PREM-1001", "PAN": "PAN-ABCDE1234F"}


def _projected_value(monthly: float, months: int, annual_rate: float) -> float:
    r = annual_rate / 100 / 12
    if r == 0:
        return monthly * months
    return monthly * ((1 + r) ** months - 1) / r * (1 + r)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.get("/funds")
def list_funds():
    return FUND_CATALOG


@router.post("/sip/create", response_model=SIPCreateResponse)
def create_sip(body: SIPCreateRequest):
    fund = FUND_MAP.get(body.fund_id)
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")

    missing = [d for d in INVEST_REQUIRED_DOCS if d not in body.verified_documents]
    status = "ACTIVE" if not missing else "PENDING_KYC"

    projected = _projected_value(float(body.monthly_amount), int(body.horizon_months), float(fund["one_yr_return"])) # type: ignore
    invested = body.monthly_amount * body.horizon_months

    sip_id = f"SIP-{str(uuid.uuid4())[:8].upper()}"
    record = {
        "sip_id": sip_id,
        "user_id": body.user_id,
        "fund_id": body.fund_id,
        "fund_name": fund["name"],
        "monthly_amount": body.monthly_amount,
        "horizon_months": body.horizon_months,
        "start_date": str(body.start_date or date.today()),
        "projected_value": round(float(projected), 2), # type: ignore
        "projected_returns": round(float(projected - invested), 2), # type: ignore
        "status": status,
        "missing_documents": missing,
        "installments_done": 0,
        "total_units": 0.0,
        "total_invested": 0.0,
        "linked_account_id": body.linked_account_id,
    }
    _SIP_STORE[sip_id] = record
    return SIPCreateResponse(**record)


@router.post("/sip/{sip_id}/trigger", response_model=SIPTriggerResponse)
def trigger_sip(sip_id: str, db: Session = Depends(database.get_db)):
    sip = _SIP_STORE.get(sip_id)
    if not sip:
        raise HTTPException(status_code=404, detail="SIP not found")
    if sip["status"] not in ("ACTIVE",):
        raise HTTPException(status_code=400, detail=f"SIP is {sip['status']}; complete KYC to activate.")

    fund = FUND_MAP.get(sip["fund_id"])
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")

    # Simulate slight NAV movement
    live_nav = round(fund["nav"] * (1 + random.uniform(-0.005, 0.012)), 4)
    units = round(sip["monthly_amount"] / live_nav, 4)

    acct_balance_after = None
    if sip.get("linked_account_id"):
        account = db.scalar(select(models.Account).where(models.Account.id == sip["linked_account_id"]))
        if account:
            if float(account.available_balance) < sip["monthly_amount"]:
                raise HTTPException(status_code=400, detail="Insufficient funds in linked account")
            account.available_balance = float(account.available_balance) - sip["monthly_amount"]
            account.current_balance = float(account.current_balance) - sip["monthly_amount"]
            db.commit()
            acct_balance_after = round(float(account.available_balance), 2)

    sip["installments_done"] += 1
    sip["total_units"] = round(sip["total_units"] + units, 4)
    sip["total_invested"] = round(sip["total_invested"] + sip["monthly_amount"], 2)
    current_value = round(sip["total_units"] * live_nav, 2)

    # Store as a holding
    holding_key = f"SIP-{sip_id}-{sip['fund_id']}"
    _MF_STORE[holding_key] = {
        "fund_id": sip["fund_id"],
        "fund_name": fund["name"],
        "category": fund["category"],
        "units": sip["total_units"],
        "avg_nav": round(sip["total_invested"] / sip["total_units"], 4) if sip["total_units"] > 0 else live_nav,
        "current_nav": live_nav,
        "invested": sip["total_invested"],
        "current_value": current_value,
        "pnl": round(float(current_value - sip["total_invested"]), 2), # type: ignore
        "pnl_pct": round(float((current_value - sip["total_invested"]) / sip["total_invested"] * 100), 2) if sip["total_invested"] > 0 else 0, # type: ignore
        "via": "SIP",
    }

    return SIPTriggerResponse(
        sip_id=sip_id,
        installment_number=sip["installments_done"],
        amount_debited=sip["monthly_amount"],
        units_allotted=units,
        current_nav=live_nav,
        total_units=sip["total_units"],
        total_invested=sip["total_invested"],
        current_value=current_value,
        account_balance_after=acct_balance_after,
        message=f"Instalment #{sip['installments_done']} processed. {units} units allotted at NAV {live_nav}.",
    )


@router.post("/mf/buy", response_model=MFBuyResponse)
def buy_mf(body: MFBuyRequest, db: Session = Depends(database.get_db)):
    fund = FUND_MAP.get(body.fund_id)
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")

    missing = [d for d in INVEST_REQUIRED_DOCS if d not in body.verified_documents]
    if missing:
        raise HTTPException(status_code=400, detail=f"Complete KYC/PAN verification first. Missing: {missing}")

    live_nav = round(fund["nav"] * (1 + random.uniform(-0.005, 0.012)), 4)
    units = round(body.amount / live_nav, 4)

    acct_balance_after = None
    if body.linked_account_id:
        account = db.scalar(select(models.Account).where(models.Account.id == body.linked_account_id))
        if account:
            if float(account.available_balance) < body.amount:
                raise HTTPException(status_code=400, detail="Insufficient funds")
            account.available_balance = float(account.available_balance) - body.amount
            account.current_balance = float(account.current_balance) - body.amount
            db.commit()
            acct_balance_after = round(float(account.available_balance), 2)

    txn_id = f"MF-{str(uuid.uuid4())[:8].upper()}"
    holding_key = f"MF-{txn_id}-{body.fund_id}"
    current_value = round(units * live_nav, 2)
    _MF_STORE[holding_key] = {
        "fund_id": body.fund_id,
        "fund_name": fund["name"],
        "category": fund["category"],
        "units": units,
        "avg_nav": live_nav,
        "current_nav": live_nav,
        "invested": body.amount,
        "current_value": current_value,
        "pnl": 0.0,
        "pnl_pct": 0.0,
        "via": "Lump Sum",
    }

    return MFBuyResponse(
        transaction_id=txn_id,
        fund_id=body.fund_id,
        fund_name=fund["name"],
        amount=body.amount,
        nav=live_nav,
        units=units,
        account_balance_after=acct_balance_after,
        message=f"Purchase successful. {units} units of {fund['name']} allotted at NAV ₹{live_nav}.",
    )


@router.get("/{user_id}/holdings", response_model=PortfolioResponse)
def get_holdings(user_id: int):
    holdings = []
    total_invested = 0.0
    total_value = 0.0

    for h in _MF_STORE.values():
        fund = FUND_MAP.get(h["fund_id"])
        live_nav = round((fund["nav"] if fund else h["current_nav"]) * (1 + random.uniform(-0.003, 0.008)), 4)
        current_value = round(h["units"] * live_nav, 2)
        pnl = round(current_value - h["invested"], 2)
        pnl_pct = round(pnl / h["invested"] * 100, 2) if h["invested"] > 0 else 0

        holdings.append(HoldingItem(
            fund_id=h["fund_id"],
            fund_name=h["fund_name"],
            category=h["category"],
            units=h["units"],
            avg_nav=h["avg_nav"],
            current_nav=live_nav,
            invested=h["invested"],
            current_value=current_value,
            pnl=pnl,
            pnl_pct=pnl_pct,
            via=h["via"],
        ))
        total_invested += h["invested"]
        total_value += current_value

    total_pnl = round(total_value - total_invested, 2)
    total_pnl_pct = round(total_pnl / total_invested * 100, 2) if total_invested > 0 else 0

    return PortfolioResponse(
        user_id=user_id,
        total_invested=round(total_invested, 2),
        current_value=round(total_value, 2),
        total_pnl=total_pnl,
        total_pnl_pct=total_pnl_pct,
        holdings=holdings,
    )


@router.post("/{user_id}/rebalance", response_model=RebalanceResponse)
def rebalance(user_id: int):
    """Suggest a portfolio rebalancing based on ESG scores and risk profile."""
    import random as rnd  # local import to avoid name collision

    suggestions = [
        {"fund_id": "FND-Aura-ESG-001", "name": "Aura ESG Leaders", "suggested_weight": 35, "current_weight": 20, "action": "INCREASE"},
        {"fund_id": "FND-Aura-LGCAP-002", "name": "Aura Large Cap", "suggested_weight": 30, "current_weight": 35, "action": "REDUCE"},
        {"fund_id": "FND-Aura-BAL-005", "name": "Aura Balanced Advantage", "suggested_weight": 20, "current_weight": 15, "action": "INCREASE"},
        {"fund_id": "FND-Aura-BOND-004", "name": "Aura Corporate Bond", "suggested_weight": 15, "current_weight": 30, "action": "REDUCE"},
    ]

    rationale = [
        "Increasing ESG allocation aligns with Paris Agreement targets and reduces regulatory risk.",
        "Large cap overweight relative to benchmark — trimming to restore factor balance.",
        "Balanced Advantage provides downside protection given current macro uncertainty.",
        "Debt allocation above optimal level for moderate-risk risk profile; moving to equity.",
    ]

    return RebalanceResponse(
        user_id=user_id,
        suggested_allocation=suggestions,
        rationale=rationale,
        confidence_pct=round(rnd.uniform(78, 94), 1),
    )
