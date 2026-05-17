#!/bin/bash
# GuideLens Setup Script for macOS/Linux
# This script helps you set up the GuideLens project

echo
echo "╔════════════════════════════════════════╗"
echo "║  GuideLens Setup Script                ║"
echo "╚════════════════════════════════════════╝"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found:"
node --version
npm --version
echo

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo

# Create .env files from examples
echo "🔧 Setting up environment variables..."

if [ ! -f backend/.env ]; then
    echo "   Creating backend/.env..."
    cp backend/.env.example backend/.env
    echo "   ⚠️  IMPORTANT: Edit backend/.env and add your Azure credentials"
else
    echo "   ✅ backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    echo "   Creating frontend/.env..."
    cp frontend/.env.example frontend/.env
else
    echo "   ✅ frontend/.env already exists"
fi

echo
echo "╔════════════════════════════════════════╗"
echo "║  Setup Complete!                       ║"
echo "╚════════════════════════════════════════╝"
echo
echo "📋 Next steps:"
echo
echo "1. Configure Azure credentials:"
echo "   - Open: backend/.env"
echo "   - Add your Azure Computer Vision endpoint and API key"
echo "   - Learn how: See README.md > Setup > Configure Environment Variables"
echo
echo "2. Start the app:"
echo "   npm run dev"
echo "   (Both frontend and backend will start)"
echo
echo "3. Open in browser:"
echo "   http://localhost:5173"
echo
echo "4. Grant camera and microphone permissions when prompted"
echo
echo "For more details, see README.md"
echo
