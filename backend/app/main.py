from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import documents, media, editor

from app.core.config import settings

app = FastAPI(title="SmartDoc AI API", version="1.0.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "SmartDoc AI Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

from app.routers import documents, media, editor, converter

app.include_router(documents.router)
app.include_router(media.router)
app.include_router(editor.router)
app.include_router(converter.router)
