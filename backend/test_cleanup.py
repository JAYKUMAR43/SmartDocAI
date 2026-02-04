from fastapi.testclient import TestClient
from app.main import app
from app.services import cleanup_service
from app.core import config
import os
import time
import shutil
import uuid

client = TestClient(app)

def test_direct_cleanup():
    print("\n[Test] Direct Cleanup Service...")
    # Setup
    test_dir = config.TEMP_DIR / f"test_cleanup_{uuid.uuid4()}"
    test_dir.mkdir()
    (test_dir / "test.txt").write_text("content")
    
    # Action
    cleanup_service.delete_path(str(test_dir))
    
    # Assert
    if not test_dir.exists():
        print("PASS: Directory deleted successfully.")
    else:
        print("FAIL: Directory still exists.")

def test_old_files_cleanup():
    print("\n[Test] Old Files Cleanup...")
    # Setup
    old_dir = config.TEMP_DIR / f"old_{uuid.uuid4()}"
    old_dir.mkdir()
    
    new_dir = config.TEMP_DIR / f"new_{uuid.uuid4()}"
    new_dir.mkdir()
    
    # Mock time for old dir (set mtime to 20 mins ago)
    past_time = time.time() - 1200
    os.utime(old_dir, (past_time, past_time))
    
    # Action (cleanup files older than 10 mins)
    cleanup_service.cleanup_old_files(max_age_seconds=600)
    
    # Assert
    if not old_dir.exists() and new_dir.exists():
        print("PASS: Old directory removed, new directory kept.")
    else:
        print(f"FAIL: State incorrect. Old exists: {old_dir.exists()}, New exists: {new_dir.exists()}")
        
    # Cleanup new if it survived
    if new_dir.exists():
        shutil.rmtree(new_dir)

def test_api_download_cleanup():
    print("\n[Test] API Download Cleanup Trigger...")
    
    # 1. Upload a file
    # We need a recognizable filename
    with open("temp_test_upload.txt", "w") as f:
        f.write("test content")
        
    try:
        with open("temp_test_upload.txt", "rb") as f:
            response = client.post("/documents/upload", files={"file": ("temp_test_upload.txt", f, "text/plain")})
            
        if response.status_code != 200:
            print(f"FAIL: Upload failed {response.text}")
            return
            
        data = response.json()
        file_id = data["file_id"]
        file_path = data["path"]
        
        print(f"Uploaded file_id: {file_id}")
        
        if not os.path.exists(file_path):
             print("FAIL: File was not saved to storage.")
             return
             
        # 2. Download the file
        # The file is saved as 'original.txt' (or whatever extension) on the server
        file_ext = os.path.splitext(data["filename"])[1]
        filename = f"original{file_ext}"
        
        print(f"Downloading {filename}...")
        
        # NOTE: TestClient runs background tasks synchronously after the request
        dl_response = client.get(f"/documents/download/{file_id}/{filename}")
        
        if dl_response.status_code != 200:
             print(f"FAIL: Download failed {dl_response.text}")
             return
             
        # 3. Verify deletion
        # The session directory should represent the file_id
        session_dir = os.path.dirname(file_path)
        
        if not os.path.exists(session_dir):
            print("PASS: Session directory was autos-deleted after download.")
        else:
            print(f"FAIL: Session directory still exists at {session_dir}")
            
    finally:
        if os.path.exists("temp_test_upload.txt"):
            os.remove("temp_test_upload.txt")

if __name__ == "__main__":
    test_direct_cleanup()
    test_old_files_cleanup()
    test_api_download_cleanup()
