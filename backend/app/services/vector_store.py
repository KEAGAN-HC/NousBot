"""
Servicio de base de datos vectorial con ChromaDB
"""

import os
import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional

from app.core.config import settings


class VectorStoreService:
    """Maneja la base de datos vectorial ChromaDB"""

    def __init__(self):
        self._client = None
        self._collection = None
        self._embedding_model = None

    @property
    def embedding_model(self) -> SentenceTransformer:
        if self._embedding_model is None:
            print(f"📦 Cargando modelo de embeddings: {settings.EMBEDDING_MODEL}")
            self._embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
            print("✅ Modelo de embeddings cargado")
        return self._embedding_model

    @property
    def client(self) -> chromadb.ClientAPI:
        if self._client is None:
            os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
            self._client = chromadb.PersistentClient(
                path=settings.CHROMA_PERSIST_DIR,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
            print("✅ ChromaDB conectado")
        return self._client

    @property
    def collection(self):
        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name=settings.CHROMA_COLLECTION,
                metadata={"description": "Base de conocimiento UT Cancún"},
            )
            print(
                f"✅ Colección '{settings.CHROMA_COLLECTION}' lista "
                f"({self._collection.count()} documentos)"
            )
        return self._collection

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Genera embeddings para una lista de textos"""
        embeddings = self.embedding_model.encode(texts, show_progress_bar=False)
        return embeddings.tolist()

    def add_documents(
        self,
        texts: List[str],
        metadatas: Optional[List[Dict]] = None,
        ids: Optional[List[str]] = None,
    ) -> int:
        """Agrega documentos a la colección"""
        if not texts:
            return 0

        if ids is None:
            existing_count = self.collection.count()
            ids = [f"doc_{existing_count + i}" for i in range(len(texts))]

        if metadatas is None:
            metadatas = [{"source": "unknown"} for _ in texts]

        embeddings = self.generate_embeddings(texts)

        # ChromaDB tiene límite de batch, insertar en lotes de 100
        batch_size = 100
        total_added = 0
        for i in range(0, len(texts), batch_size):
            end = min(i + batch_size, len(texts))
            self.collection.add(
                documents=texts[i:end],
                embeddings=embeddings[i:end],
                metadatas=metadatas[i:end],
                ids=ids[i:end],
            )
            total_added += end - i

        print(f"✅ {total_added} documentos agregados a ChromaDB")
        return total_added

    def search(self, query: str, top_k: int = None) -> List[Dict]:
        """Busca los documentos más relevantes para una consulta"""
        if top_k is None:
            top_k = settings.TOP_K_RESULTS

        if self.collection.count() == 0:
            return []

        query_embedding = self.generate_embeddings([query])

        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=min(top_k, self.collection.count()),
            include=["documents", "metadatas", "distances"],
        )

        documents = []
        for i in range(len(results["documents"][0])):
            documents.append(
                {
                    "content": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "distance": results["distances"][0][i],
                }
            )

        return documents

    def get_stats(self) -> Dict:
        """Retorna estadísticas de la colección"""
        return {
            "total_documents": self.collection.count(),
            "collection_name": settings.CHROMA_COLLECTION,
            "embedding_model": settings.EMBEDDING_MODEL,
        }

    def clear(self):
        """Elimina todos los documentos de la colección"""
        self.client.delete_collection(settings.CHROMA_COLLECTION)
        self._collection = None
        print("🗑️ Colección eliminada")


# Singleton
vector_store = VectorStoreService()
