"""
Servicio RAG - Retrieval-Augmented Generation
Orquesta búsqueda vectorial + LLM + historial
"""

import uuid
import time
from typing import Optional, List, Dict
from app.services.vector_store import vector_store
from app.services.llm_service import llm_service
from app.services.chat_history import chat_history
from app.core.config import LLMProvider
from app.core.models import SourceDocument


class RAGService:
    """Retrieval-Augmented Generation para el chatbot"""

    # Memoria temporal para usuarios anónimos (session_id → mensajes)
    _temp_memory: Dict[str, List[Dict]] = {}

    async def ask(
        self,
        question: str,
        session_id: Optional[str] = None,
        provider: Optional[LLMProvider] = None,
        user: Optional[dict] = None,
    ) -> Dict:
        """
        Procesa una pregunta completa:
        1. Recupera historial conversacional
        2. Busca documentos relevantes en ChromaDB
        3. Genera respuesta con LLM
        4. Guarda en historial (si usuario autenticado)
        """
        start_time = time.time()

        # 1. Gestionar sesión
        is_authenticated = user is not None
        if not session_id:
            if is_authenticated:
                session_id = chat_history.create_session(user["id"], "Nueva conversación")
            else:
                session_id = str(uuid.uuid4())

        # 2. Obtener historial conversacional
        chat_hist = self._get_history(session_id, is_authenticated)

        # 3. Buscar documentos relevantes
        search_results = vector_store.search(question)

        # 4. Construir contexto
        context_parts = []
        source_docs = []

        for i, doc in enumerate(search_results):
            context_parts.append(f"[Fragmento {i+1}]: {doc['content']}")
            source_docs.append(SourceDocument(
                content=doc["content"][:200] + "...",
                source=doc["metadata"].get("source", "Desconocido"),
                relevance_score=round(doc["distance"], 4),
            ))

        context = "\n\n".join(context_parts) if context_parts else (
            "No se encontró información relevante en la base de conocimiento."
        )

        # 5. Generar respuesta con LLM
        llm_result = await llm_service.generate_response(
            question=question,
            context=context,
            chat_history=chat_hist,
            provider=provider,
        )

        # 6. Guardar en historial
        self._save_to_history(
            session_id=session_id,
            question=question,
            answer=llm_result["answer"],
            sources=[s.model_dump() for s in source_docs],
            is_authenticated=is_authenticated,
            user=user,
        )

        total_time = (time.time() - start_time) * 1000

        # 7. Log
        print(f"🤖 [{llm_result['provider_used']}] {question[:50]}... → {llm_result['response_time_ms']}ms")

        return {
            "answer": llm_result["answer"],
            "sources": source_docs,
            "session_id": session_id,
            "response_time_ms": round(total_time, 2),
            "provider_used": llm_result["provider_used"],
        }

    def _get_history(self, session_id: str, is_authenticated: bool) -> List[Dict]:
        """Obtiene historial de la sesión"""
        if is_authenticated:
            return chat_history.get_recent_messages_for_context(session_id)
        else:
            return self._temp_memory.get(session_id, [])[-6:]

    def _save_to_history(
        self,
        session_id: str,
        question: str,
        answer: str,
        sources: list,
        is_authenticated: bool,
        user: Optional[dict] = None,
    ):
        """Guarda mensajes en el historial"""
        if is_authenticated and user:
            chat_history.save_message(session_id, "user", question)
            chat_history.save_message(session_id, "assistant", answer, sources)
        else:
            # Memoria temporal
            if session_id not in self._temp_memory:
                self._temp_memory[session_id] = []
            self._temp_memory[session_id].append({"role": "user", "content": question})
            self._temp_memory[session_id].append({"role": "assistant", "content": answer})

            # Limitar memoria temporal a 20 mensajes
            if len(self._temp_memory[session_id]) > 20:
                self._temp_memory[session_id] = self._temp_memory[session_id][-20:]

            # Limpiar sesiones viejas (max 100 sesiones anónimas)
            if len(self._temp_memory) > 100:
                oldest_keys = list(self._temp_memory.keys())[:50]
                for k in oldest_keys:
                    del self._temp_memory[k]


# Singleton
rag_service = RAGService()
