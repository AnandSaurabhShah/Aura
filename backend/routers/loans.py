"""
Loans router — full E2E loan lifecycle:
  - Apply for a loan (home, personal, LAP)
  - Get amortization schedule
  - Pay one EMI (deducts from linked account, updates outstanding)
"""
from __future__ import annotations

import math
import uuid
from datetime import date, datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException  # type: ignore
from pydantic import BaseModel, Field
from sqlalchemy import select  # type: ignore
from sqlalchemy.orm import Session  # type: ignore

import database  # type: ignore
import models  # type: ignore

router = APIRouter(prefix="/api/loans", tags=["loans"])

# ---------------------------------------------------------------------------
# In-memory loan application store (persists for the server session)
# ---------------------------------------------------------------------------
_LOAN_STORE: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Pydantic models (local — not in schemas.py to keep changes minimal)
# ---------------------------------------------------------------------------
class LoanApplyRequest(BaseModel):
    user_id: int = 1
    loan_type: Literal["HOME_LOAN", "LAP", "PERSONAL_LOAN", "EDUCATION_LOAN", "CAR_LOAN"] = "PERSONAL_LOAN"
    principal: float = Field(gt=0)
    tenure_months: int = Field(gt=0, le=360)
    interest_rate: float = Field(gt=0, le=50)   # annual %
    purpose: str = "General"
    linked_account_id: int | None = None
    verified_documents: list[str] = []          # verified doc IDs


class LoanApplyResponse(BaseModel):
    application_id: str
    loan_type: str
    principal: float
    tenure_months: int
    interest_rate: float
    monthly_emi: float
    total_payable: float
    total_interest: float
    purpose: str
    status: str
    applied_at: str
    missing_documents: list[str]


class EMIRow(BaseModel):
    month: int
    emi: float
    principal_component: float
    interest_component: float
    outstanding: float


class LoanScheduleResponse(BaseModel):
    application_id: str
    loan_type: str
    monthly_emi: float
    schedule: list[EMIRow]


class EMIPayResponse(BaseModel):
    application_id: str
    month_paid: int
    emi_paid: float
    outstanding_after: float
    account_balance_after: float | None
    message: str


# ---------------------------------------------------------------------------
# Required documents per loan type
# ---------------------------------------------------------------------------
LOAN_REQUIRED_DOCS: dict[str, list[str]] = {
    "HOME_LOAN": ["KYC", "INCOME_PROOF", "BANK_STATEMENT", "PROPERTY_VALUATION"],
    "LAP": ["KYC", "INCOME_PROOF", "BANK_STATEMENT", "PROPERTY_VALUATION"],
    "PERSONAL_LOAN": ["KYC", "INCOME_PROOF", "BANK_STATEMENT"],
    "EDUCATION_LOAN": ["KYC", "INCOME_PROOF", "PURPOSE_DOCUMENT"],
    "CAR_LOAN": ["KYC", "INCOME_PROOF", "BANK_STATEMENT"],
}

# Friendly sample IDs for required doc types
LOAN_DOC_SAMPLES: dict[str, str] = {
    "KYC": "KYC-PREM-1001",
    "INCOME_PROOF": "INCM-SAL-7731",
    "BANK_STATEMENT": "STMT-6M-2024",
    "PROPERTY_VALUATION": "PROP-VAL-8801",
    "PURPOSE_DOCUMENT": "PSUP-EDU-4421",
}


def _compute_emi(principal: float, annual_rate: float, months: int) -> float:
    r = annual_rate / 100 / 12
    if r == 0:
        return principal / months
    return principal * r * (1 + r) ** months / ((1 + r) ** months - 1)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.post("/apply", response_model=LoanApplyResponse)
