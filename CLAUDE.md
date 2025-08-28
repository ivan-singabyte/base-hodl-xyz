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

## Project File Structure

```
base-hodl-xyz/
├── app/                        # Next.js application directory
│   ├── .well-known/           # Well-known URIs for external services
│   │   └── farcaster.json/    # Farcaster frame configuration
│   ├── components/            # React components
│   │   ├── ActiveLocks.tsx    # Display user's active locks
│   │   ├── AmountInput.tsx    # Token amount input component
│   │   ├── AnimatedCard.tsx   # Animated card wrapper
│   │   ├── ClaimFlow.tsx      # Token claiming interface
│   │   ├── Countdown.tsx      # Lock countdown timer
│   │   ├── DurationPicker.tsx # Lock duration selector
│   │   ├── FrameWrapper.tsx   # Farcaster frame wrapper
│   │   ├── LoadingSpinner.tsx # Loading state indicator
│   │   ├── LockCard.tsx       # Individual lock display card
│   │   ├── LockConfirmation.tsx # Lock transaction flow
│   │   ├── ShareButton.tsx    # Social sharing component
│   │   ├── Skeleton.tsx       # Loading skeleton component
│   │   ├── ThemeToggle.tsx    # Dark/light theme switcher
│   │   ├── TokenSelector.tsx  # ERC-20 token picker
│   │   └── UserProfile.tsx    # User wallet profile display
│   ├── contexts/              # React context providers
│   │   └── AuthContext.tsx    # Authentication state management
│   ├── dashboard/             # Dashboard route
│   │   └── page.tsx          # User's locks dashboard page
│   ├── hooks/                 # Custom React hooks
│   │   ├── useErrorHandler.tsx # Error handling hook
│   │   └── useRetry.tsx      # Retry logic hook
│   ├── lib/                   # Utility libraries
│   │   ├── env.ts            # Environment variable validation
│   │   ├── farcaster.ts      # Farcaster integration utilities
│   │   └── tokenService.ts   # Token data and metadata service
│   ├── providers/             # Provider configurations
│   ├── svg/                   # SVG components
│   │   ├── ArrowSvg.tsx      # Arrow icon component
│   │   ├── Image.tsx         # Image SVG wrapper
│   │   └── OnchainKit.tsx    # OnchainKit logo
│   ├── utils/                 # Utility functions
│   │   └── formatBalance.ts  # Token balance formatting
│   ├── globals.css           # Global CSS styles
│   ├── layout.tsx            # Root layout component
│   ├── page.tsx              # Main home page (lock creation)
│   └── providers.tsx         # App-wide providers setup
├── artifacts/                 # Hardhat compilation artifacts
│   ├── @openzeppelin/        # OpenZeppelin contract artifacts
│   ├── build-info/           # Build metadata
│   └── contracts/            # Project contract artifacts
│       ├── HodlVault.sol/    # Main vault contract artifacts
│       └── TestERC20.sol/    # Test token artifacts
├── cache/                     # Hardhat cache files
├── contracts/                 # Solidity smart contracts
│   ├── HodlVault.sol         # Main vault contract
│   └── TestERC20.sol         # Test ERC-20 token
├── public/                    # Static assets
│   ├── .well-known/          # Well-known URIs
│   ├── android-chrome-*.png  # Android app icons
│   ├── apple-*.png           # Apple app icons
│   ├── favicon*.png          # Favicon files
│   ├── icon-*.png            # Various size app icons
│   ├── manifest.json         # PWA manifest
│   └── og-image.png          # Open Graph social image
├── scripts/                   # Utility and deployment scripts
│   ├── check-env.js          # Environment variable checker
│   ├── check-wallet.js       # Wallet balance checker
│   ├── deploy-local.js       # Local deployment script
│   ├── deploy.js             # Mainnet/testnet deployment
│   ├── generate-icons.js     # Icon generation script
│   ├── test-lock.js          # Lock testing script
│   ├── test-share-urls.js    # Social sharing test
│   ├── validate-embeds.js    # Embed validation
│   ├── validate-manifest.js  # Manifest validation
│   └── verify.js             # Contract verification script
├── test/                      # Test files
│   └── HodlVault.test.js     # Contract unit tests
├── .env.example              # Example environment variables
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore patterns
├── CLAUDE.md                 # This file - Claude Code guidance
├── CONTRIBUTING.md           # Contribution guidelines
├── hardhat.config.js         # Hardhat configuration
├── LICENSE                   # MIT license
├── next.config.mjs           # Next.js configuration
├── package.json              # Node.js dependencies
├── postcss.config.mjs        # PostCSS configuration
├── README.md                 # Project documentation
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── vercel.json               # Vercel deployment config
```

