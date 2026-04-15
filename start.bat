@echo off
title VEGA Platform Launcher
color 0A

echo.
echo  ██╗   ██╗███████╗ ██████╗  █████╗
echo  ██║   ██║██╔════╝██╔════╝ ██╔══██╗
echo  ██║   ██║█████╗  ██║  ███╗███████║
echo  ╚██╗ ██╔╝██╔══╝  ██║   ██║██╔══██║
echo   ╚████╔╝ ███████╗╚██████╔╝██║  ██║
echo    ╚═══╝  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝
echo.
echo  Security Research and Attack Simulation Platform
echo  ─────────────────────────────────────────────────
echo.

:: Start Backend in a new terminal window
echo [1/2] Starting VEGA Backend (FastAPI)...
start "VEGA Backend" cmd /k "cd /d d:\VEGA\backend && echo. && echo  VEGA Backend — http://localhost:8000 && echo  API Docs — http://localhost:8000/docs && echo. && python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

:: Start Frontend in a new terminal window
echo [2/2] Starting VEGA Frontend (Vite)...
start "VEGA Frontend" cmd /k "cd /d d:\VEGA\frontend && echo. && echo  VEGA Frontend — http://localhost:5173 && echo. && npm run dev"

echo.
echo  Both services are starting in separate terminals.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000
echo.
pause
