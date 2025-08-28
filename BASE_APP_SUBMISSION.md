# Base App Discovery - Submission Guide

## ✅ Pre-Submission Checklist

### 1. Technical Requirements (Completed ✅)
- [x] App deployed on Base mainnet or testnet
- [x] Proper wallet connection (Coinbase Wallet, MetaMask, etc.)
- [x] OnchainKit integration
- [x] Responsive design
- [x] HTTPS enabled

### 2. Metadata Configuration (Completed ✅)
- [x] Open Graph tags configured
- [x] Twitter Card metadata
- [x] Farcaster frame support
- [x] PWA manifest
- [x] App icon in multiple sizes
- [x] `.well-known/app-metadata.json` endpoint
- [x] `.well-known/farcaster.json` endpoint
- [x] `.well-known/base-app.json` endpoint

### 3. Required Assets
Before submitting, ensure you have:
- [ ] High-quality app logo (512x512px minimum)
- [ ] At least 2 screenshots (1920x1080px recommended)
- [ ] App banner image (1200x630px for social sharing)
- [ ] Short promotional video (optional but recommended)

## 📝 Submission Process

### Step 1: Base Ecosystem Application
1. Go to **[Base Ecosystem Submission Form](https://base.org/ecosystem/apps/submit)**
2. Fill out the form with:
   - **App Name**: HODL Vault
   - **Category**: DeFi / Vaults
   - **Website**: https://base-hodl.xyz
   - **Description**: Time-lock any ERC-20 token on Base. Prove your diamond hands with secure vaults. No early withdrawals, 100% free.
   - **Chain**: Base Mainnet
   - **Contract Address**: [Your deployed contract address]
   - **Social Links**: Twitter, GitHub, Discord (if applicable)

### Step 2: OnchainKit App Store
1. Visit **[OnchainKit App Store](https://onchainkit.xyz/app-store)**
2. Click "Submit Your App"
3. Provide:
   - App URL: `https://base-hodl.xyz`
   - GitHub repo: `https://github.com/ivan-singabyte/base-hodl-xyz`
   - Integration details

### Step 3: Farcaster Discovery
1. **Create a Warpcast account** if you don't have one
2. **Join the /base channel** on Warpcast
3. **Share your frame** with this format:
```
🚀 Introducing HODL Vault - Lock your tokens with diamond hands on @base!

🔒 Time-lock any ERC-20 token
⏰ Fixed durations (1 day to 10 years)  
💎 No early withdrawals
✨ 100% free, no fees

Try it now: https://base-hodl.xyz/frame

Built with @onchainkit on @base
#Base #DeFi #HODL
```

### Step 4: Base Guild Application (Optional)
For additional exposure:
1. Apply at **[Base Guild](https://guild.xyz/base)**
2. Complete onboarding quests
3. Earn Base builder credentials

## 🔍 Verification URLs

Test your app's discoverability:

### Frame Validators
- **Warpcast Validator**: 
  ```
  https://warpcast.com/~/developers/frames?url=https://base-hodl.xyz
  ```

- **Frame.js Debugger**: 
  ```
  https://debugger.framesjs.org/?url=https://base-hodl.xyz/frame
  ```

### Metadata Endpoints (Should return JSON)
- App Metadata: `https://base-hodl.xyz/.well-known/app-metadata.json`
- Farcaster Config: `https://base-hodl.xyz/.well-known/farcaster.json`
- Base App Config: `https://base-hodl.xyz/.well-known/base-app.json`

## 📊 Post-Submission

### Monitor Your Application
1. **Check submission status** (usually 3-5 business days)
2. **Respond to feedback** from Base team promptly
3. **Join Base Discord** for updates

### Promotion Strategy
1. **Tweet your launch** and tag:
   - @base
   - @OnchainKit
   - @coinbase
   
2. **Post in relevant channels**:
   - /base on Farcaster
   - /defi on Farcaster
   - Base Discord #showcase channel

3. **Create content**:
   - Tutorial video
   - Blog post about your app
   - Twitter thread explaining features

## 🚀 Quick Submission Links

- **Base Ecosystem**: https://base.org/ecosystem/apps/submit
- **OnchainKit Directory**: https://onchainkit.xyz/app-store/submit
- **Base Guild**: https://guild.xyz/base
- **Base Discord**: https://discord.gg/base
- **Warpcast**: https://warpcast.com

## 📧 Support Contacts

- **Base Support**: ecosystem@base.org
- **OnchainKit**: Via GitHub issues
- **Technical Help**: Base Discord #dev-support

## ⚡ Action Items for You

1. **Update contract address** in `/public/.well-known/app-metadata.json`
2. **Create screenshots** of your app in action
3. **Set up social accounts** (Twitter, Farcaster)
4. **Submit to Base Ecosystem** form
5. **Share on Farcaster** with the /base community

## 🎯 Success Metrics

Track your app's performance:
- Base Ecosystem listing views
- Farcaster frame interactions
- Wallet connections
- Total Value Locked (TVL)
- User retention

---

**Note**: Keep this document updated as you progress through the submission process. Mark items as complete and add any feedback or learnings.