## Directory Documentation

### `/app` - Next.js Application
The main application directory following Next.js 15 App Router structure. Contains all frontend code, components, and routing logic.

#### `/app/components`
Reusable React components for the UI. Each component is self-contained with its own props interface and handles specific functionality:
- **Lock Management**: ActiveLocks, LockCard, LockConfirmation, ClaimFlow
- **Input Components**: AmountInput, DurationPicker, TokenSelector
- **UI Elements**: AnimatedCard, LoadingSpinner, Skeleton, ThemeToggle
- **Social Features**: ShareButton, FrameWrapper, UserProfile

#### `/app/lib`
Core business logic and service layers:
- `tokenService.ts`: Manages token metadata, balances, and allowances
- `farcaster.ts`: Handles Farcaster frame generation and sharing
- `env.ts`: Runtime environment variable validation

#### `/app/hooks`
Custom React hooks for common functionality:
- `useErrorHandler`: Centralized error handling with user notifications
- `useRetry`: Retry logic for failed operations

#### `/app/contexts`
React Context providers for global state management:
- `AuthContext`: Manages wallet connection and authentication state

### `/contracts` - Smart Contracts
Solidity smart contracts for the protocol:
- `HodlVault.sol`: Core vault contract with lock/claim functionality
- `TestERC20.sol`: Mock ERC-20 token for testing

### `/scripts` - Automation Scripts
Node.js scripts for development and deployment:
- **Deployment**: `deploy.js`, `deploy-local.js`, `verify.js`
- **Testing**: `test-lock.js`, `test-share-urls.js`, `check-wallet.js`
- **Validation**: `validate-embeds.js`, `validate-manifest.js`, `check-env.js`
- **Utilities**: `generate-icons.js`

### `/test` - Test Suite
Comprehensive test coverage:
- `HodlVault.test.js`: Smart contract unit tests using Hardhat/Chai

### `/public` - Static Assets
Public files served by Next.js:
- App icons for various platforms (iOS, Android, PWA)
- Social media preview images (Open Graph)
- PWA manifest configuration

### `/artifacts` - Build Outputs
Generated by Hardhat compilation:
- Contract ABIs and bytecode
- OpenZeppelin dependency artifacts
- Build metadata and cache

## Key Files

### Configuration Files
- `hardhat.config.js`: Smart contract development environment
- `next.config.mjs`: Next.js framework configuration
- `tailwind.config.ts`: Tailwind CSS design system
- `tsconfig.json`: TypeScript compiler options
- `vercel.json`: Deployment configuration

### Documentation
- `README.md`: User-facing project documentation
- `CONTRIBUTING.md`: Developer contribution guide
- `LICENSE`: MIT license terms

## Development Best Practices

### Component Organization
- One component per file with clear, descriptive names
- Props interfaces defined with TypeScript
- Hooks and utilities extracted to separate files
- Consistent file naming (PascalCase for components)

### State Management
- Local state for component-specific data
- Context for cross-component state
- Wagmi hooks for blockchain state
- No external state management libraries

### Code Style
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- ESLint for code quality

### Testing Strategy
- Smart contract tests cover all functions
- Manual testing scripts for integration
- Environment validation before deployment
- Social sharing verification tools