"""
Servicio de historial de chat con Supabase
Guarda sesiones y mensajes para usuarios autenticados
"""

import json
from typing import Optional, List, Dict
from app.core.auth import get_supabase


class ChatHistoryService:
    """Gestiona el historial de conversaciones en Supabase"""

    def create_session(self, user_id: str, title: str = "Nueva conversación") -> Optional[str]:
        """Crea una nueva sesión de chat y retorna su ID"""
        try:
            supabase = get_supabase()
            result = supabase.table("chat_sessions").insert({
                "user_id": user_id,
                "title": title,
            }).execute()

            if result.data:
                session_id = result.data[0]["id"]
                print(f"💬 Sesión creada: {session_id}")
                return session_id
            return None
        except Exception as e:
            print(f"❌ Error creando sesión: {e}")
            return None

    def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        sources: Optional[List[dict]] = None,
    ) -> bool:
        """Guarda un mensaje en una sesión"""
        try:
            supabase = get_supabase()
            supabase.table("chat_messages").insert({
                "session_id": session_id,
                "role": role,
                "content": content,
                "sources": json.dumps(sources or []),
            }).execute()

            # Actualizar título de sesión con la primera pregunta del usuario
            if role == "user":
                self._maybe_update_title(session_id, content)

            return True
        except Exception as e:
            print(f"❌ Error guardando mensaje: {e}")
            return False

    def _maybe_update_title(self, session_id: str, question: str):
        """Actualiza el título de la sesión con la primera pregunta (truncada)"""
        try:
            supabase = get_supabase()
            # Solo actualizar si el título sigue siendo el default
            session = supabase.table("chat_sessions").select("title").eq(
                "id", session_id
            ).single().execute()

            if session.data and session.data["title"] == "Nueva conversación":
                title = question[:80] + ("..." if len(question) > 80 else "")
                supabase.table("chat_sessions").update(
                    {"title": title}
                ).eq("id", session_id).execute()
        except Exception:
            pass  # No crítico

    def get_user_sessions(self, user_id: str, limit: int = 20) -> List[dict]:
        """Obtiene las sesiones de un usuario"""
        try:
            supabase = get_supabase()
            result = supabase.table("chat_sessions").select(
                "id, title, created_at, updated_at"
            ).eq(
                "user_id", user_id
            ).order(
                "updated_at", desc=True
            ).limit(limit).execute()

            return result.data or []
        except Exception as e:
            print(f"❌ Error obteniendo sesiones: {e}")
            return []

    def get_session_messages(self, session_id: str) -> List[dict]:
        """Obtiene los mensajes de una sesión"""
        try:
            supabase = get_supabase()
            result = supabase.table("chat_messages").select(
                "id, role, content, sources, created_at"
            ).eq(
                "session_id", session_id
            ).order("created_at", desc=False).execute()

            messages = []
            for msg in (result.data or []):
                sources = msg.get("sources", "[]")
                if isinstance(sources, str):
                    try:
                        sources = json.loads(sources)
                    except Exception:
                        sources = []
                messages.append({
                    "id": msg["id"],
                    "role": msg["role"],
                    "content": msg["content"],
                    "sources": sources,
                    "created_at": msg["created_at"],
                })
            return messages
        except Exception as e:
            print(f"❌ Error obteniendo mensajes: {e}")
            return []

    def delete_session(self, session_id: str, user_id: str) -> bool:
        """Elimina una sesión y sus mensajes"""
        try:
            supabase = get_supabase()
            supabase.table("chat_sessions").delete().eq(
                "id", session_id
            ).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            print(f"❌ Error eliminando sesión: {e}")
            return False

    def get_recent_messages_for_context(self, session_id: str, limit: int = 6) -> List[dict]:
        """Obtiene los últimos N mensajes para usar como contexto conversacional"""
        try:
            supabase = get_supabase()
            result = supabase.table("chat_messages").select(
                "role, content"
            ).eq(
                "session_id", session_id
            ).order("created_at", desc=True).limit(limit).execute()

            messages = list(reversed(result.data or []))
            return messages
        except Exception:
            return []


# Singleton
chat_history = ChatHistoryService()
