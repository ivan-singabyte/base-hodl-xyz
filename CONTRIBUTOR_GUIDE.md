# Contributor Guide - HODL Vault

Welcome contributors! This guide explains how to contribute to the HODL Vault project using our staging environment.

## 🚀 Quick Start

### For Approved Contributors

You have **direct push access** to the `staging` branch. No PR approvals needed for staging!

```bash
# 1. Clone the repository
git clone https://github.com/ivan-singabyte/base-hodl-xyz.git
cd base-hodl-xyz

# 2. Checkout staging branch
git checkout staging
git pull origin staging

# 3. Install dependencies
npm install

# 4. Set up local environment
cp .env.staging .env.local

# 5. Run locally
npm run dev:staging

# 6. Make your changes and push directly to staging
git add .
git commit -m "feat: your feature description"
git push origin staging

# 7. Auto-deployed to: https://base-hodl-staging.vercel.app
```

## 🏗️ Environment Structure

### Two Environments, One Codebase

| Environment | Branch | URL | Network | Contract |
|------------|--------|-----|---------|----------|
| **Production** | `main` | https://base-hodl.xyz | Base Mainnet | 0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1 |
| **Staging** | `staging` | https://base-hodl-staging.vercel.app | Base Sepolia | 0x71Da6632aD3De77677E82202853889bFC5028989 |

## 📝 Workflow for Contributors

### 1. Direct Staging Development (Recommended)

For approved contributors with push access:

```bash
# Work directly on staging
git checkout staging
git pull origin staging

# Make changes
# ... edit files ...

# Push directly - NO PR NEEDED!
git add .
git commit -m "feat: adding new feature"
git push origin staging

# Automatically deploys to staging
```

### 2. Feature Branch Workflow (Optional)

For larger features or when you want review:

```bash
# Create feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/my-feature

# Make changes and push
git push origin feature/my-feature

# Create PR to staging branch (not main!)
# After merge, auto-deploys to staging
```

### 3. Production Deployment

**Only maintainers** can merge staging to production:

```bash
# Create PR from staging to main
# Requires approval from maintainers
# After merge, auto-deploys to production
```

## 🧪 Testing on Staging

### Get Test Tokens

1. **Base Sepolia ETH**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. **Network Config**:
   - Network: Base Sepolia
   - Chain ID: 84532
   - RPC: https://sepolia.base.org

### Test Checklist

- [ ] Connect wallet (automatically switches to Sepolia)
- [ ] Create locks with test tokens
- [ ] Test claiming after expiry
- [ ] Verify UI on mobile/desktop
- [ ] Check social sharing
- [ ] Test Farcaster frames

## 💻 Local Development

### Environment Setup

```bash
# For staging development
cp .env.staging .env.local
npm run dev:staging

# The app will:
# - Use Base Sepolia network
# - Show "STAGING" badge
# - Use Sepolia contract
```

### Key Environment Variables

```env
# .env.local (copy from .env.staging)
NEXT_PUBLIC_VAULT_ADDRESS=0x71Da6632aD3De77677E82202853889bFC5028989
NEXT_PUBLIC_IS_STAGING=true
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_id
```

## 🛠️ Common Tasks

### Adding a New Feature

```bash
git checkout staging
git pull origin staging
# Make changes
npm run lint
npm run test:staging
git add .
git commit -m "feat: description"
git push origin staging
```

### Fixing a Bug

```bash
git checkout staging
git pull origin staging
# Fix the bug
git add .
git commit -m "fix: description"
git push origin staging
```

### Testing Smart Contract Changes

1. Deploy new contract to Sepolia
2. Update `NEXT_PUBLIC_VAULT_ADDRESS` in `.env.staging`
3. Test locally with `npm run dev:staging`
4. Push to staging branch

## 📁 Project Structure

```
base-hodl-xyz/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utilities
│   │   └── config.ts     # Environment detection
│   └── providers.tsx     # Chain configuration
├── contracts/            # Smart contracts
├── scripts/             # Deployment & setup scripts
├── .env.staging         # Staging environment vars
├── .vercel.staging/     # Staging project config
└── vercel.staging.json  # Staging deployment config
```

## ⚙️ How Staging Works

### Environment Detection

The app detects staging via `NEXT_PUBLIC_IS_STAGING`:

```typescript
// app/lib/config.ts
export const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === 'true';
```

When `isStaging` is true:
- Forces Base Sepolia network
- Shows "STAGING" badge
- Uses Sepolia contract address
- Enables test features

### Chain Restriction

In staging, the app ONLY allows Base Sepolia:

```typescript
// app/providers.tsx
const chains = isStaging ? [baseSepolia] : [base, baseSepolia];
```

This prevents accidentally using mainnet in staging.

## 🚨 Important Notes

### DO's ✅

- Push directly to `staging` branch
- Test thoroughly on Sepolia before production
- Use test tokens only
- Document significant changes
- Run `npm run lint` before pushing

### DON'Ts ❌

- Never push directly to `main` branch
- Don't commit sensitive keys or secrets
- Don't use real funds on staging
- Don't merge to main without maintainer approval

## 📊 Monitoring

- **Staging Deployments**: https://vercel.com/ivan-singabytes-projects/base-hodl-staging
- **Production Deployments**: https://vercel.com/ivan-singabytes-projects/base-hodl-xyz
- **Contract on Sepolia**: https://sepolia.basescan.org/address/0x71Da6632aD3De77677E82202853889bFC5028989

## 🤝 Getting Help

1. Check [STAGING.md](./STAGING.md) for detailed setup
2. Create an issue with `staging` label
3. Contact maintainers for production deployment

## 🎉 Ready to Contribute!

You're all set! Just:

1. `git checkout staging`
2. Make your changes
3. `git push origin staging`
4. See it live at https://base-hodl-staging.vercel.app

No PR approvals needed for staging - ship fast! 🚀