@echo off
REM Score Update Fix Script for Windows
REM Fixes interview score not updating issues

echo.
echo 🔧 Virtual Agent Score Update Fix
echo ====================================
echo.

REM Kill all Node processes
echo Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Reset database to clean slate
echo Resetting database...
if exist "backend\data\interview_platform.db" (
  del "backend\data\interview_platform.db"
  echo   ✓ Database cleared
) else (
  echo   ℹ New database will be created
)

REM Start backend server
echo.
echo Starting backend server...
cd backend
start /B "Backend Server" node server.js
timeout /t 3 /nobreak >nul
cd ..

REM Start frontend server
echo Starting frontend server...
cd frontend
start /B "Frontend Server" npm run dev
timeout /t 5 /nobreak >nul
cd ..

REM Verify servers are running
echo.
echo Verifying servers...

REM Check backend
powershell -Command "try { $Health = Invoke-WebRequest -Uri 'http://localhost:8001/health' -UseBasicParsing -ErrorAction Stop; Write-Host '  ✅ Backend running on port 8001' } catch { Write-Host '  ❌ Backend not responding - check port 8001' }"

REM Check frontend
powershell -Command "try { $FE = Invoke-WebRequest -Uri 'http://localhost:5173/' -UseBasicParsing -ErrorAction Stop; Write-Host '  ✅ Frontend running on port 5173' } catch { Write-Host '  ⚠️  Frontend not yet ready - may still be starting' }"

echo.
echo ✅ Setup Complete!
echo.
echo 📋 Next Steps:
echo   1. Open http://localhost:5173/ in your browser
echo   2. Register with NEW credentials:
echo      - Username: testuser (or choose unique name)
echo      - Password: TestPass123 (must have uppercase, lowercase, number)
echo      - Name: your name
echo      - Email: optional
echo   3. After successful registration, go to "Start Demo" 
echo   4. Select "SDE-1 Product-based" role
echo   5. Take the interview:
echo      - Answer all 5 questions thoroughly
echo      - Click "Next Question" for first 4 questions
echo      - Click "Complete Interview" on the last question  
echo   6. Wait for results modal to appear
echo   7. Click "View Profile" to see the updated score
echo   8. Your interview should appear in the history with a score!
echo.
echo 🐛 Troubleshooting:
echo   - If no score appears: Check Chrome DevTools (F12) Console for errors
echo   - If stuck on "Connecting": Backend may not be ready, wait 10 seconds
echo   - If 404 error: Make sure you registered (not using demo-user)
echo   - To reset everything: Just run this script again
echo.
echo 📖 For detailed help, see: SCORE_UPDATE_TROUBLESHOOTING.md
echo.
pause
