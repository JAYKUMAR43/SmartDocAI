from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services import converter_service
from app.core import config
import os
import uuid
import shutil
import comtypes

router = APIRouter(
    prefix="/converter",
    tags=["converter"],
    responses={404: {"description": "Not found"}},
)

@router.post("/convert")
async def convert(
    files: list[UploadFile] = File(...),
    target_format: str = Form(...),
    session_id: str = Form(None)
):
    """
    Uploads multiple files and converts them to the target format.
    Supports batch processing by returning a list of conversion results.
    """
    if not session_id:
        session_id = str(uuid.uuid4())
    
    # Ensure COM is initialized for this thread (Crucial for Excel/PPT)
    try:
        comtypes.CoInitialize()
    except:
        pass

    results = []
    
    # Process each file
    for file in files:
        input_path = None
        try:
            # Create session directory
            session_dir = os.path.join(config.TEMP_DIR, session_id)
            os.makedirs(session_dir, exist_ok=True)
            
            # Save temp input file
            file_ext = os.path.splitext(file.filename)[1]
            input_filename = f"input_{uuid.uuid4()}{file_ext}"
            input_path = os.path.join(session_dir, input_filename)
            
            with open(input_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            # Convert
            output_path = converter_service.convert_document(input_path, target_format, session_id)
            output_filename = os.path.basename(output_path)
            
            results.append({
                "original_name": file.filename,
                "status": "success",
                "filename": output_filename,
                "download_url": f"/documents/download/{session_id}/{output_filename}"
            })
            
            # Cleanup input
            if os.path.exists(input_path):
                os.remove(input_path)
                
        except Exception as e:
            results.append({
                "original_name": file.filename,
                "status": "error",
                "message": str(e)
            })
            if input_path and os.path.exists(input_path):
                os.remove(input_path)

    # CoUninitialize is good practice but optional here
    # comtypes.CoUninitialize()

    return {
        "message": "Conversion jobs completed",
        "session_id": session_id,
        "conversions": results
    }
