@echo off
echo ==========================================
echo SmartDoc Connectivity Troubleshooter
echo ==========================================
echo.

echo 1. Checking TCP Port 8000 (Backend)...
netstat -an | find "8000"
if %ERRORLEVEL% EQU 0 (
    echo [OK] Port 8000 is listening.
) else (
    echo [ERROR] Port 8000 is NOT listening. The backend is likely not running or crashed.
)

echo.
echo 2. Pinging 127.0.0.1...
ping 127.0.0.1 -n 1 >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Localhost (127.0.0.1) is reachable.
) else (
    echo [ERROR] Localhost is unreachable. Something is wrong with your network (IPv4).
)

echo.
echo ==========================================
echo Try refreshing the page in your browser.
echo If you see [ERROR] above, connect to me and I will help.
echo ==========================================
pause
