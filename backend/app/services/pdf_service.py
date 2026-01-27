import fitz  # PyMuPDF
import os

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts text from a PDF file."""
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def create_pdf_from_text(text: str, output_path: str):
    """
    Creates a simple PDF from text using PyMuPDF.
    """
    try:
        doc = fitz.open()
        page = doc.new_page()
        # Insert text with simple formatting
        # PyMuPDF insert_textbox is good for wrapping
        rect = fitz.Rect(50, 50, 550, 800)
        page.insert_textbox(rect, text, fontsize=11, fontname="helv", align=0)
        doc.save(output_path)
        doc.close()
        return True
    except Exception as e:
        raise Exception(f"Failed to create PDF: {str(e)}")

def create_pdf_from_images(image_paths: list[str], output_path: str):
    """
    Creates a PDF from a list of images.
    """
    try:
        doc = fitz.open()
        for img_path in image_paths:
            img = fitz.open(img_path)
            rect = img[0].rect
            pdfbytes = img.convert_to_pdf()
            img.close()
            imgPDF = fitz.open("pdf", pdfbytes)
            page = doc.new_page(width=rect.width, height=rect.height)
            page.show_pdf_page(rect, imgPDF, 0)
        
        doc.save(output_path)
        doc.close()
        return True
    except Exception as e:
        raise Exception(f"Failed to create PDF from images: {str(e)}")

def merge_pdfs(file_paths: list[str], output_path: str):
    """Merges multiple PDFs into one."""
    doc = fitz.open()
    for path in file_paths:
        with fitz.open(path) as mfile:
            doc.insert_pdf(mfile)
    doc.save(output_path)

def split_pdf(file_path: str, output_dir: str, page_numbers: list[int] = None):
    """
    Splits a PDF into individual pages or specific selected pages.
    page_numbers: List of 0-based page indices to extract.
    """
    doc = fitz.open(file_path)
    base_name = os.path.basename(file_path).replace(".pdf", "")
    generated_files = []
    
    # If no pages specified, split all
    pages_to_process = page_numbers if page_numbers is not None else range(len(doc))
    
    # If user selected specific pages, we might want to merge them into ONE new PDF?
    # Or split them into individual files? 
    # User said: "split one or multiple page mei pdf open ho jaye gi jo page vo split krna chaye ga usse select krr ke split krr paye ga"
    # Usually "Split" implies separating into files. But "Extract" might mean create a new PDF with selected pages.
    # Let's assume for "Simple Split" -> Individual pages.
    # But for "Select Pages", user likely wants to EXTRACT those pages into a new document or individual files.
    # Let's support both modes by logic in the router or here. 
    # For now, let's keep it simple: "Split" logic generates individual files for the requested pages.
    
    for page_num in pages_to_process:
        if page_num < 0 or page_num >= len(doc):
            continue
            
        new_doc = fitz.open()
        new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
        
        # If user explicitly selected pages, let's keep original page number in filename
        output_filename = f"{base_name}_page_{page_num + 1}.pdf"
        output_path = os.path.join(output_dir, output_filename)
        new_doc.save(output_path)
        generated_files.append(output_path)
        new_doc.close()
        
    doc.close()
    return generated_files

def compress_pdf(file_path: str, output_path: str):
    """
    Compresses a PDF file using PyMuPDF's garbage collection and stream deflation.
    """
    try:
        doc = fitz.open(file_path)
        # garbage=4 (clean unused objects, compact xref), deflate=True (compress streams)
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
        return True
    except Exception as e:
        raise Exception(f"PDF compression failed: {str(e)}")
