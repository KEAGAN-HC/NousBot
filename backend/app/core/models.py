"""
Modelos Pydantic para validación de requests y responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime


# ===== ENUMS =====

class LLMProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"


# ===== CHAT =====

class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Pregunta del usuario sobre la UT Cancún",
        json_schema_extra={"example": "¿Qué carreras ofrece la UT Cancún?"},
    )
    session_id: Optional[str] = Field(
        default=None,
        description="ID de sesión para memoria conversacional. Si no se envía, se crea una nueva.",
    )
    provider: Optional[LLMProvider] = Field(
        default=None,
        description="Proveedor de LLM. Si no se envía, usa el default del servidor.",
    )


class SourceDocument(BaseModel):
    content: str = Field(description="Fragmento de texto recuperado")
    source: str = Field(description="Origen del documento")
    relevance_score: float = Field(description="Score de relevancia (menor = más relevante)")


class ChatResponse(BaseModel):
    answer: str = Field(description="Respuesta generada por el chatbot")
    sources: List[SourceDocument] = Field(description="Documentos fuente usados")
    session_id: str = Field(description="ID de sesión")
    response_time_ms: float = Field(description="Tiempo de respuesta en milisegundos")
    provider_used: str = Field(description="Proveedor LLM utilizado")


# ===== DOCUMENTS =====

class IngestResponse(BaseModel):
    message: str
    documents_added: int
    total_documents: int


class StatsResponse(BaseModel):
    total_documents: int
    collection_name: str
    embedding_model: str


# ===== AUTH / SESSIONS =====

class UserProfile(BaseModel):
    id: str
    email: str
    created_at: Optional[str] = None


class ChatSession(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    message_count: Optional[int] = 0


class ChatMessage(BaseModel):
    id: Optional[str] = None
    role: str
    content: str
    sources: Optional[List[dict]] = []
    created_at: Optional[str] = None


class SessionListResponse(BaseModel):
    sessions: List[ChatSession]


class SessionDetailResponse(BaseModel):
    session: ChatSession
    messages: List[ChatMessage]
