from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import IsolationForest
from sklearn.neural_network import MLPRegressor


@dataclass(frozen=True)
class MerchantCarbonProfile:
    category: str
    factor: float


MCC_CARBON_FACTORS: dict[str, MerchantCarbonProfile] = {
    "5411": MerchantCarbonProfile("Groceries", 0.12),
    "5541": MerchantCarbonProfile("Fuel", 0.62),
    "4121": MerchantCarbonProfile("Transit", 0.08),
    "4511": MerchantCarbonProfile("Air Travel", 0.93),
    "4814": MerchantCarbonProfile("Telecom", 0.05),
    "4829": MerchantCarbonProfile("Remittance", 0.03),
    "5812": MerchantCarbonProfile("Dining", 0.24),
    "7832": MerchantCarbonProfile("Entertainment", 0.11),
    "5964": MerchantCarbonProfile("Retail", 0.19),
    "6211": MerchantCarbonProfile("Investments", 0.02),
}
DEFAULT_PROFILE = MerchantCarbonProfile("Unclassified", 0.15)

FUND_CATALOG = {
    0: {
        "fund_code": "Aura-SUS-EQ",
        "name": "Aura Sustainable Equity Fund",
        "thesis": "Balanced sustainability leaders across global sectors.",
        "risk_profile": "Balanced",
    },
    1: {
        "fund_code": "Aura-CLEAN-EN",
        "name": "Aura Clean Energy Impact Fund",
        "thesis": "Higher-beta exposure to renewable and transition themes.",
        "risk_profile": "Growth",
    },
    2: {
        "fund_code": "Aura-GRN-BOND",
        "name": "Aura Green Bond Income Fund",
        "thesis": "Lower-volatility allocation for investors reducing footprint.",
        "risk_profile": "Conservative",
    },
    3: {
        "fund_code": "Aura-CIRC-ECO",
        "name": "Aura Circular Economy Fund",
        "thesis": "Captures waste, water and industrial efficiency transition.",
        "risk_profile": "Balanced",
    },
}


def _train_xgboost_model() -> xgb.XGBClassifier:
    rng = np.random.default_rng(42)
    rows: list[list[float]] = []
    labels: list[int] = []

    for _ in range(320):
        monthly_spend = float(rng.uniform(25000, 480000))
        carbon_intensity = float(rng.uniform(0.04, 0.7))
        travel_share = float(rng.uniform(0.0, 0.45))
        fuel_share = float(rng.uniform(0.0, 0.30))
        portfolio_esg = float(rng.uniform(45, 90))
        total_carbon = monthly_spend * carbon_intensity / 100

        rows.append(
            [
                total_carbon,
                monthly_spend,
                carbon_intensity,
                travel_share,
                fuel_share,
                portfolio_esg,
            ]
        )

        if carbon_intensity < 0.13 and portfolio_esg < 70:
            labels.append(0)
        elif travel_share > 0.22 or fuel_share > 0.18:
            labels.append(1)
        elif carbon_intensity < 0.11 and monthly_spend < 180000:
            labels.append(2)
        else:
            labels.append(3)

    model = xgb.XGBClassifier(
        objective="multi:softprob",
        num_class=len(FUND_CATALOG),
        n_estimators=80,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="mlogloss",
        random_state=42,
    )
    model.fit(np.array(rows), np.array(labels))
    return model


XGB_MODEL = _train_xgboost_model()


class QLearningCarbonAgent:
    """Simulated RL Agent to optimize user's carbon reductions over time."""
    def __init__(self):
        # Q-table simulating learned category-based emission multipliers
        # Green categories get rewarded with a discount to final emission impact
        # High-carbon categories receive a penalty (value > 1.0)
        self.q_table: dict[str, float] = {
            "Transit": 0.85,       # 15% discount for public transit
            "Groceries": 0.95,
            "Fuel": 1.15,          # 15% penalty
            "Air Travel": 1.25,    # 25% penalty
            "Investments": 0.90,
        }

    def get_discount_factor(self, category: str) -> float:
        return self.q_table.get(category, 1.0)


class AdvancedCarbonEngine:
    """Orchestrates ML, DL, and RL pipelines for carbon emission calculations."""
    ml_anomaly_detector: IsolationForest
    dl_emission_predictor: MLPRegressor
    
    def __init__(self):
        self._train_models()
        self.rl_agent = QLearningCarbonAgent()

    def _train_models(self):
        # 1. Synthesize training data matching real transaction shapes
        rng = np.random.default_rng(42)
        x_train = []
        y_train = []

        for _ in range(2000):
            amount = float(rng.uniform(10, 50000))
            factor = float(rng.uniform(0.01, 1.0))

            # Simulate base carbon reality with non-linear scaling for big amounts
            base_carbon = (amount * factor / 100) * (1.0 + np.log1p(amount)/10.0)

            x_train.append([amount, factor])
            y_train.append(base_carbon)

        x_train_arr = np.array(x_train)
        y_train_arr = np.array(y_train)

        # 2. Train IsolationForest (ML) for Anomaly Detection
        self.ml_anomaly_detector = IsolationForest(
            n_estimators=100, contamination=0.05, random_state=42
        )
        self.ml_anomaly_detector.fit(x_train_arr)

        # 3. Train MLPRegressor (DL) for Non-linear Base Carbon Prediction
        self.dl_emission_predictor = MLPRegressor(
            hidden_layer_sizes=(64, 32),
            activation='relu',
            solver='adam',
            max_iter=500,
            random_state=42
        )
        self.dl_emission_predictor.fit(x_train_arr, y_train_arr)

    def predict_carbon(self, amount: float, category: str, factor: float) -> float:
        features = np.array([[amount, factor]])

        # 1. Base prediction using DL (Multi-Layer Perceptron)
        base_prediction = float(self.dl_emission_predictor.predict(features)[0])
        base_prediction = max(0.0, base_prediction)

        # 2. Anomaly Detection via ML (Isolation Forest)
        # Returns 1 for normal, -1 for outliers
        anomaly_score = self.ml_anomaly_detector.predict(features)[0]
        anomaly_multiplier = 1.35 if anomaly_score == -1 else 1.0

        # 3. Reinforcement Learning Policy Optimization
        rl_discount = self.rl_agent.get_discount_factor(category)

        # Ensemble output
        return base_prediction * anomaly_multiplier * rl_discount

