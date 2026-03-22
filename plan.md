# Architecture Plan

## Phase 1: Foundational Banking Core
- Set up SQLite Database with `SQLAlchemy`.
- `User`, `Account`, `Transaction` models.
- FastAPI backend serving `/api/users`, `/api/accounts`, `/api/transactions`.
- Streamlit frontend with a multipage or tabbed layout to view accounts and send money.

## Phase 2: ESG Carbon Recommender
- Synthesize an MCC to Carbon Factor mapping.
- Train/Use a mock XGBoost model that maps a user's transaction history carbon footprint to a recommended ESG fund.
- Expose via `/api/esg/recommend`.

## Phase 3: Multi-Agent Compliance
- Emulate a LangGraph/CrewAI multi-agent workflow.
- `AML Agent`: Checks for large amounts or flagged countries.
- `Tax Agent`: Checks cross-border tax implications.
- `Coordinator Agent`: Synthesizes final verdict.
- Expose via `/api/compliance/check`.

## Phase 4: Conformal Prediction Dashboard
- Use `mapie` for predictive interval forecasting on dummy asset return data.
- Pass the 90% confidence bounds to an LLM interface wrapper (mocking Llama 3/Mistral local call) to generate plain English advice.
- Expose via `/api/wealth/predict`.
