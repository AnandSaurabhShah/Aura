from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

import database
import models
import schemas
from services.esg_service import recommend_esg_portfolio

router = APIRouter(prefix="/api/esg", tags=["esg"])


@router.get("/recommend/{user_id}", response_model=schemas.ESGResponse)
def get_esg_recommendation(
    user_id: int,
    db: Session = Depends(database.get_db),
):
    accounts = list(
        db.scalars(select(models.Account).where(models.Account.user_id == user_id)).all()
    )
    portfolios = list(
        db.scalars(
            select(models.InvestmentPortfolio).where(
                models.InvestmentPortfolio.user_id == user_id
            )
        ).all()
    )
    if not accounts:
        raise HTTPException(status_code=404, detail="User accounts not found")

    account_ids = [account.id for account in accounts]
    transactions = list(
        db.scalars(
            select(models.Transaction)
            .where(models.Transaction.from_account_id.in_(account_ids))
            .order_by(models.Transaction.booked_at.desc())
        ).all()
    )

    return recommend_esg_portfolio(transactions, portfolios)
