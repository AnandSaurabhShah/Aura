# Aura - Premier Banking and Wealth Platform

An end-to-end fintech platform combining advanced banking infrastructure with AI-driven wealth management and compliance automation.

## Overview

Aura is a full-stack application built to demonstrate modern fintech architecture patterns. It integrates real banking workflows—accounts, transfers, payments, loans—with cutting-edge ML models for ESG investing, regulatory compliance, and market forecasting.

## Core Features

- **Banking Engine**: Multi-account management, transfers, payments, credit cards, and loans
- **ESG Intelligence**: Carbon footprint analysis with ML-driven sustainable fund recommendations  
- **Compliance Automation**: Multi-agent AML/Tax workflow using LangGraph for regulatory checks
- **Wealth Forecasting**: Conformal prediction intervals on asset returns using MAPIE
- **Payment Processing**: Razorpay integration for multi-mode payments
- **Network Analytics**: Transaction flow visualization and analytics

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **ML/AI**: XGBoost, MAPIE, LangGraph, Scikit-learn
- **Database**: SQLite with strict relational models and foreign key constraints

## Quick Start

### Backend
```bash
pip install -r requirements.txt
uvicorn main:app --app-dir backend --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Convenience Scripts
```bash
npm run backend:dev
npm run frontend:dev
```

The backend runs on `http://localhost:8000` and frontend on `http://localhost:3000`.

## Project Structure

- `/backend` - FastAPI application with routers for accounts, payments, compliance, ESG, wealth forecasting
- `/frontend` - Next.js application with dashboard and analytics UI
- Database is SQLite (`aura_platform.db`) with seeded demo data on startup