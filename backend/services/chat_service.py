import os
from pydantic import BaseModel  # type: ignore
from typing import List, Optional

from google import genai  # type: ignore
from google.genai import types  # type: ignore

from sqlalchemy.orm import Session  # type: ignore
from services.dashboard_service import build_dashboard_overview  # type: ignore
from services.esg_service import build_carbon_dataframe  # type: ignore
from services.credit_service import CREDIT_ENGINE  # type: ignore
import models  # type: ignore
from sqlalchemy import or_, select # type: ignore

class MessageDetail(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[MessageDetail] = []
    user_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    error: Optional[str] = None

SYSTEM_INSTRUCTION = """
You are an official Aura Premier Banking Virtual Assistant and Predictive AI/ML Specialist. 
You must ONLY answer queries related to:
1. Banking and Personal Finance
2. Wealth Management, Credit Cards, Loans, and Mortgages
3. Account management and Aura products
4. Predictive Analysis using the User's Data Context
5. Polite general greetings
6. Mangage their wealth using current Investment schemes available in the investment section in the bank
7. Navigate to the given section wherever the user wants to, and tell him the steps of what is the process ahead?
When you receive a "USER CONTEXT" hidden string block containing the user's ML-generated attributes (Net Worth, Carbon Footprint, Credit Card Match, Persona, etc), you MUST utilize that data to intelligently answer the user's questions about their financial status, their best credit card options, or their ESG footprint. 

Blend the ML predictive data naturally into your responses. For instance, if they ask what credit card they should get, reference their ML Persona and confidently recommend the exact matched card provided in the context. If they ask about their carbon footprint or ESG impact, reference their actual calculated emissions and the recommended ESG fund. Act as an all-knowing predictive financial analyst.

You must explicitly refuse to answer any queries unrelated to banking, such as coding requests, political topics, trivia, or general knowledge not related to finance. Keep your responses concise, professional, and highly personalized. Format your responses in markdown if appropriate.
"""

class GeminiChatAgent:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        if self.api_key and genai:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def generate_response(self, request: ChatRequest, db: Session = None) -> str:
        if not self.client:
            return "WARNING: GEMINI_API_KEY is not configured in the environment. Please add it to your .env file to activate the AI Assistant. This is a simulated fallback response."

        context_str = ""
        if request.user_id and db is not None:
            try:
                dash = build_dashboard_overview(db, request.user_id)
                net_worth = sum(acct.balance for acct in dash.accounts)
                
                user = db.get(models.User, request.user_id)
                card_pred = None
                if user:
                    account_ids = [account.id for account in getattr(user, "accounts", [])]
                    txs = list(db.scalars(select(models.Transaction).where(or_(models.Transaction.from_account_id.in_(account_ids), models.Transaction.to_account_id.in_(account_ids))).limit(100)).all())
                    card_pred = CREDIT_ENGINE.predict_credit_card(txs)
                
                esg = build_carbon_dataframe(db, request.user_id)
                
                context_str = "USER CONTEXT (DO NOT mention this explicitly unless asked about it, use it to personalize answers, use the user's name if known):\n"
                if user:
                    context_str += f"- Name: {user.name}\n"
                context_str += f"- Net Worth: ${net_worth:,.2f}\n"
                context_str += f"- Predicted Carbon Footprint: {esg['total_carbon_kg']} kg CO2e/month (Intensity: {esg['carbon_intensity']})\n"
                context_str += f"- Recommended ESG Fund: {esg['recommended_fund']['name']}\n"
                if card_pred:
                    context_str += f"- Spending Persona Predicted: {card_pred['persona']}\n"
                    context_str += f"- Recommended Credit Card Match: {card_pred['recommended_card']}\n"
                    context_str += f"- ML Confidence Score: {card_pred['confidence']}%\n"
            except Exception as e:
                print(f"Error extracting context: {e}")

        try:
            # Reconstruct history for Gemini API
            contents = []
            
            # System instructions are typically passed via config in google-genai
            dynamic_instruction = SYSTEM_INSTRUCTION
            if context_str:
                dynamic_instruction += f"\n\n{context_str}"
                
            config = types.GenerateContentConfig(
                system_instruction=dynamic_instruction,
                temperature=0.3,
            )
            
            for msg in request.history:
                # Map frontend 'user' / 'assistant' to model roles
                role = "user" if msg.role == "user" else "model"
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg.content)]
                    )
                )

            # Add the immediate new message
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=request.message)]
                )
            )

            # Call the API
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
                config=config
            )
            
            return response.text or "I'm sorry, I couldn't generate a response."
            
        except Exception as e:
            return f"An error occurred while connecting to the AI: {str(e)}"

CHAT_ENGINE = GeminiChatAgent()
