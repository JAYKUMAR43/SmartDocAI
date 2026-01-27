import google.generativeai as genai
import google.generativeai as genai
from app.core.config import settings

API_KEY = settings.GEMINI_API_KEY

if API_KEY:
    genai.configure(api_key=API_KEY)

import PIL.Image

def summarize_text(text: str) -> str:
    """Summarizes the given text using Gemini."""
    if not API_KEY:
        return "API Key not configured."
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(f"Please summarize the following text:\n\n{text}")
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def recreate_document_from_image(image_path: str) -> str:
    """
    Uses Gemini Vision to extract text and formatting from an image 
    and returns a markdown representation.
    """
    if not API_KEY:
        return "API Key not configured."
        
    try:
        img = PIL.Image.open(image_path)
        model = genai.GenerativeModel('gemini-2.5-flash') # Unified model for text and vision
        
        prompt = """
        Analyze this image of a document. 
        Recreate it as a Markdown document. 
        Preserve the structure, headings, tables, and formatting as much as possible.
        Do not describe the image, just output the content.
        """
        
        response = model.generate_content([prompt, img])
        return response.text
    except Exception as e:
        # Fallback for models or API errors
        return f"Error recreating document: {str(e)}"

def chat_with_document(text: str, question: str) -> str:
    """
    Answers a question based on the document content.
    """
    if not API_KEY:
        return "API Key not configured."
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # In a production app, we would use embeddings/RAG for large docs.
        # For this hackathon scope, fitting text in context is okay for avg size docs.
        prompt = f"""
        You are a helpful AI assistant. Answer the user's question based ONLY on the provided document content.
        
        Document Content:
        {text[:30000]} # Truncate to avoid token limits if super large, though Gemini 1.5 has huge window
        
        Question: {question}
        
        Answer:
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error processing question: {str(e)}"

def generate_report(text: str) -> str:
    """
    Generates a professional report from the given text/data.
    """
    if not API_KEY:
        return "API Key not configured."
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        You are a professional business analyst. 
        Generate a comprehensive, professionally formatted report based on the following document content.
        
        The report should include:
        1. Executive Summary
        2. Key Findings (bullet points)
        3. Detailed Analysis (with subheadings)
        4. Recommendations / Conclusion
        
        Format the output in clean Markdown.
        
        Document Content:
        {text[:30000]}
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating report: {str(e)}"
