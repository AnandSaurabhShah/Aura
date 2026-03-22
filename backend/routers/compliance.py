from fastapi import APIRouter  # type: ignore

import schemas  # type: ignore
from services.compliance_agent import run_compliance_workflow  # type: ignore

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.post("/transfer", response_model=schemas.GlobalTransferResponse)
def check_transfer_compliance(request: schemas.GlobalTransferRequest):
    payload = request.model_dump()
    # Pass the list of verified document IDs so the compliance agent
    # can reward verified submissions with a lower AML score.
    return run_compliance_workflow(payload)

