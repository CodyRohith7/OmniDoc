<div align="center">

<img src="https://img.shields.io/badge/OmniDoc-AI%20Document%20Intelligence-6366f1?style=for-the-badge&logo=google&logoColor=white" alt="OmniDoc"/>

# OmniDoc

**AI-powered document intelligence engine.** Upload any PDF, DOCX, or image and get an instant, structured breakdown — summary, entity extraction, sentiment, and category — all in a stunning real-time UI.

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Tesseract](https://img.shields.io/badge/Tesseract%20OCR-00498F?style=flat-square)](https://github.com/tesseract-ocr/tesseract)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Multi-Format Support** | Analyzes PDFs, Word documents (DOCX), and images (PNG, JPG) |
| 🧠 **AI Summarization** | Deep, multi-paragraph summaries powered by Google Gemini Flash |
| 🏷️ **Entity Extraction** | Extracts names, organizations, dates, and financial amounts |
| 🎭 **Sentiment Analysis** | Classifies document tone as Positive, Negative, or Neutral |
| 🗂️ **Auto Classification** | Identifies document type (Invoice, Resume, Contract, etc.) |
| 🔍 **OCR Engine** | Reads text from scanned images via Tesseract |
| ⚡ **Real-time UI** | Animated 3D interface built with Next.js 16 and Framer Motion |

---

## 🏗️ Architecture

```
OmniDoc/
├── backend/                  # Python FastAPI server
│   ├── extractors/           # Text extraction modules
│   │   ├── pdf_ext.py        # PDF text extraction (pypdf)
│   │   ├── docx_ext.py       # DOCX extraction (python-docx)
│   │   └── img_ext.py        # OCR via Tesseract
│   ├── services/
│   │   └── ai_service.py     # Google Gemini AI integration
│   ├── main.py               # FastAPI app & routes
│   ├── Dockerfile            # Backend container definition
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variable template
│
├── frontend/                 # Next.js 16 web application
│   ├── src/app/
│   │   ├── page.tsx          # Main UI with 3D animations
│   │   ├── layout.tsx        # Root layout & metadata
│   │   └── globals.css       # Global styles
│   ├── .env.example          # Frontend env template
│   └── package.json
│
└── docker-compose.yml        # One-command local setup
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

The easiest way to run everything locally with a **single command**.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) and [Tesseract OCR](https://github.com/tesseract-ocr/tesseract#installing-tesseract)

**1. Clone and configure:**
```bash
git clone https://github.com/CodyRohith7/OmniDoc.git
cd OmniDoc

# Create backend environment file
cp backend/.env.example backend/.env
```

**2. Add your Gemini API key** to `backend/.env`:
```env
GEMINI_API_KEY=your_actual_key_here   # Get free key at aistudio.google.com
API_SECRET_KEY=any_random_secret      # Optional — protects the API endpoint
```

**3. Launch:**
```bash
docker-compose up --build
```

Open **http://localhost:3000** in your browser. 🎉

---

### Option 2: Manual Setup

#### Backend (Python 3.11+)

**Prerequisites:**
- Install [Tesseract OCR](https://github.com/tesseract-ocr/tesseract#installing-tesseract)
- Install [Poppler](https://github.com/oschwartz10612/poppler-windows/releases) (for PDF support)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# → Edit .env and add your GEMINI_API_KEY

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API is live at **http://localhost:8000**

#### Frontend (Node 18+)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# → Edit .env.local if needed (defaults to http://localhost:8000)

# Run the dev server
npm run dev
```

UI is live at **http://localhost:3000**

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Your Google Gemini API key. Get one free at [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `API_SECRET_KEY` | ❌ Optional | A secret string to protect the API. If set, requests must include `x-api-key: <your_key>` header |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL of the running backend |
| `NEXT_PUBLIC_API_KEY` | *(empty)* | Must match `API_SECRET_KEY` in backend if set |

---

## 📡 API Reference

### `GET /`
Health check.

**Response:**
```json
{"status": "OmniDoc API is running"}
```

---

### `POST /api/document-analyze`
Analyzes a document and returns structured AI insights.

**Headers:**
```
Content-Type: application/json
x-api-key: your_secret_key     (only required if API_SECRET_KEY is set)
```

**Request Body:**
```json
{
  "fileName": "contract.pdf",
  "fileType": "pdf",
  "fileBase64": "<base64-encoded file content>"
}
```

**Response:**
```json
{
  "status": "success",
  "fileName": "contract.pdf",
  "category": "Legal Contract",
  "summary": "This agreement is entered into between...",
  "entities": {
    "names": ["John Doe", "Jane Smith"],
    "organizations": ["Acme Corp"],
    "dates": ["January 1, 2026"],
    "amounts": ["$50,000"]
  },
  "sentiment": "Neutral"
}
```

**Supported `fileType` values:** `pdf`, `docx`, `image`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **AI Model** | Google Gemini Flash (`gemini-flash-latest`) |
| **Backend** | FastAPI + Uvicorn |
| **OCR** | Tesseract via `pytesseract` |
| **PDF Parsing** | PyPDF |
| **DOCX Parsing** | python-docx |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Animations** | Framer Motion |
| **Styling** | Tailwind CSS v4 |
| **Containerization** | Docker + Docker Compose |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add awesome feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/CodyRohith7">CodyRohith7</a></p>
</div>