def apply_loan(body: LoanApplyRequest):
    emi = _compute_emi(body.principal, body.interest_rate, body.tenure_months)
    total_payable = round(emi * body.tenure_months, 2)
    total_interest = round(total_payable - body.principal, 2)

    required = LOAN_REQUIRED_DOCS.get(body.loan_type, ["KYC"])
    missing = [d for d in required if d not in body.verified_documents]

    status = "PENDING_DOCUMENTS" if missing else "APPROVED"

    app_id = f"LOAN-{body.loan_type[:3]}-{str(uuid.uuid4())[:8].upper()}"
    record = {
        "application_id": app_id,
        "loan_type": body.loan_type,
        "principal": body.principal,
        "tenure_months": body.tenure_months,
        "interest_rate": body.interest_rate,
        "monthly_emi": round(emi, 2),
        "total_payable": total_payable,
        "total_interest": total_interest,
        "purpose": body.purpose,
        "status": status,
        "applied_at": datetime.utcnow().isoformat(),
        "missing_documents": missing,
        "emis_paid": 0,
        "outstanding": body.principal,
        "linked_account_id": body.linked_account_id,
        "required_docs": required,
        "verified_documents": body.verified_documents,
    }
    _LOAN_STORE[app_id] = record
    return LoanApplyResponse(**record)


@router.get("/required-documents/{loan_type}")
def loan_required_docs(loan_type: str):
    required = LOAN_REQUIRED_DOCS.get(loan_type.upper(), ["KYC"])
    return [
        {"doc_type": d, "sample_id": LOAN_DOC_SAMPLES.get(d, "")} for d in required
    ]


@router.get("/{application_id}/schedule", response_model=LoanScheduleResponse)
def get_schedule(application_id: str):
    loan = _LOAN_STORE.get(application_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan application not found")

    r = loan["interest_rate"] / 100 / 12
    emi = loan["monthly_emi"]
    outstanding = loan["principal"]
    schedule: list[EMIRow] = []

    for month in range(1, loan["tenure_months"] + 1):
        interest = round(outstanding * r, 2)
        principal = round(emi - interest, 2)
        outstanding = round(outstanding - principal, 2)
        if outstanding < 0:
            outstanding = 0.0
        schedule.append(EMIRow(
            month=month,
            emi=round(emi, 2),
            principal_component=principal,
            interest_component=interest,
            outstanding=outstanding,
        ))

    return LoanScheduleResponse(
        application_id=application_id,
        loan_type=loan["loan_type"],
        monthly_emi=loan["monthly_emi"],
        schedule=schedule,
    )


@router.post("/{application_id}/pay-emi", response_model=EMIPayResponse)
def pay_emi(
    application_id: str,
    linked_account_id: int | None = None,
    db: Session = Depends(database.get_db),
):
    loan = _LOAN_STORE.get(application_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan application not found")
    if loan["outstanding"] <= 0:
        raise HTTPException(status_code=400, detail="Loan is already fully paid")
    if loan["status"] not in ("APPROVED", "ACTIVE"):
        raise HTTPException(status_code=400, detail=f"Loan status is {loan['status']}; cannot pay EMI")

    emi = loan["monthly_emi"]
    acct_id = linked_account_id or loan.get("linked_account_id")

    # Deduct from bank account if linked
    account_balance_after = None
    if acct_id:
        account = db.scalar(select(models.Account).where(models.Account.id == acct_id))
        if account:
            if float(account.available_balance) < emi:
                raise HTTPException(status_code=400, detail="Insufficient funds in linked account")
            account.available_balance = float(account.available_balance) - emi
            account.current_balance = float(account.current_balance) - emi
            db.commit()
            account_balance_after = round(float(account.available_balance), 2)

    # Update outstanding
    r = loan["interest_rate"] / 100 / 12
    interest = round(loan["outstanding"] * r, 2)
    principal = round(emi - interest, 2)
    loan["outstanding"] = max(0.0, round(loan["outstanding"] - principal, 2))
    loan["emis_paid"] = loan["emis_paid"] + 1
    loan["status"] = "ACTIVE" if loan["outstanding"] > 0 else "CLOSED"

    return EMIPayResponse(
        application_id=application_id,
        month_paid=loan["emis_paid"],
        emi_paid=emi,
        outstanding_after=loan["outstanding"],
        account_balance_after=account_balance_after,
        message="EMI paid successfully." if loan["outstanding"] > 0 else "🎉 Loan fully repaid!",
    )


@router.get("/applications/{user_id}")
def list_applications(user_id: int):
    """Return all loan applications for a user (all in session store for now)."""
    return [v for v in _LOAN_STORE.values()]
