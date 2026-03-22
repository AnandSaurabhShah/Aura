"""Documents router — document verification and required-docs lookup."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import APIRouter  # type: ignore
import schemas  # type: ignore
from services.doc_verify_service import (  # type: ignore
    verify_document,
    required_docs_for_purpose,
)

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/verify", response_model=schemas.DocumentVerifyResponse)
def verify_doc(request: schemas.DocumentVerifyRequest):
    result = verify_document(request.doc_id, request.doc_type)
    return schemas.DocumentVerifyResponse(**result)


@router.get("/required/{purpose_code}", response_model=list[schemas.RequiredDocumentInfo])
def get_required_docs(purpose_code: str):
    return required_docs_for_purpose(purpose_code)
