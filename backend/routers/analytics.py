from fastapi import APIRouter, Depends  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
import database  # type: ignore
from services import analytics_service  # type: ignore

router = APIRouter(prefix="/api/analytics", tags=["Analytics Workbench"])

@router.get("/network")
def get_transaction_network(db: Session = Depends(database.get_db)):
    """Serves the node/edge topology for visual network analytics."""
    return analytics_service.build_transaction_network(db)

@router.get("/trigger-engine")
def get_campaign_triggers(threshold: float = 0.05, db: Session = Depends(database.get_db)):
    """Simulates the Trigger Engine evaluating the customer base against a given PageRank centrality threshold."""
    return analytics_service.simulate_campaign_trigger_engine(db, trigger_threshold=threshold)
