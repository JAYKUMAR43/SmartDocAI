$ErrorActionPreference = "Stop"

Write-Host "Downloading FFmpeg (Essentials Build)..."
$url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$zipPath = "ffmpeg.zip"

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
if (Test-Path "ffmpeg_temp") { Remove-Item "ffmpeg_temp" -Recurse -Force }

# Download
Invoke-WebRequest -Uri $url -OutFile $zipPath

Write-Host "Extracting FFmpeg..."
Expand-Archive -Path $zipPath -DestinationPath "ffmpeg_temp" -Force

Write-Host "Installing to backend/bin..."
# FIXED PATH: Use current directory + backend/bin
$binDir = Join-Path (Get-Location) "backend\bin"
Write-Host "Target Directory: $binDir"

if (!(Test-Path $binDir)) {
    New-Item -ItemType Directory -Force -Path $binDir | Out-Null
}

$ffmpegExe = Get-ChildItem -Path "ffmpeg_temp" -Recurse -Filter "ffmpeg.exe" | Select-Object -First 1

if ($ffmpegExe) {
    Copy-Item -Path $ffmpegExe.FullName -Destination $binDir -Force
    Write-Host "FFmpeg installed successfully to $binDir"
}
else {
    Write-Host "Error: Could not find ffmpeg.exe."
}

# Cleanup
if (Test-Path $zipPath) { Remove-Item -Path $zipPath -Force }
if (Test-Path "ffmpeg_temp") { Remove-Item -Path "ffmpeg_temp" -Recurse -Force }

Write-Host "Done."
