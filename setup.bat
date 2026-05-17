@echo off
REM GuideLens Setup Script for Windows
REM This script helps you set up the GuideLens project

echo.
echo ╔════════════════════════════════════════╗
echo ║  GuideLens Setup Script (Windows)      ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo   Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
npm --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Create .env files from examples
echo 🔧 Setting up environment variables...

if not exist backend\.env (
    echo   Creating backend\.env...
    copy backend\.env.example backend\.env
    echo   ⚠️  IMPORTANT: Edit backend\.env and add your Azure credentials
) else (
    echo   ✅ backend\.env already exists
)

if not exist frontend\.env (
    echo   Creating frontend\.env...
    copy frontend\.env.example frontend\.env
) else (
    echo   ✅ frontend\.env already exists
)

echo.
echo ╔════════════════════════════════════════╗
echo ║  Setup Complete!                       ║
echo ╚════════════════════════════════════════╝
echo.
echo 📋 Next steps:
echo.
echo 1. Configure Azure credentials:
echo    - Open: backend\.env
echo    - Add your Azure Computer Vision endpoint and API key
echo    - Learn how: See README.md > Setup > Configure Environment Variables
echo.
echo 2. Start the app:
echo    npm run dev
echo    (Both frontend and backend will start)
echo.
echo 3. Open in browser:
echo    http://localhost:5173
echo.
echo 4. Grant camera and microphone permissions when prompted
echo.
echo For more details, see README.md
echo.
pause
