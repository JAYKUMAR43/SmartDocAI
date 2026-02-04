import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
if not key:
    print("No key found")
    exit()

print(f"Key found: {key[:5]}...")
genai.configure(api_key=key)

try:
    print("Listing models...")
    for m in genai.list_models():
        print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")
