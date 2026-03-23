"""
Script de ingesta - Carga toda la información a ChromaDB
Ejecutar desde la carpeta backend: python -m scripts.ingest
"""

import os
import sys
import json

# Agregar el directorio padre al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.vector_store import vector_store
from app.services.document_processor import document_processor
from scripts.base_knowledge import get_base_knowledge


def ingest_base_knowledge():
    """Carga los datos base verificados"""
    print("\n📚 Cargando datos base de la UT Cancún...")
    data = get_base_knowledge()

    texts = []
    metadatas = []

    for doc in data:
        content = f"{doc['title']}\n\n{doc['content']}"
        chunks, metas = document_processor.process_texts(
            [content], source=doc["source"]
        )
        texts.extend(chunks)
        metadatas.extend(metas)

    added = vector_store.add_documents(texts=texts, metadatas=metadatas)
    print(f"  ✅ {added} fragmentos de datos base cargados")
    return added


def ingest_scraped_web():
    """Carga los datos scrapeados del sitio web"""
    scraped_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "raw", "utc_web_scraped.json"
    )

    if not os.path.exists(scraped_path):
        print("\n⚠️  No se encontró utc_web_scraped.json")
        print("   Ejecuta primero: python -m scripts.scrape_web")
        return 0

    print("\n🌐 Cargando datos scrapeados del sitio web...")
    with open(scraped_path, "r", encoding="utf-8") as f:
        pages = json.load(f)

    # Filtrar páginas exitosas con contenido
    valid_pages = [
        p for p in pages if p["status"] == "success" and len(p["content"]) > 50
    ]

    chunks, metadatas = document_processor.process_scraped_pages(valid_pages)
    added = vector_store.add_documents(texts=chunks, metadatas=metadatas)
    print(f"  ✅ {added} fragmentos web cargados de {len(valid_pages)} páginas")
    return added


def ingest_pdfs():
    """Carga PDFs de la carpeta data/raw"""
    pdf_dir = os.path.join(os.path.dirname(__file__), "..", "data", "raw")

    if not os.path.exists(pdf_dir):
        return 0

    pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]

    if not pdf_files:
        print("\n📄 No se encontraron PDFs en data/raw/")
        return 0

    print(f"\n📄 Procesando {len(pdf_files)} PDFs...")
    total_added = 0

    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        try:
            chunks, metadatas = document_processor.process_pdf(
                pdf_path, source=pdf_file
            )
            added = vector_store.add_documents(texts=chunks, metadatas=metadatas)
            total_added += added
            print(f"  ✅ {pdf_file}: {added} fragmentos")
        except Exception as e:
            print(f"  ❌ {pdf_file}: {e}")

    return total_added


def main():
    print("=" * 60)
    print("🚀 INGESTA DE DATOS - UTC Chatbot")
    print("=" * 60)

    total = 0

    # 1. Datos base (siempre disponibles)
    total += ingest_base_knowledge()

    # 2. Datos scrapeados (si existen)
    total += ingest_scraped_web()

    # 3. PDFs (si existen)
    total += ingest_pdfs()

    # Resumen
    stats = vector_store.get_stats()
    print("\n" + "=" * 60)
    print(f"🎉 INGESTA COMPLETADA")
    print(f"   Fragmentos nuevos: {total}")
    print(f"   Total en base: {stats['total_documents']}")
    print(f"   Colección: {stats['collection_name']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
