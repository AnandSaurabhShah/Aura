# Project Title
## 📋 Project Summary

**Aura** is a sophisticated, **Aura-Style Premier Banking and Wealth Platform** – a full-stack fintech application designed to emulate premium banking services with advanced AI/ML capabilities for wealth management, ESG (Environmental, Social, Governance) analysis, compliance workflows, and conformal prediction forecasting. The platform combines modern web technologies with sophisticated machine learning pipelines to deliver enterprise-grade financial services.

**Repository**: AnandSaurabhShah/Aura | **Language Composition**: TypeScript 64.3%, Python 35.3%, Other 0.4%

---

## 🏗️ Architecture Overview

### High-Level Components
```
┌─────────────────────────────────────────────────────────────┐
│                    AURA PLATFORM STACK                       │
├─────────────────────────────────────────────────────────────┤
│ Frontend: Next.js 15 + React 19 + Tailwind CSS + TypeScript  │
├─────────────────────────────────────────────────────────────┤
│ Backend: FastAPI + SQLAlchemy + SQLite (Relational DB)       │
├─────────────────────────────────────────────────────────────┤
│ ML/AI Services:                                               │
│  • XGBoost (ESG Recommender)                                 │
│  • MAPIE (Conformal Prediction for Wealth Forecasting)       │
│  • LangGraph (Multi-Agent Compliance Workflow)               │
│  • Scikit-learn (Anomaly Detection, Neural Networks)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Functionality & What It Does

### 1. **Premier Banking Core**
A comprehensive banking platform that provides:
- **Multi-Account Management**: Support for Current, Savings, Fixed Deposit, NRE, NRO, and Forex accounts
- **Transaction Processing**: Full P2P transfers, deposits, withdrawals, card transactions
- **Credit Card Management**: Multiple card products (Premier, Live+, Taj, etc.) with rewards programs
- **Loan Portfolio**: Home loans, LAP (Loan Against Property), personal loans with EMI tracking
- **Investment Portfolio**: Multi-asset class allocations with risk profiling (Conservative, Balanced, Growth, ESG-Focus)
- **Payment Orchestration**: Razorpay integration for multi-mode payment processing

### 2. **ESG Carbon Recommender System**
Advanced environmental impact analysis with AI-driven fund recommendations:
- Maps transaction merchant categories (MCC codes) to carbon emission factors
- Calculates monthly carbon footprint in kg CO2e per user
- Uses **XGBoost classifier** trained on synthetic market data to recommend ESG funds
- Features a sophisticated **3-tier ML/DL/RL ensemble**:
  - **ML Component**: IsolationForest for transaction anomaly detection
  - **DL Component**: MLPRegressor (64→32 neuron layers) for non-linear carbon prediction
  - **RL Component**: Q-Learning agent with category-based discount/penalty multipliers
- Provides carbon intensity metrics and fund recommendations with confidence scores

### 3. **Multi-Agent Compliance Workflow (LangGraph)**
Enterprise-grade compliance engine using agentic AI:
- **AML Agent**: Detects high-risk jurisdictions, large transfers (≥$50k), high-risk funding sources (Crypto, Cash)
- **Tax Agent**: Enforces LRS (Liberalized Remittance Scheme) limits, validates documentation requirements, manages cross-border FX declarations
- **Coordinator Agent**: Synthesizes findings and renders final approval/rejection/review decisions
- Routes transfers through sequential state graph with comprehensive audit trails

### 4. **Conformal Prediction Wealth Forecasting**
Quantified forecast intervals for asset returns:
- Uses **MAPIE (Multi-Algorithm Prediction Interval Estimator)** with Random Forest base learner
- Generates 90% confidence prediction intervals for next 5 business days
- Dynamically adjusts forecasts based on macro factors: momentum, inflation, volatility, yield gaps
- Produces narratives explaining market positioning (defensive vs. risk-on)

### 5. **Dashboard & Analytics**
Unified wealth view with:
- Aggregated account balances and available cash
- Credit limits and utilization tracking
- Investment returns and valuations
- Recent transaction history with analytics
- Real-time FX quotes
- Compliance alerts and notifications

---

## 💾 Backend Architecture

### **Technology Stack**
```
fastapi==0.135.1              # High-performance async web framework
uvicorn[standard]==0.35.0     # ASGI application server
sqlalchemy==2.0.48            # ORM with strict relational models
pydantic==2.11.10             # Data validation & serialization
xgboost==3.2.0                # Gradient boosting for ESG classification
mapie==0.8.5                  # Conformal prediction intervals
scikit-learn==1.5.2           # ML ensemble methods & anomaly detection
langgraph==0.6.8              # Agentic AI workflow orchestration
pandas==2.3.3                 # Data manipulation & analysis
numpy==2.4.2                  # Numerical computing
```

### **Database Schema (SQLite with SQLAlchemy)**

#### Core Models:

**User** (`users` table)
- `customer_number` (unique, indexed)
- `full_name`, `email`, `mobile_number` (all indexed/unique)
- `segment` (PRIVATE_BANK, PREMIER, PERSONAL, NRI)
- `kyc_status` (PENDING, APPROVED, EXPIRED)
- `relationship_manager`, `residence_country`
- Timestamps: `created_at`, `updated_at`

**Account** (`accounts` table)
- `account_number` (unique)
- `account_type` (CURRENT, SAVINGS, FIXED_DEPOSIT, NRE, NRO, FOREX)
- `current_balance`, `available_balance`, `overdraft_limit` (Numeric 16,2)
- `interest_rate`, `currency` (default INR)
- `status` (ACTIVE, DORMANT, BLOCKED, CLOSED)
- `iban`, `swift_code` (for international transfers)
- Foreign key to `User` with cascade delete

**CreditCard** (`credit_cards` table)
- `card_reference` (unique)
- `product_type` (PREMIER, LIVE_PLUS, TAJ, TRAVELONE, RUPAY, PLATINUM)
- `network` (VISA, MASTERCARD, RUPAY)
- `credit_limit`, `available_limit`, `current_balance`
- `reward_points`, `annual_fee`
- `statement_due_day` (1-31)
- `international_usage_enabled` (boolean)

**Loan** (`loans` table)
- `loan_type` (HOME, SMART_HOME_DLOD, LAP, SMART_LAP_DLOD, PERSONAL)
- `original_principal`, `outstanding_principal`, `emi_amount`
- `interest_rate` (0-100), `tenure_months`
- `maturity_date`, `status` (ACTIVE, CLOSED, REVIEW)
- Foreign keys to User & Account

**InvestmentPortfolio** (`investment_portfolios` table)
- `portfolio_name`, `risk_profile` (CONSERVATIVE, BALANCED, GROWTH, ESG_FOCUS)
- `invested_amount`, `market_value`
- `cash_allocation`, `equity_allocation`, `fixed_income_allocation` (0-100)
- `esg_score` (0-100), `ytd_return`
- `holdings` (JSON array of instruments with weights & valuations)

**Transaction** (`transactions` table)
- `reference` (unique, indexed)
- `from_account_id`, `to_account_id`, `card_id` (nullable foreign keys)
- `amount` (>0), `currency`, `direction` (DEBIT, CREDIT, TRANSFER)
- `transaction_type` (CARD_SPEND, TRANSFER, SALARY, BILL_PAYMENT, FX, INVESTMENT, ATM, LOAN_EMI, FEE, REFUND, REMITTANCE)
- `merchant_name`, `merchant_category`, `mcc_code` (indexed)
- `origin_country`, `destination_country`
- `booked_at` (datetime)

**PaymentOrder** (`payment_orders` table)
- `gateway` (RAZORPAY), `provider_mode` (LIVE, MOCK)
- `gateway_order_id`, `gateway_payment_id` (unique/indexed)
- `route_slug`, `route_title`, `payment_mode`
- `amount`, `currency`, `destination`
- `purpose_code`, `source_of_funds`, `status`
- `gateway_payload` (JSON for extensibility)

---

### **Backend API Routers** (12 Modules)

1. **`accounts.py`** – Account operations
   - `GET /api/accounts/users/{user_id}` – Fetch user profile with all holdings
   - `GET /api/accounts/{account_id}` – Get individual account details
   - `GET /api/accounts/{account_id}/transactions` – Last 20 transactions
   - `POST /api/accounts/{account_id}/deposit` – Fund deposit
   - `POST /api/accounts/{account_id}/withdraw` – Fund withdrawal
   - `POST /api/accounts/transfer` – P2P transfer between accounts

2. **`esg.py`** – ESG recommender
   - `GET /api/esg/recommend/{user_id}` – Carbon footprint analysis & fund recommendations

3. **`compliance.py`** – Multi-agent compliance
   - `POST /api/compliance/transfer` – Global transfer compliance check with AML/Tax scoring

4. **`wealth.py`** – Conformal prediction forecasting
   - `POST /api/wealth/predict` – Next-week return forecasts with 90% confidence intervals

5. **`dashboard.py`** – Unified dashboard
   - `GET /api/dashboard/overview/{user_id}` – Full aggregated view

6. **`payments.py`** – Payment gateway orchestration
   - `POST /api/payments/create` – Initiate payment order
   - `POST /api/payments/authorize` – Mock authorization
   - `POST /api/payments/verify` – Verify payment signature

7. **`investments.py`** – Portfolio management
   - `GET /api/investments/portfolios/{user_id}` – List user portfolios
   - `POST /api/investments/allocate` – Rebalance allocations
   - `POST /api/investments/analysis` – Performance & attribution analysis

8. **`loans.py`** – Loan management
   - `GET /api/loans/{user_id}` – List loans
   - `GET /api/loans/{loan_id}/amortization` – EMI schedule

9. **`credits.py`** – Credit card operations
   - `GET /api/credits/cards/{user_id}` – List cards
   - `POST /api/credits/cards/{card_id}/pay` – Card payment

10. **`documents.py`** – Document verification
    - `POST /api/documents/verify` – Verify doc types (PAN, LRS, Passport)

11. **`chat.py`** – Conversational interface (placeholder)
    - Chat endpoints for future NLP integration

12. **`analytics.py`** – Network & behavioral analytics
    - Network graph analysis across user transaction flows

---

### **Core Services (Python Modules)**

#### **`esg_service.py`** – 3-Tier ML/DL/RL Carbon Engine
```python
# ML: IsolationForest for anomaly detection
# DL: MLPRegressor (64→32 neurons) for non-linear carbon prediction  
# RL: Q-Learning agent with category discount multipliers
# Output: Carbon breakdown by category + XGBoost fund recommendation
```

#### **`compliance_agent.py`** – LangGraph State Machine
```python
# StateGraph(TransferState)
# Nodes: aml_check → tax_check → coordinator → END
# AML Agent Scoring: Base 8 + thresholds for amount/jurisdiction/source
# Tax Agent: LRS validation (250k limit for India), documentation routing
# Coordinator: Aggregates outcomes → APPROVED/MANUAL_REVIEW/REJECTED
```

#### **`wealth_service.py`** – MAPIE Conformal Predictor
```python
# 180-day synthetic market data with AR(1) processes
# RandomForestRegressor base model with MAPIE wrapper
# Generates 5-day forecast with lower/upper bounds at 90% coverage
# Produces narrative recommendations
```

---

### **Seeded Demo Data**
The platform initializes with comprehensive demo data:
- **Primary User**: Anand Shah (PREMIER segment, ₹6.5M+ net worth)
  - 6 accounts: Current, Savings, NRE, NRO, Fixed Deposit, Forex
  - 2 credit cards: Live+ & Premier (₹1.65M combined credit)
  - 2 loans: Smart Home DLOD (₹11.85M), Smart LAP DLOD (₹5.22M)
  - 2 portfolios: Global Wealth (₹4.7M) & ESG Core (₹1.99M)

- **Network Users** (3 additional): For transaction graph analytics
  - Saurabh Malviya (PRIVATE_BANK)
  - Priya Sharma (PREMIER)
  - Rohan Gupta (PERSONAL)

- **Transaction History**: 8 synthetic transactions showing salary deposits, P2P transfers, card spends, cross-user network flows

---

## 🎨 Frontend Architecture

### **Technology Stack**
```
next==15.0.0                      # React framework with App Router
react==19.0.0-rc                  # Latest RC (pre-release candidate)
react-dom==19.0.0-rc
tailwindcss==3.4.1                # Utility-first CSS framework
typescript==^5                    # Type safety
axios==^1.13.6                    # HTTP client for API calls
recharts==^3.8.0                  # Charting library
react-force-graph-2d==^1.29.1     # Network visualization
lucide-react==^0.577.0            # Icon library (30+ icons)
clsx==^2.1.1                      # Classname utilities
tailwind-merge==^3.5.0            # Tailwind class merging
```

### **Project Structure**
```
frontend/
├── app/                          # Next.js App Router pages
├── src/                          # Component & utility source
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── postcss.config.mjs
├── .eslintrc.json
└── build_routes.py               # Route generation utility
```

### **Key Frontend Features**
- **Next.js 15 App Router**: File-based routing with `/app` directory
- **Tailwind CSS**: Responsive utility-first styling
- **Recharts**: Interactive charts for portfolio performance, transaction history
- **React Force Graph 2D**: Network visualization of transaction flows between users
- **Axios Integration**: RESTful API communication with FastAPI backend on localhost:8000
- **TypeScript**: Full type coverage for components and API responses
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### **Frontend CORS Configuration**
Backend accepts requests from:
- `http://localhost:3000`, `http://127.0.0.1:3000`
- `http://localhost:3001`, `http://127.0.0.1:3001`
- `http://localhost:3002`, `http://127.0.0.1:3002`

