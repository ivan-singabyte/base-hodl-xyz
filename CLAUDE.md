# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HODL Vault is a decentralized time-locked token vault dApp on Base network. Users can lock ERC-20 tokens for fixed durations (1 day to 10 years) with no early withdrawal capability. Built with Next.js, OnchainKit, and Solidity smart contracts.

## Common Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Smart Contract Development
```bash
# Compile contracts
npx hardhat compile

# Run contract tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy-local.js --network hardhat

# Deploy to Base Sepolia testnet
npx hardhat run scripts/deploy.js --network baseSepolia

# Verify contract on Basescan
npx hardhat run scripts/verify.js --network baseSepolia
```

## Architecture Overview

### Smart Contract Layer
- **Core Contract**: `contracts/HodlVault.sol` - Fully autonomous, no admin functions
- **Key Features**: 
  - Fixed duration locks (1 day, 30 days, 180 days, 365 days, 1095 days, 3650 days)
  - No early withdrawal mechanism
  - ReentrancyGuard protection
  - SafeERC20 for token handling

### Frontend Architecture
- **Framework**: Next.js 15.3 with App Router
- **Web3 Stack**: 
  - Wagmi for React hooks
  - Viem for Ethereum interface
  - RainbowKit for wallet connection
  - OnchainKit for Coinbase wallet integration
- **State Management**: React Context (AuthContext)
- **Styling**: Tailwind CSS with Framer Motion animations

### Key Frontend Components
- `app/page.tsx` - Main lock creation interface
- `app/dashboard/page.tsx` - User's locks dashboard
- `app/components/ActiveLocks.tsx` - Display user's active locks
- `app/components/LockConfirmation.tsx` - Lock transaction flow
- `app/components/ClaimFlow.tsx` - Token claiming interface
- `app/lib/tokenService.ts` - Token data management
- `app/lib/farcaster.ts` - Social sharing integration

## Environment Configuration

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=       # OnchainKit API key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID= # WalletConnect project ID  
NEXT_PUBLIC_VAULT_ADDRESS=             # Deployed HodlVault contract address
NEXT_PUBLIC_URL=                       # Application URL
```

For contract deployment, add to `.env`:
```
PRIVATE_KEY=                           # Deployer wallet private key
BASE_SEPOLIA_RPC_URL=                 # Base Sepolia RPC endpoint
ETHERSCAN_API_KEY=                    # For contract verification
```

## Testing Approach

### Contract Tests
- Located in `test/HodlVault.test.js`
- Uses Hardhat testing framework with Chai assertions
- Tests cover lock creation, claiming, edge cases, and security

### Frontend Testing
- Manual testing scripts in `scripts/`:
  - `test-lock.js` - Test lock creation
  - `test-share-urls.js` - Test social sharing
  - `check-wallet.js` - Verify wallet balances

## Key Technical Decisions

1. **No Admin Functions**: Contract is fully autonomous for maximum trust
2. **Fixed Durations Only**: Simplifies UX and enables standardized social proof
3. **No Partial Claims**: One lock = one claim for commitment integrity  
4. **Base Network**: Low fees (~$0.01-0.10) with fast finality
5. **No Contract Upgradability**: Immutable by design for security

## Security Considerations

- All token transfers use OpenZeppelin's SafeERC20
- ReentrancyGuard on all state-changing functions
- Checks-Effects-Interactions pattern followed
- No external dependencies or oracles
- Comprehensive input validation

## Development Workflow

1. Frontend changes: Edit files in `app/` directory
2. Contract changes: Edit `contracts/HodlVault.sol` and run tests
3. Always run linting before commits: `npm run lint`
4. Test contract changes: `npx hardhat test`
5. Deploy to testnet first before mainnet deployment