"""
Servicio LLM con LangChain Chains
Soporta OpenAI, Anthropic (Claude) y Google (Gemini)
"""

import time
from typing import Optional, List, Dict
from langchain.schema import HumanMessage, AIMessage
from app.core.config import settings, LLMProvider
from app.core.prompts import CHAT_PROMPT


class LLMService:
    """Servicio para interactuar con LLMs a través de LangChain"""

    def __init__(self):
        self._models = {}

    def _get_model(self, provider: LLMProvider):
        """Obtiene o crea la instancia del modelo LLM"""
        if provider not in self._models:
            if provider == LLMProvider.OPENAI:
                from langchain_openai import ChatOpenAI

                self._models[provider] = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    api_key=settings.OPENAI_API_KEY,
                    temperature=0.3,
                    max_tokens=1500,
                )
            elif provider == LLMProvider.ANTHROPIC:
                from langchain_anthropic import ChatAnthropic

                self._models[provider] = ChatAnthropic(
                    model=settings.ANTHROPIC_MODEL,
                    api_key=settings.ANTHROPIC_API_KEY,
                    temperature=0.3,
                    max_tokens=1500,
                )
            elif provider == LLMProvider.GOOGLE:
                from langchain_google_genai import ChatGoogleGenerativeAI

                self._models[provider] = ChatGoogleGenerativeAI(
                    model=settings.GOOGLE_MODEL,
                    google_api_key=settings.GOOGLE_API_KEY,
                    temperature=0.3,
                    max_output_tokens=1500,
                )
            print(f"✅ Modelo {provider.value} inicializado")
        return self._models[provider]

    async def generate_response(
        self,
        question: str,
        context: str,
        chat_history: Optional[List[Dict]] = None,
        provider: Optional[LLMProvider] = None,
    ) -> Dict:
        """
        Genera respuesta usando LangChain Chain.
        Retorna dict con answer, provider_used y response_time_ms.
        """
        llm_provider = provider or settings.DEFAULT_LLM
        start_time = time.time()

        try:
            model = self._get_model(llm_provider)

            # Construir mensajes con historial
            messages = CHAT_PROMPT.format_messages(
                context=context,
                question=question,
            )

            # Inyectar historial conversacional antes del último mensaje
            if chat_history:
                history_messages = []
                for msg in chat_history[-6:]:
                    if msg["role"] == "user":
                        history_messages.append(HumanMessage(content=msg["content"]))
                    else:
                        history_messages.append(AIMessage(content=msg["content"]))

                # Insertar historial entre system y human message
                messages = [messages[0]] + history_messages + [messages[-1]]

            # Invocar el modelo
            response = model.invoke(messages)
            elapsed = (time.time() - start_time) * 1000

            return {
                "answer": response.content,
                "provider_used": llm_provider.value,
                "response_time_ms": round(elapsed, 2),
            }

        except Exception as e:
            elapsed = (time.time() - start_time) * 1000
            print(f"❌ Error con {llm_provider.value}: {e}")
            return {
                "answer": (
                    "Lo siento, hubo un error al procesar tu pregunta. "
                    "Intenta de nuevo o contacta a la universidad al (998) 881 19 00."
                ),
                "provider_used": llm_provider.value,
                "response_time_ms": round(elapsed, 2),
            }


# Singleton
llm_service = LLMService()