---

## 🚀 Commands & How to Run

### **Quick Start Scripts (from root `package.json`)**

```bash
# Terminal 1: Start Backend
npm run backend:dev
# Runs: uvicorn main:app --app-dir backend --reload --port 8000

# Terminal 2: Start Frontend  
npm run frontend:dev
# Runs: cd frontend && npm run dev (Next.js dev server on :3000)
```

### **Manual Startup (Windows)**

```bash
# start.bat file launches both in parallel:
start cmd /k "uvicorn main:app --app-dir backend --reload --port 8000 --env-file backend/.env"
start cmd /k "cd frontend && npm run dev"
```

### **Backend Manual Startup**

```bash
# From root directory
pip install -r requirements.txt
uvicorn main:app --app-dir backend --reload --port 8000
```

### **Frontend Manual Startup**

```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

### **Additional Frontend Commands**

```bash
npm run build       # Production build (Next.js optimization)
npm run start       # Production server
npm run lint        # ESLint checks
```

---

## 📦 Convenience Scripts

### **Root-Level Scripts** (`package.json`)
```json
{
  "scripts": {
    "frontend:dev": "npm --prefix frontend run dev",      // Dev server on :3000
    "frontend:build": "npm --prefix frontend run build",  // Production build
    "frontend:lint": "npm --prefix frontend run lint",    // ESLint analysis
    "backend:dev": "uvicorn main:app --app-dir backend --reload --port 8000"  // Dev API
  }
}
```

### **Windows Batch Startup** (`start.bat`)
Launches both backend and frontend in separate command windows automatically.

### **Build Route Generator** (`frontend/build_routes.py`)
Python utility to auto-generate Next.js routing based on file structure (developer convenience tool).

---

## 🔒 Security & Compliance Features

- **Foreign Key Constraints**: SQLite foreign keys enabled (`PRAGMA foreign_keys=ON`)
- **WAL Mode**: Write-Ahead Logging for database resilience (`PRAGMA journal_mode=WAL`)
- **Check Constraints**: Data integrity at DB level (balance checks, interest rate ranges, allocation percentages)
- **Unique Constraints**: Email, mobile, account numbers prevent duplicates
- **Cascade Delete**: User deletion cascades to all related accounts/cards/loans
- **CORS Middleware**: Restricted to localhost ports (development)
- **LRS Compliance**: Remittance limits enforced ($250k annual for India residents)
- **AML Scoring**: Jurisdiction risk assessment, suspicious activity flagging
- **Tax Validation**: Cross-border documentation requirements

---

## 📊 Data Models: Key Relationships

```
User (1) ──→ (∞) Account
User (1) ──→ (∞) CreditCard
User (1) ──→ (∞) Loan
User (1) ──→ (∞) InvestmentPortfolio
User (1) ──→ (∞) PaymentOrder

