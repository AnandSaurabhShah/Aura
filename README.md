# Aura-Style Premier Banking and Wealth Platform

## Stack
- FastAPI backend with SQLite, strict relational models and seeded demo data
- Next.js App Router frontend with Tailwind CSS and a centralized Aura-style navigation atlas
- XGBoost ESG recommender, MAPIE conformal return forecasting and LangGraph transfer compliance

## Run

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

### Convenience scripts
```bash
npm run backend:dev
npm run frontend:dev
```
