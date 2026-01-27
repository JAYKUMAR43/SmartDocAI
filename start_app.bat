@echo off
echo Starting SmartDoc AI Platform (Fast Mode)...

:: Start Backend
start "SmartDoc Backend" cmd /k "cd backend && title SmartDoc Backend && echo Starting Backend... && uvicorn app.main:app --reload"

:: Start Frontend with Turbo
start "SmartDoc Frontend" cmd /k "cd frontend && title SmartDoc Frontend && echo Starting Frontend with Turbopack... && npm run dev"

echo.
echo ========================================================
echo Services are starting...
echo.
echo Backend API: http://localhost:8000
echo Frontend UI: http://localhost:3000
echo.
echo Note: First time startup might still take a few seconds
echo to compile, but subsequent starts will be instant.
echo ========================================================
pause
