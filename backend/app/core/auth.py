"""
Middleware de autenticación con Supabase
Soporta usuarios autenticados y anónimos
"""

from fastapi import Request, HTTPException
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

# Cliente Supabase
_supabase: Optional[Client] = None


def get_supabase() -> Client:
    """Retorna el cliente de Supabase (singleton)"""
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        print("✅ Supabase conectado")
    return _supabase


async def get_current_user(request: Request) -> Optional[dict]:
    """
    Extrae el usuario del token JWT de Supabase.
    Retorna None si no hay token (usuario anónimo permitido).
    Lanza 401 si el token es inválido.
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None  # Usuario anónimo — permitido

    token = auth_header.split("Bearer ")[1]

    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)

        if user_response and user_response.user:
            return {
                "id": user_response.user.id,
                "email": user_response.user.email,
                "token": token,
            }
        return None
    except Exception as e:
        print(f"⚠️ Error validando token: {e}")
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
