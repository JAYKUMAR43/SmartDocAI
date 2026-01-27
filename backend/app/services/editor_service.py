import os
import google.generativeai as genai
from app.core import config
import json

# Use the verified working model
MODEL_NAME = "gemini-1.5-flash"

def analyze_text_style(image_path: str) -> dict:
    """
    Analyzes an image of text and returns the CSS styles to replicate it.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise Exception("API Key not configured")
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(MODEL_NAME)
    
    prompt = """
    Analyze the text in this image. I need to replicate this text using CSS/Fabric.js.
    
    Return a JSON object with the following fields:
    - fontFamily: The closest standard web font or Google Font match (e.g., "Arial", "Times New Roman", "Roboto").
    - fontSize: Estimated font size in pixels (number only). assuming 96 DPI.
    - fontWeight: "normal" or "bold".
    - fontStyle: "normal" or "italic".
    - color: Hex color code of the text (e.g., "#000000").
    - backgroundColor: Hex color of the background (e.g. "#ffffff").
    
    ONLY return the JSON object. No markdown formatting.
    """
    
    # Upload image logic would go here if using File API, 
    # but for 1.5/2.5 Flash we can often pass image bytes or path if local.
    # Since we are local, we can read the file.
    
    import PIL.Image
    img = PIL.Image.open(image_path)
    
    try:
        response = model.generate_content([prompt, img])
        text = response.text.strip()
        # Clean markdown if present
        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "")
        
        return json.loads(text)
    except Exception as e:
        print(f"AI Style Analysis Failed: {e}")
        # Return safe defaults
        return {
            "fontFamily": "Arial",
            "fontSize": 16,
            "fontWeight": "normal",
            "color": "#000000",
            "backgroundColor": "#ffffff"
        }

def perform_ocr(image_path: str) -> str:
    """
    Transcribes text from an image.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(MODEL_NAME)
    
    import PIL.Image
    img = PIL.Image.open(image_path)
    
    prompt = "Transcribe all text from this image exactly. Keep layout if possible."
    response = model.generate_content([prompt, img])
    return response.text

def detect_form_fields(image_path: str) -> list:
    """
    Detects form patterns and suggests fields.
    Returns list of suggested fields with coordinates [ymin, xmin, ymax, xmax].
    """
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-pro") # Use Pro for better vision if possible
    
    import PIL.Image
    img = PIL.Image.open(image_path)
    
    prompt = """
    Analyze this document and detect all areas that should be interactive form fields.
    Identify:
    - Text entry lines or boxes -> "text"
    - Checkboxes or small square boxes -> "checkbox"
    - Multiple choice options with circles -> "radio"
    - Dropdown styled boxes -> "combobox"
    
    For each field, provide:
    1. type: (text, checkbox, radio, combobox)
    2. label: The text label next to it
    3. box_2d: [ymin, xmin, ymax, xmax] coordinates normalized to 0-1000.
    
    Return ONLY a JSON array of objects. Example:
    [{"type": "text", "label": "Full Name", "box_2d": [100, 200, 120, 500]}]
    """
    
    try:
        response = model.generate_content([prompt, img])
        text = response.text.strip()
        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "")
        
        return json.loads(text)
    except Exception as e:
        print(f"AI Field Detection Failed: {e}")
        return []
