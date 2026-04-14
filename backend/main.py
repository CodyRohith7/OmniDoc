import base64
from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import tempfile
import json

from extractors.pdf_ext import extract_text_from_pdf
from extractors.docx_ext import extract_text_from_docx
from extractors.img_ext import extract_text_from_image
from services.ai_service import analyze_text

app = FastAPI(title="OmniDoc AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentRequest(BaseModel):
    fileName: str
    fileType: str
    fileBase64: str

def verify_api_key(x_api_key: str = Header(None)):
    """
    Validates the x-api-key header if API_SECRET_KEY is configured.
    If API_SECRET_KEY is not set (e.g., local dev), auth is skipped.
    """
    expected_key = os.getenv("API_SECRET_KEY")
    if expected_key and x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid API key.")
    return x_api_key

@app.get("/")
def health_check():
    return {"status": "OmniDoc API is running"}

@app.post("/api/document-analyze")
async def analyze_document(request: DocumentRequest, api_key: str = Depends(verify_api_key)):
    if not request.fileBase64:
        raise HTTPException(status_code=400, detail="No fileBase64 provided")
    
    filename = request.fileName.lower()
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, filename)
    
    try:
        # Decode base64 and write to temp file
        # Sometimes JS FileReader prepends `data:application/pdf;base64,` so we strip it if present
        b64_data = request.fileBase64
        if ";" in b64_data and "base64," in b64_data:
            b64_data = b64_data.split("base64,")[1]
            
        file_bytes = base64.b64decode(b64_data)
        with open(temp_path, "wb") as f:
            f.write(file_bytes)
            
        extracted_text = ""
        
        if filename.endswith(".pdf") or request.fileType.lower() == "pdf":
            extracted_text = extract_text_from_pdf(temp_path)
        elif filename.endswith((".docx", ".doc")) or request.fileType.lower() == "docx":
            extracted_text = extract_text_from_docx(temp_path)
        elif filename.endswith((".png", ".jpg", ".jpeg")) or request.fileType.lower() == "image":
            extracted_text = extract_text_from_image(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
        if not extracted_text.strip():
            raise HTTPException(status_code=422, detail="No text could be extracted from the document")
            
        result = await analyze_text(extracted_text)
        
        # Ensure schema matches exactly
        return {
            "status": "success",
            "fileName": request.fileName,
            "summary": result.get("summary", ""),
            "category": result.get("category", "Unclassified Document"),
            "entities": result.get("entities", {"names": [], "dates": [], "organizations": [], "amounts": []}),
            "sentiment": result.get("sentiment", "Neutral")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
