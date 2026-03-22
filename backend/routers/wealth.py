from fastapi import APIRouter

import schemas
from services.wealth_service import forecast_next_week_returns

router = APIRouter(prefix="/api/wealth", tags=["wealth"])


@router.post("/predict", response_model=schemas.WealthForecastResponse)
def predict_returns(request: schemas.WealthForecastRequest):
    return forecast_next_week_returns(
        asset_name=request.asset_name,
        macro_tilt=request.macro_tilt,
        volatility_bias=request.volatility_bias,
        inflation_surprise=request.inflation_surprise,
    )
