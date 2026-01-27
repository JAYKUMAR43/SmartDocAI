import os
import subprocess
from PIL import Image
from app.core.config import settings

def compress_image(image_path: str, quality: int = 60, target_size_kb: int = None) -> str:
    """
    Compresses an image using Pillow.
    If target_size_kb is provided, iterates to reduce quality/size until it matches.
    Returns the output filename.
    """
    directory, filename = os.path.split(image_path)
    name, ext = os.path.splitext(filename)
    output_filename = f"{name}_compressed{ext}"
    output_path = os.path.join(directory, output_filename)
    
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
                
            # Initial save
            img.save(output_path, optimize=True, quality=quality)
            
            # If target size is specified, check and retry
            if target_size_kb:
                target_bytes = target_size_kb * 1024
                file_size = os.path.getsize(output_path)
                
                # Iteration 1: Reduce quality
                current_quality = quality
                while file_size > target_bytes and current_quality > 10:
                    current_quality -= 10
                    img.save(output_path, optimize=True, quality=current_quality)
                    file_size = os.path.getsize(output_path)
                    
                # Iteration 2: Reduce Dimensions if still too big
                width, height = img.size
                scale_factor = 0.9
                while file_size > target_bytes and width > 300:
                    width = int(width * scale_factor)
                    height = int(height * scale_factor)
                    resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
                    resized_img.save(output_path, optimize=True, quality=current_quality)
                    file_size = os.path.getsize(output_path)
            
        return output_filename
    except Exception as e:
        raise Exception(f"Image compression failed: {str(e)}")



def get_video_duration(video_path: str, ffmpeg_cmd: str) -> float:
    import re
    cmd = [ffmpeg_cmd, "-i", video_path]
    # ffmpeg prints info to stderr
    result = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    match = re.search(r"Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})", result.stderr)
    if match:
        hours, minutes, seconds = map(float, match.groups())
        return hours * 3600 + minutes * 60 + seconds
    return 0

def compress_video(video_path: str, crf: int = 28, target_size_kb: int = None) -> str:
    """
    Compresses a video using FFmpeg.
    """
    directory, filename = os.path.split(video_path)
    name, ext = os.path.splitext(filename)
    output_filename = f"{name}_compressed{ext}"
    output_path = os.path.join(directory, output_filename)
    
    # Determine FFmpeg path
    local_ffmpeg = os.path.join(settings.BASE_DIR, "bin", "ffmpeg.exe")
    if os.path.exists(local_ffmpeg):
        ffmpeg_cmd = local_ffmpeg
    else:
        ffmpeg_cmd = "ffmpeg"

    # Check if ffmpeg is available
    if ffmpeg_cmd == "ffmpeg":
         if subprocess.call("ffmpeg -version", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) != 0:
            raise Exception("FFmpeg is not installed (checked PATH and backend/bin/ffmpeg.exe).")

    if target_size_kb:
        duration = get_video_duration(video_path, ffmpeg_cmd)
        if duration > 0:
            # Calculate total bitrate in bits per second
            # Safe margin: target 90% of size to convert metadata/audio overhead
            target_bits = (target_size_kb * 1024 * 8) * 0.9
            total_bitrate = int(target_bits / duration)
            
            # Assume 128k audio if possible, or just let ffmpeg handle it by setting global bitrate?
            # Better to set video bitrate. Let's assume audio is ~128k (128000 bits)
            video_bitrate = max(100000, total_bitrate - 128000)
            
            command = [
                ffmpeg_cmd, 
                "-i", video_path, 
                "-b:v", str(video_bitrate),
                "-maxrate", str(int(video_bitrate * 1.5)),
                "-bufsize", str(int(video_bitrate * 2)),
                "-y", 
                output_path
            ]
        else:
             # Fallback if duration fails
             command = [
                ffmpeg_cmd, "-i", video_path, "-vcodec", "libx264", "-crf", str(crf), "-y", output_path
            ]
    else:
        command = [
            ffmpeg_cmd, 
            "-i", video_path, 
            "-vcodec", "libx264", 
            "-crf", str(crf), 
            "-y", # Overwrite output
            output_path
        ]
    
    try:
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return output_filename
    except subprocess.CalledProcessError as e:
        raise Exception(f"Video compression failed: {str(e)}")
