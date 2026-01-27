import fitz  # PyMuPDF
import os
from app.core.config import settings

def encrypt_pdf(file_path: str, password: str, output_path: str):
    """Encrypts a PDF with a user password."""
    doc = fitz.open(file_path)
    
    # Permission flags (default to allow everything for now, can be fine-tuned)
    # fitz.PDF_PERM_PRINT | fitz.PDF_PERM_COPY etc.
    perm = fitz.PDF_PERM_ACCESSIBILITY | fitz.PDF_PERM_PRINT | fitz.PDF_PERM_COPY
    
    # Encryption method: AES-256
    doc.save(output_path, encryption=fitz.PDF_ENCRYPT_AES_256, user_pw=password, permissions=perm)
    doc.close()
    return output_path

def check_pdf_encrypted(file_path: str) -> bool:
    """Checks if a PDF is encrypted."""
    doc = fitz.open(file_path)
    is_encrypted = doc.is_encrypted
    doc.close()
    return is_encrypted
