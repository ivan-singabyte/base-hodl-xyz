# Environment Configuration Summary

## ✅ Complete Dual Environment Setup

### Production Environment (RESTORED)
- **Status**: ✅ Fully operational
- **URL**: https://base-hodl.xyz
- **Network**: Base Mainnet (Chain ID: 8453)
- **Contract**: `0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1`
- **Vercel Project**: `base-hodl-xyz`
- **Branch**: `main`

### Staging Environment (NEW)
- **Status**: ✅ Fully operational
- **URL**: https://base-hodl-staging.vercel.app
- **Network**: Base Sepolia (Chain ID: 84532)
- **Contract**: `0x71Da6632aD3De77677E82202853889bFC5028989`
- **Vercel Project**: `base-hodl-staging`
- **Branch**: `staging`

## Quick Commands

### Deploy to Production
```bash
git checkout main
git push origin main
# Vercel auto-deploys to base-hodl.xyz
```

### Deploy to Staging
```bash
git checkout staging
npm run deploy:staging
# Or push to staging branch for auto-deploy
```

### Test Staging
```bash
npm run test:staging
```

### Switch Between Projects Locally
```bash
# For production development
cp .vercel.production .vercel

# For staging development  
cp .vercel.staging .vercel
```

## Environment Files

- `.env.production.example` - Production environment template
- `.env.staging` - Staging environment configuration
- `.vercel.production` - Production project link (saved)
- `.vercel.staging` - Staging project link (saved)

## Contract Addresses

| Network | Contract Address | Explorer |
|---------|-----------------|----------|
| **Base Mainnet** | 0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1 | [View](https://basescan.org/address/0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1) |
| **Base Sepolia** | 0x71Da6632aD3De77677E82202853889bFC5028989 | [View](https://sepolia.basescan.org/address/0x71Da6632aD3De77677E82202853889bFC5028989) |

## Important Notes

✅ **Production is completely isolated** - Changes to staging don't affect production
✅ **Separate Vercel projects** - No risk of accidental production deployments
✅ **Environment badge** - Staging shows a yellow "STAGING" badge
✅ **Network detection** - App automatically uses correct network based on environment

## Workflow

1. **Development** → Work on feature branches
2. **Staging** → Test on Base Sepolia with staging contract
3. **Production** → Deploy to Base mainnet with production contract

---

*Setup completed successfully. Both environments are fully operational.*