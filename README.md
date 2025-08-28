# 🔒 HODL Vault - Time-Locked Token Vault dApp

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](CONTRIBUTOR_GUIDE.md)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fivan-singabyte%2Fbase-hodl-xyz&env=NEXT_PUBLIC_ONCHAINKIT_API_KEY,NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,NEXT_PUBLIC_VAULT_ADDRESS&envDescription=API%20Keys%20needed%20for%20HODL%20Vault&envLink=https%3A%2F%2Fgithub.com%2Fivan-singabyte%2Fbase-hodl-xyz%2Fblob%2Fmain%2F.env.example)

A decentralized application for locking tokens with time-based restrictions on the Base network. Built with Next.js, OnchainKit, and smart contracts.

## 🚀 Features

- **Time-Locked Vaults**: Lock tokens for a specified duration (1-365 days)
- **Multiple Token Support**: Lock any ERC20 token on Base network
- **Early Withdrawal**: Emergency withdrawal with 50% penalty
- **Social Sharing**: Share your HODL commitment on Farcaster
- **Real-time Updates**: Live countdown and balance updates
- **Gasless Transactions**: Optional paymaster support for sponsored transactions

## 📋 Prerequisites

- Node.js 18+ and npm
- Wallet with Base Sepolia ETH for gas fees
- OnchainKit API key
- WalletConnect Project ID

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/ivan-singabyte/base-hodl-xyz
cd base-hodl-xyz
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure `.env.local` with your values:
```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_VAULT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_URL=https://base-hodl.xyz
```

## 🏃‍♂️ Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 Production Build

Build for production:
```bash
npm run build
npm run start
```

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Manual Deployment

See [Deployment Guide](docs/TECHNICAL_ARCHITECTURE.md) for detailed instructions.

## 📂 Project Structure

```
base-hodl-xyz/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utility libraries
│   └── utils/             # Helper functions
├── contracts/             # Smart contracts
├── scripts/               # Deployment & utility scripts
├── test/                  # Contract tests
└── docs/                  # Documentation
    ├── CONTRACT_SECURITY.md
    ├── TECHNICAL_ARCHITECTURE.md
    ├── USER_RECOVERY_GUIDE.md
    └── PHASE_5_TESTING_REPORT.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run contract tests

## 📖 Documentation

- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) - System design and architecture
- [Contract Security](docs/CONTRACT_SECURITY.md) - Security analysis and best practices
- [User Recovery Guide](docs/USER_RECOVERY_GUIDE.md) - Recovery procedures
- [Testing Report](docs/PHASE_5_TESTING_REPORT.md) - Comprehensive testing documentation

## 🔐 Security

- All smart contracts have been audited for security vulnerabilities
- See [CONTRACT_SECURITY.md](docs/CONTRACT_SECURITY.md) for security details
- Report security issues to [security contact]

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! We love our contributors and appreciate your help making HODL Vault better.

### For Approved Contributors
- **Direct push access** to `staging` branch - no PR approvals needed!
- Automatic deployments to https://base-hodl-staging.vercel.app
- Test with Base Sepolia testnet tokens

See our [Contributor Guide](CONTRIBUTOR_GUIDE.md) for:
- Quick start instructions
- Staging environment setup  
- Direct push workflow
- Testing on Base Sepolia

For general contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

## 🌟 Contributors

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## 🆘 Support

- 📖 Documentation: [docs/](docs/)
- 💬 Discussions: [GitHub Discussions](https://github.com/ivan-singabyte/base-hodl-xyz/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/ivan-singabyte/base-hodl-xyz/issues)
- 🔒 Security: Report security vulnerabilities privately via [Security Tab](https://github.com/ivan-singabyte/base-hodl-xyz/security)

## 🚀 Quick Deploy

Deploy your own instance with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fivan-singabyte%2Fbase-hodl-xyz&env=NEXT_PUBLIC_ONCHAINKIT_API_KEY,NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,NEXT_PUBLIC_VAULT_ADDRESS&envDescription=API%20Keys%20needed%20for%20HODL%20Vault&envLink=https%3A%2F%2Fgithub.com%2Fivan-singabyte%2Fbase-hodl-xyz%2Fblob%2Fmain%2F.env.example)

---

Built with ❤️ using [OnchainKit](https://onchainkit.xyz) and [Next.js](https://nextjs.org)
<!-- Staging deployment test Thu Aug 28 16:05:42 +08 2025 -->
