# E-Auction Blockchain Contracts

This directory contains the Solidity smart contracts for the E-Auction platform using Hardhat.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Hardhat

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd blockchain
npm install
```

### 2. Compile Contracts

```bash
npm run compile
```

### 3. Start Local Hardhat Node

Open a new terminal and run:

```bash
npm run node
```

This will start a local blockchain node on `http://127.0.0.1:8545`

### 4. Deploy to Local Network

In another terminal:

```bash
npm run deploy:local
```

This will deploy the contract and give you the contract address. **Save this address!**

### 5. Connect MetaMask to Local Network

1. Open MetaMask
2. Go to Settings > Networks > Add Network
3. Add a network manually:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH

4. Import one of the test accounts from Hardhat:
   - When you run `npm run node`, it will show accounts with private keys
   - Copy a private key and import it into MetaMask

## 📝 Contract Functions

### Create Auction
```solidity
createAuction(string memory _productName, uint256 _basePrice, uint256 _duration)
```

### Place Bid
```solidity
placeBid(uint256 _auctionId) // Send ETH with transaction
```

### End Auction
```solidity
endAuction(uint256 _auctionId)
```

### Get Auction Details
```solidity
getAuction(uint256 _auctionId)
```

## 🔗 Frontend Integration

After deploying, update your frontend with the contract address:

1. Copy the deployed contract address
2. Update `EAuction/admin/src/services/blockchain.ts` with the contract address
3. Add the contract ABI from `artifacts/contracts/Auction.sol/SimpleAuction.json`

## 🧪 Testing

```bash
npm test
```

## 📦 Contract Addresses

After deployment, save your contract addresses here:

- **Localhost**: `0x...` (update after deployment)
- **Testnet**: `0x...` (update after deployment)

## 🔐 Security Notes

- Never commit your `.env` file with real private keys
- Always test on testnet before mainnet
- Use environment variables for sensitive data

## 🛠️ Available Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Start local node
npm run node

# Deploy to localhost
npm run deploy:local

# Deploy to testnet (requires .env setup)
npm run deploy:testnet
```

## 📚 Contract Details

- **Contract Name**: SimpleAuction
- **Solidity Version**: 0.8.20
- **License**: MIT

## ⚠️ Important

**The frontend will only work if MetaMask is connected!**

- If MetaMask is not connected → Nothing works
- If MetaMask is connected → All features work

Make sure to:
1. Deploy the contract
2. Update contract address in frontend
3. Connect MetaMask
4. Switch to the correct network

