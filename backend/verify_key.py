import os
from dotenv import load_dotenv
import google.generativeai as genai

# Explicitly load .env from current directory
load_dotenv()

key = os.getenv("GEMINI_API_KEY")
print(f"Loaded Key Length: {len(key) if key else 'None'}")
if key:
    print(f"Key starts with: {key[:5]}...")
    print(f"Key ends with: ...{key[-5:]}")
else:
    print("FATAL: No API Key found in environment.")

if key:
    genai.configure(api_key=key)
    print("\nAttempting to generate content with 'gemini-1.5-flash'...")
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello, can you hear me?")
        print("Success! Response:")
        print(response.text)
    except Exception as e:
        print(f"\nError using gemini-1.5-flash: {e}")
        
    print("\nAttempting to generate content with 'gemini-pro' (fallback check)...")
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Hello, can you hear me?")
        print("Success with gemini-pro! Response:")
        print(response.text)
    except Exception as e:
        print(f"\nError using gemini-pro: {e}")
