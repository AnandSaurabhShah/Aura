from __future__ import annotations

from datetime import datetime, timezone
from math import sin

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

import models


BASE_QUOTES = {
    "USD/INR": 83.12,
    "GBP/INR": 107.55,
    "EUR/INR": 90.42,
    "AED/INR": 22.64,
    "SGD/INR": 61.73,
}


def _to_float(value) -> float:
    return round(float(value), 2)


def generate_fx_quotes() -> list[dict]:
    now = datetime.now(timezone.utc)
    minute_anchor = now.hour * 60 + now.minute
    quotes = []

    for index, (pair, base_rate) in enumerate(BASE_QUOTES.items(), start=1):
        wave = sin((minute_anchor / 11.0) + index)
        rate = round(base_rate + wave * base_rate * 0.0018, 4)
        move_percent = round(((rate - base_rate) / base_rate) * 100, 3)
        quotes.append(
            {
                "pair": pair,
                "rate": rate,
                "spread_bps": round(7.5 + index * 1.6, 2),
                "move_percent": move_percent,
                "as_of": now,
            }
        )
    return quotes


def build_dashboard_overview(db: Session, user_id: int) -> dict:
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
        raise ValueError("User not found")

    account_ids = [account.id for account in user.accounts]
    recent_transactions = list(
        db.scalars(
            select(models.Transaction)
            .where(
                or_(
                    models.Transaction.from_account_id.in_(account_ids),
                    models.Transaction.to_account_id.in_(account_ids),
                )
            )
            .order_by(models.Transaction.booked_at.desc())
            .limit(12)
        ).all()
    )

    total_deposits = sum(_to_float(account.current_balance) for account in user.accounts)
    total_available_cash = sum(
        _to_float(account.available_balance) for account in user.accounts
    )
    total_credit_limit = sum(
        _to_float(card.credit_limit) for card in user.credit_cards
    )
    total_investments = sum(
        _to_float(portfolio.market_value) for portfolio in user.investments
    )
    total_outstanding_loans = sum(
        _to_float(loan.outstanding_principal) for loan in user.loans
    )
    travel_rewards_points = sum(
        _to_float(card.reward_points) for card in user.credit_cards
    )

    alerts = [
        {
            "title": "Premier family banking ready",
            "detail": "Link family members to extend Premier status and relationship pricing.",
            "severity": "success",
        },
        {
            "title": "Video KYC reusable",
            "detail": "Your digital identity check is approved and can support faster product fulfilment.",
            "severity": "info",
        },
    ]

    if any(_to_float(loan.outstanding_principal) > 10000000 for loan in user.loans):
        alerts.append(
            {
                "title": "Home finance review due",
                "detail": "Your Smart Home DLOD crosses the annual review threshold this quarter.",
                "severity": "warning",
            }
        )

    return {
        "user": user,
        "summary": {
            "total_deposits": round(total_deposits, 2),
            "total_available_cash": round(total_available_cash, 2),
            "total_credit_limit": round(total_credit_limit, 2),
            "total_investments": round(total_investments, 2),
            "total_outstanding_loans": round(total_outstanding_loans, 2),
            "travel_rewards_points": round(travel_rewards_points, 2),
        },
        "accounts": user.accounts,
        "credit_cards": user.credit_cards,
        "loans": user.loans,
        "investments": user.investments,
        "recent_transactions": recent_transactions,
        "fx_quotes": generate_fx_quotes(),
        "alerts": alerts,
    }
