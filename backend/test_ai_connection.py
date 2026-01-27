import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")

if not key:
    print("FATAL: No API Key found.")
    exit(1)

genai.configure(api_key=key)

print("--- Listing Available Models ---")
found_models = []
try:
    for m in genai.list_models():
        print(f"Found: {m.name}")
        if 'generateContent' in m.supported_generation_methods:
            found_models.append(m.name)
except Exception as e:
    print(f"Error listing models: {e}")
    print("\nPOSSIBLE CAUSE: The 'Generative Language API' is not enabled in your Google Cloud Console for this API Key.")

print(f"\n--- Testing Generation with Found Models ---")
if not found_models:
    print("No generation models found available for this API Key.")
else:
    for model_name in found_models:
        print(f"Testing {model_name}...")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Hello")
            print(f"SUCCESS with {model_name}!")
            # We found a working one, we can stop or keep checking
            # break 
        except Exception as e:
            print(f"Failed: {e}")

print("\n--- Done ---")
