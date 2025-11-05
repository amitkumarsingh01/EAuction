#!/bin/bash

# E-Auction Blockchain Setup Script
# This script helps you set up the blockchain environment quickly

echo "🚀 E-Auction Blockchain Setup"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if we're in the blockchain directory
if [ ! -f "package.json" ]; then
    echo "📁 Changing to blockchain directory..."
    cd blockchain || exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Compile contracts
echo "🔨 Compiling contracts..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Failed to compile contracts"
    exit 1
fi

echo "✅ Contracts compiled"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start Hardhat node: npm run node"
echo "2. Deploy contract: npm run deploy:local"
echo "3. Copy the contract address"
echo "4. Update frontend with contract address"
echo "5. Connect MetaMask to local network (Chain ID: 1337)"
echo ""
echo "📖 See README.md for detailed instructions"

