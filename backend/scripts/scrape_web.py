"""
Script de scraping para el sitio web de la UT Cancún
Extrae contenido de las páginas principales y lo guarda como JSON
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import time
from typing import List, Dict

# Páginas a scrapear de utcancun.edu.mx
URLS_TO_SCRAPE = [
    {
        "url": "https://utcancun.edu.mx/",
        "title": "Página principal UT Cancún",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/nuevo-ingreso/",
        "title": "Nuevo Ingreso 2026",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/oferta-educativa-2/",
        "title": "Oferta Educativa",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/t-s-u-y-licenciatura/",
        "title": "TSU y Licenciaturas",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/servicios-escolares-1/",
        "title": "Servicios Escolares",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/titulacion-2/",
        "title": "Titulación",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/filosofia/",
        "title": "Filosofía institucional",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/historia/",
        "title": "Historia de la UT Cancún",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/tu-universidad/",
        "title": "Tu Universidad",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/secretaria-academica/",
        "title": "Secretaría Académica",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/certificacion-de-idioma/",
        "title": "Certificación de Idioma",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/tutorias/",
        "title": "Tutorías",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/educacion-continua/",
        "title": "Educación Continua",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/idiomas/",
        "title": "Idiomas",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/biblioteca-2/",
        "title": "Biblioteca",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/calendario-2026-2/",
        "title": "Calendario 2026",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/secretaria-de-vinculacion/",
        "title": "Vinculación",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/seguimiento-de-egresados/",
        "title": "Seguimiento de Egresados",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/bolsa-de-trabajo/",
        "title": "Bolsa de Trabajo",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/estadia-profesional/",
        "title": "Estadía Profesional",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/internacionalizacion/",
        "title": "Internacionalización",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/movilidad-nacional/",
        "title": "Movilidad Nacional",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/tramites-y-servicios/",
        "title": "Trámites y Servicios",
    },
    # Páginas de carreras individuales
    {
        "url": "https://utcancun.edu.mx/index.php/nuevo-ingreso/index.php/licenciatura-en-negocios-y-mercadotecnia/",
        "title": "Licenciatura en Negocios y Mercadotecnia",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/nuevo-ingreso/index.php/contaduria-2/",
        "title": "Licenciatura en Contaduría",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/nuevo-ingreso/index.php/administracion/",
        "title": "Licenciatura en Administración",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/nuevo-ingreso/index.php/licenciatura-en-gestion-del-bienestar/",
        "title": "Licenciatura en Gestión del Bienestar",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/nuevo-ingreso/index.php/desarrollo-productos-alternativos/",
        "title": "Licenciatura en Gestión y Desarrollo Turístico",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/nuevo-ingreso/index.php/ingenieria-area-instalaciones/",
        "title": "Licenciatura en Ingeniería en Mantenimiento Industrial",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/nuevo-ingreso/index.php/ingenieria-en-software/",
        "title": "Licenciatura en Ingeniería en TI - Desarrollo de Software",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/nuevo-ingreso/index.php/ingenieria-en-redes/",
        "title": "Licenciatura en Ingeniería en TI - Infraestructura de Redes",
    },
    {
        "url": "https://utcancun.edu.mx/index.php/nuevo-ingreso/index.php/gastronomia-2/",
        "title": "Licenciatura en Gastronomía",
    },
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def clean_text(text: str) -> str:
    """Limpia texto extraído de HTML"""
    import re

    # Eliminar espacios múltiples y líneas vacías
    text = re.sub(r"\n\s*\n", "\n\n", text)
    text = re.sub(r" +", " ", text)
    text = re.sub(r"\t+", " ", text)

    # Eliminar texto de navegación común
    remove_patterns = [
        r"Skip to content",
        r"Open Button",
        r"Close Button",
        r"Search",
        r"previous arrow.*?next arrow",
    ]
    for pattern in remove_patterns:
        text = re.sub(pattern, "", text, flags=re.DOTALL | re.IGNORECASE)

    return text.strip()


def scrape_page(url: str, title: str) -> Dict:
    """Scrapea una página individual"""
    try:
        print(f"🔍 Scrapeando: {title} ({url})")
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        response.encoding = "utf-8"

        soup = BeautifulSoup(response.text, "html.parser")

        # Eliminar elementos no deseados
        for tag in soup.find_all(
            ["script", "style", "nav", "footer", "header", "noscript", "iframe"]
        ):
            tag.decompose()

        # Extraer contenido principal
        main_content = soup.find("main") or soup.find(
            "div", {"id": "tp_content"}
        ) or soup.find("article") or soup.find(
            "div", {"class": "entry-content"}
        )

        if main_content:
            text = main_content.get_text(separator="\n")
        else:
            # Fallback: todo el body
            body = soup.find("body")
            text = body.get_text(separator="\n") if body else soup.get_text(separator="\n")

        text = clean_text(text)

        # Extraer enlaces a PDFs
        pdf_links = []
        for link in soup.find_all("a", href=True):
            href = link["href"]
            if href.lower().endswith(".pdf"):
                pdf_links.append(
                    {"url": href, "text": link.get_text(strip=True) or "PDF"}
                )

        return {
            "url": url,
            "title": title,
            "content": text,
            "pdf_links": pdf_links,
            "status": "success",
        }

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return {
            "url": url,
            "title": title,
            "content": "",
            "pdf_links": [],
            "status": f"error: {str(e)}",
        }


def run_scraper():
    """Ejecuta el scraping completo"""
    print("=" * 60)
    print("🌐 SCRAPER UT CANCÚN - Iniciando...")
    print("=" * 60)

    results = []
    for page_info in URLS_TO_SCRAPE:
        result = scrape_page(page_info["url"], page_info["title"])
        results.append(result)
        time.sleep(1)  # Ser amables con el servidor

    # Guardar resultados
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, "utc_web_scraped.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # Resumen
    successful = [r for r in results if r["status"] == "success"]
    all_pdfs = []
    for r in results:
        all_pdfs.extend(r.get("pdf_links", []))

    print("\n" + "=" * 60)
    print(f"✅ Scraping completado:")
    print(f"   - Páginas scrapeadas: {len(successful)}/{len(results)}")
    print(f"   - PDFs encontrados: {len(all_pdfs)}")
    print(f"   - Guardado en: {output_path}")
    print("=" * 60)

    # Guardar lista de PDFs
    pdf_list_path = os.path.join(output_dir, "utc_pdf_links.json")
    with open(pdf_list_path, "w", encoding="utf-8") as f:
        json.dump(all_pdfs, f, ensure_ascii=False, indent=2)

    return results


if __name__ == "__main__":
    run_scraper()
