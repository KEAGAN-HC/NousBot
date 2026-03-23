"""
Router de Chat - Endpoints del chatbot con autenticación y rate limiting
"""

from fastapi import APIRouter, Request, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Optional

from app.core.models import ChatRequest, ChatResponse, LLMProvider
from app.core.auth import get_current_user
from app.services.rag_service import rag_service

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/ask", response_model=ChatResponse)
@limiter.limit("20/minute")
async def ask_question(request: Request, body: ChatRequest):
    """
    Endpoint principal del chatbot.
    - Usuarios anónimos: pueden chatear, sin historial persistente.
    - Usuarios autenticados: historial se guarda en Supabase.
    """
    user = await get_current_user(request)

    provider = body.provider
    if provider and isinstance(provider, str):
        provider = LLMProvider(provider)

    result = await rag_service.ask(
        question=body.question,
        session_id=body.session_id,
        provider=provider,
        user=user,
    )

    return ChatResponse(**result)
