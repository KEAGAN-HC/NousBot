"""
Servicio de procesamiento de documentos - Chunking de textos y PDFs
"""

from typing import List, Dict, Tuple
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from app.core.config import settings


class DocumentProcessor:
    """Procesa y divide documentos en chunks para la base vectorial"""

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", ". ", ", ", " ", ""],
        )

    def process_pdf(
        self, pdf_path: str, source: str = "pdf"
    ) -> Tuple[List[str], List[Dict]]:
        """Extrae texto de un PDF y lo divide en chunks"""
        reader = PdfReader(pdf_path)
        full_text = ""

        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                full_text += f"\n\n--- Página {i+1} ---\n\n{text}"

        if not full_text.strip():
            return [], []

        chunks = self.text_splitter.split_text(full_text)

        metadatas = [
            {"source": source, "type": "pdf", "chunk_index": i}
            for i in range(len(chunks))
        ]

        print(f"📄 PDF '{source}': {len(chunks)} chunks generados")
        return chunks, metadatas

    def process_texts(
        self, texts: List[str], source: str = "web"
    ) -> Tuple[List[str], List[Dict]]:
        """Divide una lista de textos en chunks"""
        all_chunks = []
        all_metadatas = []

        for text in texts:
            if not text.strip():
                continue
            chunks = self.text_splitter.split_text(text)
            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                all_metadatas.append(
                    {"source": source, "type": "text", "chunk_index": i}
                )

        print(f"📝 Texto '{source}': {len(all_chunks)} chunks generados")
        return all_chunks, all_metadatas

    def process_scraped_pages(
        self, pages: List[Dict]
    ) -> Tuple[List[str], List[Dict]]:
        """Procesa páginas scrapeadas (dict con 'url', 'title', 'content')"""
        all_chunks = []
        all_metadatas = []

        for page in pages:
            content = page.get("content", "").strip()
            if not content:
                continue

            # Agregar título como contexto
            full_text = f"{page.get('title', '')}\n\n{content}"
            chunks = self.text_splitter.split_text(full_text)

            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                all_metadatas.append(
                    {
                        "source": page.get("url", "unknown"),
                        "title": page.get("title", ""),
                        "type": "web",
                        "chunk_index": i,
                    }
                )

        print(f"🌐 Web scraping: {len(all_chunks)} chunks de {len(pages)} páginas")
        return all_chunks, all_metadatas


# Singleton
document_processor = DocumentProcessor()
