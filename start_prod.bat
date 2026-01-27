@echo off
title SmartDoc AI - Production Mode
echo ===================================================
echo Starting SmartDoc AI (Optimized Mode)
echo ===================================================

if not exist "frontend\.next" (
    echo [WARNING] No build found.
    echo Please run 'build_app.bat' first!
    echo.
    pause
    exit /b
)

:: Start Backend
echo Starting Backend...
start "SmartDoc Backend" cmd /k "cd backend && title SmartDoc Backend && uvicorn app.main:app --workers 4"

:: Start Frontend
echo Starting Frontend...
start "SmartDoc Frontend" cmd /k "cd frontend && title SmartDoc Frontend && npm start"

echo.
echo ===================================================
echo Services started!
echo.
echo Backend API: http://localhost:8000
echo Frontend UI: http://localhost:3000
echo.
echo The app should be instant now.
echo ===================================================
pause
