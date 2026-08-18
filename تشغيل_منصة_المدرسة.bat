@echo off
title تشغيل منصة مدرسة النور الذكية
color 0A
echo ============================================================
echo   جاري تشغيل منصة مدرسة النور الذكية...
echo ============================================================
echo.

cd /d "c:\Users\Hussein\Desktop\school-portal"

timeout /t 2 >nul
start "" "http://localhost:5173/"

powershell -ExecutionPolicy Bypass -Command "npm run dev"
pause
