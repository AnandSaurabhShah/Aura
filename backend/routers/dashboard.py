from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import database
import schemas
from services.dashboard_service import build_dashboard_overview, generate_fx_quotes

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get(
    "/overview/{user_id}",
    response_model=schemas.DashboardOverviewResponse,
)
def get_dashboard_overview(
    user_id: int,
    db: Session = Depends(database.get_db),
):
    try:
        return build_dashboard_overview(db, user_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/fx/quotes", response_model=list[schemas.FxQuote])
def get_fx_quotes():
    return generate_fx_quotes()
