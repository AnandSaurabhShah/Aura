from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

import database
import models
import schemas

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


def _load_user(db: Session, user_id: int) -> models.User:
    user = db.scalar(
        select(models.User)
        .options(
            selectinload(models.User.accounts),
            selectinload(models.User.credit_cards),
            selectinload(models.User.loans),
            selectinload(models.User.investments),
        )
        .where(models.User.id == user_id)
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _load_account(db: Session, account_id: int) -> models.Account:
    account = db.scalar(select(models.Account).where(models.Account.id == account_id))
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(database.get_db)):
    return _load_user(db, user_id)


@router.get("/{account_id}", response_model=schemas.AccountResponse)
def get_account(account_id: int, db: Session = Depends(database.get_db)):
    return _load_account(db, account_id)


@router.get(
    "/{account_id}/transactions",
    response_model=list[schemas.TransactionResponse],
)
def get_account_transactions(account_id: int, db: Session = Depends(database.get_db)):
    _load_account(db, account_id)
    statement = (
        select(models.Transaction)
        .where(
            or_(
                models.Transaction.from_account_id == account_id,
                models.Transaction.to_account_id == account_id,
            )
        )
        .order_by(models.Transaction.booked_at.desc())
        .limit(20)
    )
    return list(db.scalars(statement).all())


@router.post(
    "/{account_id}/deposit",
    response_model=schemas.TransactionResponse,
)
def deposit(
    account_id: int,
    request: schemas.AccountFundingRequest,
    db: Session = Depends(database.get_db),
):
    account = _load_account(db, account_id)

    account.current_balance = float(account.current_balance) + request.amount
    account.available_balance = float(account.available_balance) + request.amount
    transaction = models.Transaction(
        reference=f"DEP{account_id}{int(datetime.utcnow().timestamp())}",
        to_account_id=account.id,
        amount=request.amount,
        currency=request.currency.upper(),
        direction="CREDIT",
        transaction_type="TRANSFER",
        narration=request.narration,
        status="BOOKED",
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.post(
    "/{account_id}/withdraw",
    response_model=schemas.TransactionResponse,
)
def withdraw(
    account_id: int,
    request: schemas.AccountFundingRequest,
    db: Session = Depends(database.get_db),
):
    account = _load_account(db, account_id)
    if float(account.available_balance) < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient available balance")

    account.current_balance = float(account.current_balance) - request.amount
    account.available_balance = float(account.available_balance) - request.amount
    transaction = models.Transaction(
        reference=f"WDL{account_id}{int(datetime.utcnow().timestamp())}",
        from_account_id=account.id,
        amount=request.amount,
        currency=request.currency.upper(),
        direction="DEBIT",
        transaction_type="ATM",
        narration=request.narration,
        status="BOOKED",
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.post("/transfer", response_model=schemas.TransactionResponse)
def transfer(
    request: schemas.TransferRequest,
    db: Session = Depends(database.get_db),
):
    sender = _load_account(db, request.from_account_id)
    receiver = _load_account(db, request.to_account_id)

    if float(sender.available_balance) < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient available balance")

    sender.current_balance = float(sender.current_balance) - request.amount
    sender.available_balance = float(sender.available_balance) - request.amount
    receiver.current_balance = float(receiver.current_balance) + request.amount
    receiver.available_balance = float(receiver.available_balance) + request.amount

    transaction = models.Transaction(
        reference=f"TRF{sender.id}{receiver.id}{int(datetime.utcnow().timestamp())}",
        from_account_id=sender.id,
        to_account_id=receiver.id,
        amount=request.amount,
        currency=request.currency.upper(),
        direction="TRANSFER",
        transaction_type="TRANSFER",
        narration=request.narration,
        status="BOOKED",
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction
