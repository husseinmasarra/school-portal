@echo off
title Al-Noor Smart School Portal Server
color 0A
echo ============================================================
echo   Al-Noor Smart Model School Portal
echo   منصة مدرسة النور النموذجية الذكية
echo ============================================================
echo.
echo [1/2] Starting local web server...
echo [2/2] Opening browser at http://localhost:5173/ ...
echo.

cd /d "%~dp0"

timeout /t 2 >nul
start "" "http://localhost:5173/"

powershell -ExecutionPolicy Bypass -Command "npm run dev"
pause
