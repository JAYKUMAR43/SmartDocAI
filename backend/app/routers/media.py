from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from app.core.config import settings
from app.services.media_service import compress_image, compress_video
import os
import uuid
import shutil

router = APIRouter(
    prefix="/media",
    tags=["media"]
)

UPLOAD_DIR = str(settings.TEMP_DIR)

@router.post("/compress/image")
async def compress_image_endpoint(file: UploadFile = File(...), quality: int = 60, target_size_kb: int = None):
    """Compresses an uploaded image."""
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(session_dir, f"original{file_extension}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        output_filename = compress_image(file_path, quality, target_size_kb)
        return {
            "message": "Image compressed successfully",
            "download_url": f"/media/download/{session_id}/{output_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compress/video")
async def compress_video_endpoint(file: UploadFile = File(...), crf: int = 28, target_size_kb: int = None):
    """Compresses an uploaded video."""
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(session_dir, f"original{file_extension}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        output_filename = compress_video(file_path, crf, target_size_kb)
        return {
            "message": "Video compressed successfully",
            "download_url": f"/media/download/{session_id}/{output_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{session_id}/{filename}")
async def download_media(session_id: str, filename: str):
    """Downloads a processed media file."""
    file_path = os.path.join(UPLOAD_DIR, session_id, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_path, filename=filename)
