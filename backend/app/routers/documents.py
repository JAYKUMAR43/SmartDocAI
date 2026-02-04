from fastapi import APIRouter, UploadFile, File, HTTPException, Body, BackgroundTasks
from app.services import cleanup_service
from fastapi.responses import FileResponse
from app.services.pdf_service import (
    extract_text_from_pdf, 
    merge_pdfs, 
    split_pdf, 
    create_pdf_from_text, 
    create_pdf_from_text, 
    create_pdf_from_images,
    compress_pdf
)
from app.services.ai_service import summarize_text
import shutil
import os
import uuid
from app.services import converter_service # Import the module instead
from app.core.config import settings

router = APIRouter(
    prefix="/documents",
    tags=["documents"]
)

# Use the configured temp directory
UPLOAD_DIR = str(settings.TEMP_DIR)

@router.post("/upload")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Uploads a file to the server."""
    # Trigger background cleanup for old files
    background_tasks.add_task(cleanup_service.cleanup_old_files)
    
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    # We keep the original filename sanitised or just use 'original'
    file_path = os.path.join(session_dir, f"original{file_extension}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "file_id": session_id, 
        "filename": file.filename, 
        "path": file_path,
        "type": file.content_type
    }
# ... (summarize, protect endpoints remain same) ...

from fastapi import BackgroundTasks
from app.services import cleanup_service

@router.get("/download/{file_id}/{filename}")
async def download_file(file_id: str, filename: str, background_tasks: BackgroundTasks):
    """Downloads a processed file and then deletes the session data for privacy."""
    file_path = os.path.join(UPLOAD_DIR, file_id, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Schedule deletion of the entire session directory after the response is sent
    session_dir = os.path.join(UPLOAD_DIR, file_id)
    background_tasks.add_task(cleanup_service.delete_path, session_dir)
        
    return FileResponse(file_path, filename=filename)

from app.services.ai_service import recreate_document_from_image

@router.post("/recreate/{file_id}")
async def recreate_document(file_id: str):
    """Recreates a document from an uploaded image using AI."""
    session_dir = os.path.join(UPLOAD_DIR, file_id)
    if not os.path.exists(session_dir):
        raise HTTPException(status_code=404, detail="Session not found")
        
    files = [f for f in os.listdir(session_dir) if f.startswith("original")]
    if not files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = os.path.join(session_dir, files[0])
    
    # Check if image or PDF
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
    if not any(file_path.lower().endswith(ext) for ext in valid_extensions):
        raise HTTPException(status_code=400, detail="Only images and PDFs supported for recreation")

    if file_path.lower().endswith(".pdf"):
        # For PDF, we just extract text (or in future could convert to image for Vision)
        # Getting text is safer/faster for "recreating" content unless they want OCR of scanned PDF.
        # But user objective implies they want the content. 
        markdown_content = extract_text_from_pdf(file_path)
    else:
        markdown_content = recreate_document_from_image(file_path)
        
    return {"content": markdown_content}

from app.services.ai_service import chat_with_document

@router.post("/chat/{file_id}")
async def chat_document(file_id: str, question: str):
    """Answers a question about the uploaded document."""
    session_dir = os.path.join(UPLOAD_DIR, file_id)
    if not os.path.exists(session_dir):
        raise HTTPException(status_code=404, detail="Session not found")
        
    files = [f for f in os.listdir(session_dir) if f.startswith("original")]
    if not files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = os.path.join(session_dir, files[0])
    
    if not file_path.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDFs supported for chat")
        
    text = extract_text_from_pdf(file_path)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text")
        
    answer = chat_with_document(text, question)
    return {"answer": answer}

from app.services.ai_service import generate_report

@router.post("/report/{file_id}")
async def generate_document_report(file_id: str):
    """Generates a professional report from the document."""
    session_dir = os.path.join(UPLOAD_DIR, file_id)
    if not os.path.exists(session_dir):
        raise HTTPException(status_code=404, detail="Session not found")
        
    files = [f for f in os.listdir(session_dir) if f.startswith("original")]
    if not files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = os.path.join(session_dir, files[0])
    
    # Extract text (Assuming PDF for now, but could be DOCX/Excel later)
    # If image, we could use recreate first then report. 
    # For now, let's stick to PDF text extraction.
    if file_path.endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    else:
        # Fallback or error
        raise HTTPException(status_code=400, detail="Only PDFs supported for report generation currently")
        
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text")
    
    report_content = generate_report(text)
    return {"report": report_content}

# create_pdf_from_text is now imported at the top
from pydantic import BaseModel

class CreatePDFRequest(BaseModel):
    text: str

@router.post("/create")
async def create_new_pdf(request: CreatePDFRequest):
    """Creates a new PDF from the provided text."""
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    output_filename = "created_document.pdf"
    output_path = os.path.join(session_dir, output_filename)
    
    try:
        create_pdf_from_text(request.text, output_path)
        return {
            "message": "PDF created successfully",
            "download_url": f"/documents/download/{session_id}/{output_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ContentRequest(BaseModel):
    content: str
    format: str = "docx"

@router.post("/create/from-content")
async def create_document_content(request: ContentRequest):
    """Creates a downloadable document (DOCX/PDF) from provided text content."""
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    file_ext = f".{request.format.lower()}"
    output_filename = f"handwriting_converted{file_ext}"
    output_path = os.path.join(session_dir, output_filename)
    
    try:
        converter_service.create_document_from_content(request.content, request.format, output_path)
        return {
            "message": "Document created successfully",
            "download_url": f"/documents/download/{session_id}/{output_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Creation failed: {str(e)}")
@router.post("/create/images")
async def create_pdf_images(request: dict = Body(...)):
    """
    Creates a PDF from a list of uploaded images.
    Expects JSON body: { "file_ids": ["id1", "id2", ...] }
    """
    file_ids = request.get("file_ids", [])
    if not file_ids:
        raise HTTPException(status_code=400, detail="No images provided.")
    
    input_paths = []
    for fid in file_ids:
        # Find file in session-based directory
        session_dir = os.path.join(UPLOAD_DIR, fid)
        if not os.path.exists(session_dir):
             # Fallback to direct file in TEMP_DIR if session dir doesn't exist (older format)
            found = False
            for f in os.listdir(settings.TEMP_DIR):
                if f.startswith(fid):
                    input_paths.append(os.path.join(settings.TEMP_DIR, f))
                    found = True
                    break
            if not found:
                raise HTTPException(status_code=404, detail=f"Image {fid} not found")
            continue

        files = [f for f in os.listdir(session_dir) if f.startswith("original")]
        if not files:
            raise HTTPException(status_code=404, detail=f"Image {fid} not found in session")
        input_paths.append(os.path.join(session_dir, files[0]))

    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    output_filename = "created_images.pdf"
    output_path = os.path.join(session_dir, output_filename)
    
    try:
        create_pdf_from_images(input_paths, output_path)
        return {
            "message": "PDF created successfully",
            "download_url": f"/documents/download/{session_id}/{output_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/merge")
async def merge_documents(request: dict = Body(...)):
    """
    Merges multiple PDFs into one.
    Expects JSON body: { "file_ids": ["id1", "id2", ...] }
    """
    file_ids = request.get("file_ids", [])
    if not file_ids or len(file_ids) < 2:
        raise HTTPException(status_code=400, detail="At least two files are required for merging.")
    
    input_paths = []
    for fid in file_ids:
        session_dir = os.path.join(UPLOAD_DIR, fid)
        if not os.path.exists(session_dir):
            found = False
            for f in os.listdir(settings.TEMP_DIR):
                if f.startswith(fid):
                    input_paths.append(os.path.join(settings.TEMP_DIR, f))
                    found = True
                    break
            if not found:
                raise HTTPException(status_code=404, detail=f"File {fid} not found")
            continue

        files = [f for f in os.listdir(session_dir) if f.startswith("original")]
        if not files:
             raise HTTPException(status_code=404, detail=f"File {fid} not found in session")
        input_paths.append(os.path.join(session_dir, files[0]))

    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    output_filename = "merged.pdf"
    output_path = os.path.join(session_dir, output_filename)
    
    try:
        merge_pdfs(input_paths, output_path)
        return {
            "message": "PDFs merged successfully",
            "download_url": f"/documents/download/{session_id}/{output_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/split/{file_id}")
async def split_document(file_id: str, request: dict = Body(default={})):
    """
    Splits a PDF into individual pages or extracts specific pages.
    Optional JSON body: { "pages": [1, 3, 5] } (1-based page numbers)
    """
    session_dir = os.path.join(UPLOAD_DIR, file_id)
    file_path = None
    
    if os.path.exists(session_dir):
        files = [f for f in os.listdir(session_dir) if f.startswith("original")]
        if files:
            file_path = os.path.join(session_dir, files[0])
    
    if not file_path:
        # Fallback to direct file in TEMP_DIR
        for f in os.listdir(settings.TEMP_DIR):
            if f.startswith(file_id):
                file_path = os.path.join(settings.TEMP_DIR, f)
                break
            
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        output_session_id = str(uuid.uuid4())
        output_dir = os.path.join(UPLOAD_DIR, output_session_id)
        os.makedirs(output_dir, exist_ok=True)

        pages = request.get("pages")
        if pages:
            # Convert 1-based to 0-based
            pages = [p - 1 for p in pages]

        generated_files = split_pdf(file_path, output_dir, pages)
        
        # Construct download URLs
        valid_files = []
        for path in generated_files:
            fname = os.path.basename(path)
            valid_files.append({
                "filename": fname,
                "download_url": f"/documents/download/{output_session_id}/{fname}"
            })
            
        return {
            "message": "PDF processed successfully",
            "files": valid_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
