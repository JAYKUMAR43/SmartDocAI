import os
import shutil
import time
from pathlib import Path
from app.core import config

def delete_path(path_str: str):
    """
    Securely deletes a file or directory.
    """
    try:
        path = Path(path_str)
        if not path.exists():
            return

        if path.is_file():
            os.remove(path)
            # Try to remove parent directory if it's empty (often session dir)
            try:
                parent = path.parent
                if not any(parent.iterdir()):
                   parent.rmdir()
            except:
                pass
        elif path.is_dir():
            shutil.rmtree(path)
            
        print(f"Cleanup: Deleted {path_str}")
    except Exception as e:
        print(f"Cleanup Error for {path_str}: {e}")

def cleanup_old_files(max_age_seconds: int = 900):
    """
    Scans the TEMP_DIR and removes any files/directories older than max_age_seconds (default 15 mins).
    This handles orphaned files where the user never downloaded the result.
    """
    try:
        temp_dir = config.TEMP_DIR
        current_time = time.time()
        
        count = 0
        for item in temp_dir.iterdir():
            # Skip .gitignore or specific system files if any
            if item.name.startswith("."):
                continue
                
            item_stats = item.stat()
            # use mtime (modification time)
            if current_time - item_stats.st_mtime > max_age_seconds:
                delete_path(str(item))
                count += 1
                
        if count > 0:
            print(f"Cleanup: Removed {count} old session directories/files.")
            
    except Exception as e:
        print(f"Cleanup Scan Error: {e}")
