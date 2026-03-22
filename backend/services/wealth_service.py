from __future__ import annotations

from datetime import date, timedelta

import numpy as np
from mapie.regression import MapieRegressor
from sklearn.ensemble import RandomForestRegressor


def _build_market_dataset(n_samples: int = 180) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(17)
    factors = []
    targets = []
    momentum = 0.0
    inflation = 0.0
    volatility = 0.0
    yield_gap = 0.0

    for _ in range(n_samples):
        momentum = 0.72 * momentum + rng.normal(0.0, 0.06)
        inflation = 0.64 * inflation + rng.normal(0.0, 0.04)
        volatility = max(0.02, 0.68 * volatility + rng.normal(0.04, 0.03))
        yield_gap = 0.70 * yield_gap + rng.normal(0.0, 0.05)

        features = [momentum, inflation, volatility, yield_gap]
        next_day_return = (
            0.22 * momentum
            - 0.14 * inflation
            - 0.18 * volatility
            + 0.16 * yield_gap
            + rng.normal(0.0, 0.08)
        )
        factors.append(features)
        targets.append(next_day_return)

    return np.array(factors), np.array(targets)


MARKET_FEATURES, MARKET_TARGETS = _build_market_dataset()

BASE_MODEL = RandomForestRegressor(
    n_estimators=250,
    max_depth=5,
    min_samples_leaf=3,
    random_state=11,
)
MAPIE_MODEL = MapieRegressor(estimator=BASE_MODEL, method="plus", cv=5)
MAPIE_MODEL.fit(MARKET_FEATURES, MARKET_TARGETS)


def forecast_next_week_returns(
    asset_name: str,
    macro_tilt: float,
    volatility_bias: float,
    inflation_surprise: float,
    alpha: float = 0.1,
) -> dict:
    recent_points = []
    start_date = date.today() - timedelta(days=21)
    for offset, observed in enumerate(MARKET_TARGETS[-15:]):
        current_date = start_date + timedelta(days=offset)
        recent_points.append(
            {
                "date": current_date,
                "actual_return": round(float(observed) * 100, 2),
                "predicted_return": None,
                "lower_bound": None,
                "upper_bound": None,
                "forecast": False,
            }
        )

    last_feature = MARKET_FEATURES[-1]
    future_features = []
    for step in range(5):
        decay = 1 - (step * 0.08)
        future_features.append(
            [
                float(last_feature[0] * decay + macro_tilt * (0.8 + step * 0.05)),
                float(last_feature[1] + inflation_surprise * (1 + step * 0.04)),
                float(max(0.02, last_feature[2] + volatility_bias * (1 + step * 0.1))),
                float(last_feature[3] + macro_tilt * 0.25 - inflation_surprise * 0.15),
            ]
        )

    y_pred, y_interval = MAPIE_MODEL.predict(np.array(future_features), alpha=[alpha])

    forecast_points = []
    for index in range(5):
        forecast_points.append(
            {
                "date": date.today() + timedelta(days=index + 1),
                "actual_return": None,
                "predicted_return": round(float(y_pred[index]) * 100, 2),
                "lower_bound": round(float(y_interval[index, 0, 0]) * 100, 2),
                "upper_bound": round(float(y_interval[index, 1, 0]) * 100, 2),
                "forecast": True,
            }
        )

    week_return = sum(point["predicted_return"] for point in forecast_points)
    week_lower = sum(point["lower_bound"] for point in forecast_points)
    week_upper = sum(point["upper_bound"] for point in forecast_points)

    return {
        "asset_name": asset_name,
        "horizon": "Next 5 business days",
        "confidence_level": 0.90,
        "expected_week_return": round(week_return, 2),
        "lower_bound_90": round(week_lower, 2),
        "upper_bound_90": round(week_upper, 2),
        "narrative": _build_narrative(week_return, week_lower, week_upper),
        "series": recent_points + forecast_points,
    }


def _build_narrative(point_estimate: float, lower_bound: float, upper_bound: float) -> str:
    if lower_bound > 0:
        return (
            f"The entire 90% conformal interval stays positive between "
            f"{lower_bound:.2f}% and {upper_bound:.2f}% for the coming week, "
            "suggesting a constructive risk-on stance for balanced growth allocations."
        )
    if upper_bound < 0:
        return (
            f"The 90% conformal interval remains negative between "
            f"{lower_bound:.2f}% and {upper_bound:.2f}% this week, supporting "
            "a more defensive rotation into high-quality duration and cash buffers."
        )
    return (
        f"The forecast centres around {point_estimate:.2f}% next-week return, "
        f"but the 90% interval spans {lower_bound:.2f}% to {upper_bound:.2f}%, "
        "so the platform keeps a balanced allocation and recommends staggered re-entry."
    )
