"""
Router de Documentos - Endpoints para gestionar la base de conocimiento
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Optional
import os
import tempfile

from app.core.models import IngestResponse, StatsResponse
from app.services.vector_store import vector_store
from app.services.document_processor import document_processor

router = APIRouter()


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Estadísticas de la base de conocimiento"""
    return StatsResponse(**vector_store.get_stats())


@router.post("/upload-pdf", response_model=IngestResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """Sube y procesa un PDF para agregarlo a la base de conocimiento"""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos PDF")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        chunks, metadatas = document_processor.process_pdf(tmp_path, source=file.filename)
        added = vector_store.add_documents(texts=chunks, metadatas=metadatas)

        return IngestResponse(
            message=f"PDF '{file.filename}' procesado exitosamente",
            documents_added=added,
            total_documents=vector_store.collection.count(),
        )
    finally:
        os.unlink(tmp_path)


@router.post("/ingest-text", response_model=IngestResponse)
async def ingest_text(texts: List[str], source: Optional[str] = "manual"):
    """Ingesta manual de texto"""
    chunks, metadatas = document_processor.process_texts(texts, source=source)
    added = vector_store.add_documents(texts=chunks, metadatas=metadatas)

    return IngestResponse(
        message=f"{added} fragmentos agregados desde '{source}'",
        documents_added=added,
        total_documents=vector_store.collection.count(),
    )


@router.delete("/clear")
async def clear_documents():
    """Elimina todos los documentos de la base de conocimiento"""
    vector_store.clear()
    return {"message": "Base de conocimiento eliminada"}
