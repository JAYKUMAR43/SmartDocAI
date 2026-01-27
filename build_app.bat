@echo off
echo ===================================================
echo Building SmartDoc AI for Production
echo ===================================================
echo.

cd frontend
if not exist "node_modules" (
    echo Installing dependencies...
    cmd /c npm install
)

echo Building Frontend (this may take a minute)...
cmd /c npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed. Please check the errors above.
    pause
    exit /b %ERRORLEVEL%

)

echo.
echo ===================================================
echo Build Complete! You can now run 'start_prod.bat'
echo ===================================================
pause
