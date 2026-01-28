import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = BASE_DIR / "storage"
TEMP_DIR = STORAGE_DIR / "temp"

# Ensure directories exist
TEMP_DIR.mkdir(parents=True, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "SmartDoc AI"
    VERSION: str = "1.0.0"
    BASE_DIR: Path = BASE_DIR
    TEMP_DIR: Path = TEMP_DIR
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    API_URL: str = os.getenv("API_URL", "http://127.0.0.1:8000")
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")

settings = Settings()
