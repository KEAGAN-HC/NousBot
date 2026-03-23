"""
UTC Chatbot - Backend Principal
Chatbot RAG para la Universidad Tecnológica de Cancún
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from app.routers import chat, documents, sessions
from app.core.config import settings

load_dotenv()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="UTC Chatbot API",
    description=(
        "Chatbot inteligente con RAG para la Universidad Tecnológica de Cancún.\n\n"
        "**Características:**\n"
        "- Retrieval-Augmented Generation (RAG) con ChromaDB\n"
        "- Multi-provider LLM (OpenAI, Anthropic, Google)\n"
        "- Autenticación con Supabase\n"
        "- Historial de conversaciones persistente\n"
        "- Rate limiting y validación Pydantic\n"
        "- Observabilidad con LangSmith"
    ),
    version="2.0.0",
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])


@app.get("/")
async def root():
    return {
        "message": "🎓 UTC Chatbot API v2.0 - Universidad Tecnológica de Cancún",
        "status": "online",
        "version": "2.0.0",
        "features": [
            "RAG con ChromaDB",
            "Multi-provider LLM",
            "Autenticación Supabase",
            "Historial persistente",
            "Rate limiting",
            "LangChain Chains",
        ],
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "default_llm": settings.DEFAULT_LLM.value,
        "supabase_configured": bool(settings.SUPABASE_URL),
        "langsmith_enabled": settings.LANGCHAIN_TRACING_V2,
    }
