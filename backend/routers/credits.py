from fastapi import APIRouter, Depends  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy import or_, select  # type: ignore

import models  # type: ignore
import database  # type: ignore
from services.credit_service import CREDIT_ENGINE  # type: ignore

router = APIRouter(prefix="/api/credits", tags=["Credits"])

@router.get("/predict/{user_id}")
def predict_credit_card(user_id: int, db: Session = Depends(database.get_db)):
    user = db.get(models.User, user_id)
    if not user:
        return CREDIT_ENGINE._generate_fallback()
        
    account_ids = [account.id for account in getattr(user, "accounts", [])]
    if not account_ids:
        return CREDIT_ENGINE._generate_fallback()
        
    transactions = list(
        db.scalars(
            select(models.Transaction)
            .where(
                or_(
                    models.Transaction.from_account_id.in_(account_ids),
                    models.Transaction.to_account_id.in_(account_ids),
                )
            )
            .order_by(models.Transaction.booked_at.desc())
            .limit(100)
        ).all()
    )
    
    return CREDIT_ENGINE.predict_credit_card(transactions)
