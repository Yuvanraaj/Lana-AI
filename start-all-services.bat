@echo off
title Virtual Agent - Multi-Service Startup
color 0A

REM This batch file starts all three services in separate terminal windows:
REM 1. Backend (Node.js on port 8001)
REM 2. Frontend (Vite on port 5173)  
REM 3. Cloudflare Tunnel

cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║        Virtual Agent - Multi-Service Launcher              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Starting services...
echo.

REM Get the current directory
set VSCODE_ROOT=%CD%

REM Terminal 1: Backend
echo Starting Backend (Node.js)...
start "Virtual Agent - Backend" cmd /k "cd /d %VSCODE_ROOT%\Virtual_Agent1\backend && npm run dev"

REM Give backend time to start
timeout /t 3 /nobreak

REM Terminal 2: Frontend
echo Starting Frontend (Vite)...
start "Virtual Agent - Frontend" cmd /k "cd /d %VSCODE_ROOT%\Virtual_Agent1\frontend && npm run dev"

REM Give frontend time to start
timeout /t 3 /nobreak

REM Terminal 3: Cloudflare Tunnel
echo Starting Cloudflare Tunnel...
start "Virtual Agent - Cloudflare Tunnel" cmd /k "cloudflared tunnel run virtual-agent"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  All services started!                     ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Backend:      http://localhost:8001                       ║
echo ║  Frontend:     http://localhost:5173                       ║
echo ║  API Health:   http://localhost:8001/health                ║
echo ║  Tunnel:       Check the tunnel window for public URLs     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Configuration files:
echo - Tunnel Config:  %USERPROFILE%\.cloudflared\config.yml
echo - Frontend Env:   %CD%\Virtual_Agent1\frontend\.env.local
echo.
echo To stop services, close the individual terminal windows.
echo.
pause
