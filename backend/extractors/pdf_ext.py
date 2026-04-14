from pypdf import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        reader = PdfReader(file_path)
        # Limit extraction to the first 10 pages to satisfy 30-second hackathon timeouts on Render/Railway
        pages_to_extract = reader.pages[:10]
        for page in pages_to_extract:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        raise Exception(f"PDF Extraction Error: {e}")
    return text
