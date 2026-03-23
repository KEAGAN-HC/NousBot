"""
Router de Sesiones - Historial de conversaciones para usuarios autenticados
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from app.core.auth import get_current_user
from app.core.models import SessionListResponse, SessionDetailResponse, ChatSession, ChatMessage
from app.services.chat_history import chat_history

router = APIRouter()


async def require_auth(request: Request) -> dict:
    """Requiere autenticación para estos endpoints"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Autenticación requerida")
    return user


@router.get("/", response_model=SessionListResponse)
async def get_sessions(request: Request, user: dict = Depends(require_auth)):
    """Obtiene las sesiones del usuario autenticado"""
    sessions = chat_history.get_user_sessions(user["id"])

    return SessionListResponse(
        sessions=[
            ChatSession(
                id=s["id"],
                title=s["title"],
                created_at=s["created_at"],
                updated_at=s["updated_at"],
            )
            for s in sessions
        ]
    )


@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session_detail(
    session_id: str, request: Request, user: dict = Depends(require_auth)
):
    """Obtiene los mensajes de una sesión"""
    messages = chat_history.get_session_messages(session_id)

    return SessionDetailResponse(
        session=ChatSession(
            id=session_id,
            title="Conversación",
            created_at="",
            updated_at="",
        ),
        messages=[
            ChatMessage(
                id=m.get("id"),
                role=m["role"],
                content=m["content"],
                sources=m.get("sources", []),
                created_at=m.get("created_at"),
            )
            for m in messages
        ],
    )


@router.delete("/{session_id}")
async def delete_session(
    session_id: str, request: Request, user: dict = Depends(require_auth)
):
    """Elimina una sesión"""
    success = chat_history.delete_session(session_id, user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return {"message": "Sesión eliminada"}
