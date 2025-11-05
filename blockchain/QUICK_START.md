# Quick Start Commands for E-Auction Blockchain

## 🚀 Setup Steps

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
```bash
npm run node
```
**Keep this terminal open!** It runs the local blockchain.

### 4. Deploy Contract (in a new terminal)
```bash
cd blockchain
npm run deploy:local
```

**Copy the contract address** that gets printed!

### 5. Connect MetaMask to Local Network

1. Open MetaMask extension
2. Click network dropdown → Add Network → Add Network Manually
3. Enter:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
4. Click Save

### 6. Import Test Account

When you run `npm run node`, it shows test accounts with private keys like:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

1. Copy a private key
2. In MetaMask → Import Account → Paste private key
3. Now you have test ETH!

### 7. Update Frontend Contract Address

After deployment, update `EAuction/admin/src/services/blockchain.ts`:
```typescript
export const CONTRACT_ADDRESS = "0x..." // Your deployed address
```

### 8. Run Frontend
```bash
cd admin
npm run dev
```

## ✅ Verification

- ✅ MetaMask installed → Shows "Connect MetaMask" button
- ✅ MetaMask connected → Shows address and balance
- ✅ MetaMask NOT connected → **Nothing works** (as requested!)

## 🔄 Daily Workflow

1. Start Hardhat node: `npm run node`
2. Deploy if needed: `npm run deploy:local`
3. Run frontend: `cd admin && npm run dev`
4. Connect MetaMask → Everything works!

## 📝 Important Notes

- **If MetaMask is NOT connected**: All features are disabled
- **If MetaMask IS connected**: All features work normally
- Contract must be deployed before frontend can interact
- Use test accounts from Hardhat node (they have free ETH)