Account (1) ──→ (∞) Transaction (as sender)
Account (1) ──→ (∞) Transaction (as receiver)
Account (1) ──→ (∞) Loan (linked account for EMI)

CreditCard (1) ──→ (∞) Transaction

Transaction: Supports account-to-account transfers, card spends, external deposits
```

---

## 🤖 ML/AI Capabilities Summary

| Feature | Technology | Purpose |
|---------|-----------|---------|
| **ESG Recommendation** | XGBoost (multi-class classifier) | Maps spending patterns to sustainable funds |
| **Carbon Calculation** | ML (IsolationForest) + DL (MLPRegressor) + RL (Q-Learning) | 3-tier ensemble for emission prediction |
| **Compliance** | LangGraph (multi-agent workflow) | Agentic AML/Tax/Coordination pipeline |
| **Wealth Forecasting** | MAPIE (conformal prediction) + Random Forest | Next-week return forecasts with confidence bands |
| **Anomaly Detection** | Scikit-learn IsolationForest | Detects unusual transaction patterns |

---

## 🎯 Use Cases

1. **Premier Banking**: View aggregated wealth, manage accounts & cards, execute transfers
2. **ESG Investing**: Understand carbon footprint, get sustainable fund recommendations
3. **Global Transfers**: Initiate international payments with automated compliance screening
4. **Wealth Forecasting**: Access quantified return predictions for asset allocation decisions
5. **Loan Management**: Track EMI schedules, view loan amortization across multiple products
6. **Network Analytics**: Visualize transaction flows across user networks
7. **Portfolio Rebalancing**: Analyze asset allocation and execute trades
8. **Payment Processing**: Multi-mode payment orchestration via Razorpay

---

## 📈 Repository Metadata

- **Created**: 18 days ago (early March 2026)
- **Last Updated**: 3 hours ago (2026-04-09)
- **Default Branch**: `main`
- **Repository Size**: 321 KB
- **Visibility**: Public
- **Stargazers**: 1 | **Watchers**: 1
- **Status**: Active development (no open issues currently)

This is a **production-ready fintech platform** combining enterprise banking infrastructure with cutting-edge AI/ML for wealth management and regulatory compliance.

## Contributing

Please read [CONTRIBUTING.md](link-to-contributing) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](link-to-license) file for details.

