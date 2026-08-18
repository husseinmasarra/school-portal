@echo off
title منصة مدرسة النور النموذجية الذكية
color 0A
echo ============================================================
echo   منصة مدرسة النور النموذجية الذكية
echo ============================================================
echo.
echo جاري تشغيل خادم المنصة وتوجيه المتصفح تلقائياً...
echo.

cd /d "%~dp0"

timeout /t 2 >nul
start "" "http://localhost:5173/"

powershell -ExecutionPolicy Bypass -Command "npm run dev"
pause
