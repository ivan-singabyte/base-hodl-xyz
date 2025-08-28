# HODL Vault Deployment Status

## 🚀 Dual Environment Setup Complete!

### Production Deployment (RESTORED)
- **URL**: https://base-hodl.xyz
- **Status**: ✅ Live and Running on Base Mainnet
- **Contract**: `0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1`
- **Network**: Base Mainnet (Chain ID: 8453)
- **Vercel Project**: base-hodl-xyz

### Staging Deployment (NEW)
- **URL**: https://base-hodl-staging.vercel.app
- **Status**: ✅ Live and Running on Base Sepolia
- **Contract**: `0x71Da6632aD3De77677E82202853889bFC5028989`
- **Network**: Base Sepolia Testnet (Chain ID: 84532)
- **Vercel Project**: base-hodl-staging (separate project)

### Key Differences

| Feature | Production | Staging |
|---------|------------|---------|
| **Network** | Base Mainnet | Base Sepolia |
| **Contract** | 0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1 | 0x71Da6632aD3De77677E82202853889bFC5028989 |
| **URL** | base-hodl.xyz | base-hodl-staging.vercel.app |
| **Environment** | Production | Staging (shows badge) |
| **Tokens** | Real tokens | Test tokens |
| **Chain ID** | 8453 | 84532 |

## Next Steps for Contributors

### 1. Create Staging Branch
```bash
git checkout -b staging
git add .
git commit -m "feat: staging environment setup"
git push origin staging
```

### 2. Configure Vercel for Branch Deployments
1. Go to [Vercel Dashboard](https://vercel.com/ivan-singabytes-projects/base-hodl-xyz)
2. Settings → Git → Configure branch deployments
3. Add `staging` branch for preview deployments
4. Set environment variables for staging branch

### 3. Test the Staging Environment
Visit https://base-hodl.xyz and:
- Connect your wallet
- Switch to Base Sepolia network
- Test lock creation with testnet tokens
- Verify the staging badge appears (if on staging branch)

### 4. Get Test Tokens
- **Base Sepolia ETH**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Contract on Basescan**: https://sepolia.basescan.org/address/0x71Da6632aD3De77677E82202853889bFC5028989

## Workflow for Contributors

1. **Feature Development**:
   ```bash
   git checkout staging
   git checkout -b feature/your-feature
   # Make changes
   git push origin feature/your-feature
   ```

2. **Create PR to Staging**:
   - Target: `staging` branch
   - Vercel will create preview deployment
   - Test thoroughly on Sepolia

3. **Merge to Production**:
   - After testing on staging (24-48 hours)
   - Create PR from `staging` to `main`
   - Deploy to Base mainnet

## Important Notes

⚠️ **Security**: Never commit your `VERCEL_TOKEN` or private keys to the repository
📝 **Documentation**: Update STAGING.md when making infrastructure changes
🧪 **Testing**: Always run `npm run test:staging` before deploying
🔒 **Contract**: The staging contract at `0x71Da6632aD3De77677E82202853889bFC5028989` is immutable

## Support

For issues or questions:
- Check [GitHub Issues](https://github.com/ivan-singabytes-projects/base-hodl-xyz/issues)
- Review [STAGING.md](./STAGING.md) for detailed setup
- Contact the maintainers

---

*Last Updated: August 28, 2025*