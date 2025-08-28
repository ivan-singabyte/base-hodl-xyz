# Environment Setup Explained

## How It Works

This is **ONE CODEBASE** with **TWO SEPARATE VERCEL PROJECTS**:

### 1. Production Project (`base-hodl-xyz`)
- **URL**: https://base-hodl.xyz
- **Branch**: `main`
- **Environment Variables**:
  ```
  NEXT_PUBLIC_VAULT_ADDRESS=0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1
  NEXT_PUBLIC_ONCHAINKIT_API_KEY=[your-api-key]
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=[your-project-id]
  ```
- **Network**: Automatically uses Base Mainnet (no IS_STAGING flag)

### 2. Staging Project (`base-hodl-staging`)
- **URL**: https://base-hodl-staging.vercel.app
- **Branch**: `staging` (or manual deploy)
- **Environment Variables**:
  ```
  NEXT_PUBLIC_VAULT_ADDRESS=0x71Da6632aD3De77677E82202853889bFC5028989
  NEXT_PUBLIC_IS_STAGING=true
  NEXT_PUBLIC_ONCHAINKIT_API_KEY=[your-api-key]
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=[your-project-id]
  ```
- **Network**: Automatically uses Base Sepolia (because IS_STAGING=true)

## The Magic: Environment Detection

The code in `app/lib/config.ts` detects which environment it's in:

```typescript
// If NEXT_PUBLIC_IS_STAGING is "true" → Staging mode
export const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

// If production AND not staging → Production mode  
export const isProduction = process.env.NODE_ENV === 'production' && !isStaging;
```

This determines:
- Which network to use (Mainnet vs Sepolia)
- Whether to show the staging badge
- Which features to enable

## Contract Address Configuration

Both environments use the same environment variable name (`NEXT_PUBLIC_VAULT_ADDRESS`), but with different values:

| Environment | Variable | Value |
|------------|----------|-------|
| **Production** | NEXT_PUBLIC_VAULT_ADDRESS | 0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1 |
| **Staging** | NEXT_PUBLIC_VAULT_ADDRESS | 0x71Da6632aD3De77677E82202853889bFC5028989 |

## How to Deploy

### Deploy to Production
```bash
# Make sure you're on production project
cp .vercel.production .vercel

# Push to main branch (auto-deploys)
git checkout main
git push origin main

# Or manual deploy
vercel --prod
```

### Deploy to Staging
```bash
# Switch to staging project
cp .vercel.staging .vercel

# Deploy
vercel --prod

# Or use the helper script
npm run deploy:staging
```

## Vercel Dashboard Configuration

Each project has its own environment variables set in Vercel:

1. **Go to**: https://vercel.com/[your-team]/base-hodl-xyz/settings/environment-variables
   - Set production mainnet contract address
   - Don't set IS_STAGING flag

2. **Go to**: https://vercel.com/[your-team]/base-hodl-staging/settings/environment-variables
   - Set staging Sepolia contract address
   - Set NEXT_PUBLIC_IS_STAGING=true

## Quick Checks

### Verify Production
```bash
curl -s https://base-hodl.xyz | grep -o "chainId" 
# Should connect to Base Mainnet (8453)
```

### Verify Staging
```bash
curl -s https://base-hodl-staging.vercel.app | grep -o "STAGING"
# Should show staging badge
```

## Important Files

- `.vercel.production` - Links to production project
- `.vercel.staging` - Links to staging project
- `.env.staging` - Local staging environment variables
- `app/lib/config.ts` - Environment detection logic

## Summary

✅ **Same code, different deployments**
✅ **Environment variables control behavior**
✅ **Staging uses Sepolia contract: 0x71Da6632aD3De77677E82202853889bFC5028989**
✅ **Production uses Mainnet contract: 0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1**
✅ **IS_STAGING flag switches networks automatically**