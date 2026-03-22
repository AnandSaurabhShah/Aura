from contextlib import asynccontextmanager

from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore

import models  # type: ignore
from database import engine  # type: ignore
from routers import ( # type: ignore
    accounts, chat, compliance, credits, dashboard, documents, esg, investments, loans, payments, wealth, analytics
)
from seed import seed_demo_data  # type: ignore


@asynccontextmanager
async def lifespan(app: FastAPI):
    del app
    models.Base.metadata.create_all(bind=engine)
    seed_demo_data()
    yield


app = FastAPI(
    title="Aura-Style Premier Banking & Wealth Platform API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
        "http://localhost:3002", "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(documents.router)
app.include_router(esg.router)
app.include_router(investments.router)
app.include_router(credits.router)
app.include_router(loans.router)
app.include_router(wealth.router)
app.include_router(compliance.router)
app.include_router(payments.router)
app.include_router(analytics.router)


@app.get("/")
def read_root():
    return {
        "message": (
            "Aura-style Premier Banking API is active with dashboard, ESG, "
            "conformal forecasting and compliance workflows."
        )
    }
