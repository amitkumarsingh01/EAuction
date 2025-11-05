@echo off
REM E-Auction Blockchain Setup Script for Windows
REM This script helps you set up the blockchain environment quickly

echo 🚀 E-Auction Blockchain Setup
echo ==============================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo ✅ Node.js found:
node --version
echo.

REM Check if we're in the blockchain directory
if not exist "package.json" (
    echo 📁 Changing to blockchain directory...
    cd blockchain
    if errorlevel 1 (
        echo ❌ blockchain directory not found
        exit /b 1
    )
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Compile contracts
echo 🔨 Compiling contracts...
call npm run compile

if errorlevel 1 (
    echo ❌ Failed to compile contracts
    exit /b 1
)

echo ✅ Contracts compiled
echo.

echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Start Hardhat node: npm run node
echo 2. Deploy contract: npm run deploy:local
echo 3. Copy the contract address
echo 4. Update frontend with contract address
echo 5. Connect MetaMask to local network (Chain ID: 1337)
echo.
echo 📖 See README.md for detailed instructions
pause