# Pre-train ensemble ML/DL models on startup
CARBON_ENGINE = AdvancedCarbonEngine()

def build_carbon_dataframe(transactions) -> pd.DataFrame:
    rows: list[dict[str, float | str]] = []
    for transaction in transactions:
        profile = MCC_CARBON_FACTORS.get(transaction.mcc_code or "", DEFAULT_PROFILE)
        amount = float(transaction.amount)
        
        # Advanced Carbon Calculation (ML + DL + RL)
        carbon_kg = round(CARBON_ENGINE.predict_carbon(amount, profile.category, profile.factor), 4)
        
        rows.append(
            {
                "reference": transaction.reference,
                "amount": amount,
                "category": profile.category,
                "factor": profile.factor,
                "carbon_kg": carbon_kg,
            }
        )
    return pd.DataFrame(rows)


def recommend_esg_portfolio(transactions, portfolios) -> dict:
    carbon_frame = build_carbon_dataframe(
        [transaction for transaction in transactions if float(transaction.amount) > 0]
    )
    if carbon_frame.empty:
        carbon_frame = pd.DataFrame(
            [
                {
                    "reference": "NONE",
                    "amount": 0.0,
                    "category": DEFAULT_PROFILE.category,
                    "factor": DEFAULT_PROFILE.factor,
                    "carbon_kg": 0.0,
                }
            ]
        )

    monthly_spend = float(carbon_frame["amount"].sum())
    total_carbon = float(carbon_frame["carbon_kg"].sum())
    carbon_intensity = total_carbon / monthly_spend if monthly_spend else 0.0

    grouped = (
        carbon_frame.groupby("category")
        .agg({"amount": "sum", "carbon_kg": "sum", "factor": "mean"})
        .reset_index()
        .sort_values("carbon_kg", ascending=False)
    )

    travel_spend = float(
        carbon_frame.loc[
            carbon_frame["category"].isin(["Air Travel", "Transit"]),
            "amount",
        ].sum()
    )
    fuel_spend = float(
        carbon_frame.loc[carbon_frame["category"] == "Fuel", "amount"].sum()
    )
    travel_share = travel_spend / monthly_spend if monthly_spend else 0.0
    fuel_share = fuel_spend / monthly_spend if monthly_spend else 0.0
    average_portfolio_esg = (
        sum(float(portfolio.esg_score) for portfolio in portfolios) / len(portfolios)
        if portfolios
        else 65.0
    )

    features = np.array(
        [
            [
                total_carbon,
                monthly_spend,
                carbon_intensity,
                travel_share,
                fuel_share,
                average_portfolio_esg,
            ]
        ]
    )
    probabilities = XGB_MODEL.predict_proba(features)[0]
    ranking = np.argsort(probabilities)[::-1]

    recommendations = []
    for fund_id in ranking[:3]:
        catalog_entry = FUND_CATALOG[int(fund_id)]
        recommendations.append(
            {
                **catalog_entry,
                "confidence": round(float(probabilities[int(fund_id)]) * 100, 2),
            }
        )

    primary = recommendations[0]
    rationale = [
        f"Mapped {len(carbon_frame)} transaction events into carbon factors using MCC codes.",
        f"Estimated monthly carbon load at {total_carbon:.2f} kg CO2e.",
        (
            "Travel and fuel intensity remains elevated, so the model tilts toward "
            "transition-oriented strategies."
            if travel_share + fuel_share > 0.25
            else "Portfolio carbon intensity is moderate, allowing a diversified ESG tilt."
        ),
    ]

    breakdown = [
        {
            "category": str(row.category),
            "spend": round(float(row.amount), 2),
            "carbon_kg": round(float(row.carbon_kg), 2),
            "factor": round(float(row.factor), 4),
        }
        for row in grouped.itertuples(index=False)
    ]

    return {
        "total_carbon_kg": round(total_carbon, 2),
        "monthly_spend": round(monthly_spend, 2),
        "carbon_intensity": round(carbon_intensity, 6),
        "breakdown": breakdown,
        "recommended_fund": primary,
        "alternatives": recommendations[1:],
        "rationale": rationale,
    }
