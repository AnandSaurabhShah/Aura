from fastapi import APIRouter, Depends  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from services.chat_service import CHAT_ENGINE, ChatRequest, ChatResponse  # type: ignore
import database  # type: ignore

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("")
@router.post("/")
def chat_with_agent(request: ChatRequest, db: Session = Depends(database.get_db)) -> ChatResponse:
    reply = CHAT_ENGINE.generate_response(request, db)
    return ChatResponse(response=reply)
