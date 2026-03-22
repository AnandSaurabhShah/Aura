@echo off
echo Starting HSBC-Style Premier Banking Platform...

echo Launching FastAPI backend...
start cmd /k "uvicorn main:app --app-dir backend --reload --port 8000 --env-file backend/.env"

echo Launching Frontend Next.js react server...
start cmd /k "cd frontend && npm run dev"

echo Successfully initialized all components.
