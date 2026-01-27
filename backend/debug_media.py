import os
import subprocess
from pathlib import Path

# Replicate the logic from config.py to match paths exactly
BASE_DIR = Path(__file__).resolve().parent
local_ffmpeg = os.path.join(BASE_DIR, "bin", "ffmpeg.exe")

print(f"Base Directory: {BASE_DIR}")
print(f"Checking for FFmpeg at: {local_ffmpeg}")

if os.path.exists(local_ffmpeg):
    print("File exists.")
    print(f"Size: {os.path.getsize(local_ffmpeg)} bytes")
    
    try:
        print("Attempting to run 'ffmpeg -version'...")
        result = subprocess.run([local_ffmpeg, "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode == 0:
            print("Success! FFmpeg is working.")
            print(result.stdout[:200]) # First 200 chars
        else:
            print(f"Failed with code {result.returncode}")
            print("Stderr:", result.stderr)
    except Exception as e:
        print(f"Exception running FFmpeg: {e}")
else:
    print("File DOES NOT exist.")
