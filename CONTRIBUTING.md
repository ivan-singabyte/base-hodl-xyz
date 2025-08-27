# Contributing to HODL Vault

First off, thank you for considering contributing to HODL Vault! It's people like you that make HODL Vault such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fork the repo and create your branch from `main`
* If you've added code that should be tested, add tests
* Ensure the test suite passes
* Make sure your code lints
* Issue that pull request!

## Development Process

1. **Fork and Clone**
   ```bash
   git clone https://github.com/ivan-singabyte/mini-app-hodl.git
   cd mini-app-hodl
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   # Add your development keys
   ```

4. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make Changes**
   * Write your code
   * Follow the existing code style
   * Add tests if applicable
   * Update documentation if needed

6. **Test Your Changes**
   ```bash
   npm run lint        # Check code style
   npm run build       # Ensure it builds
   npm test           # Run tests
   ```

7. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   * `feat:` New feature
   * `fix:` Bug fix
   * `docs:` Documentation changes
   * `style:` Code style changes (formatting, etc)
   * `refactor:` Code refactoring
   * `test:` Adding or updating tests
   * `chore:` Maintenance tasks

8. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub

## Development Setup

### Prerequisites
* Node.js 18+
* npm or yarn
* Git

### Environment Variables
See `.env.example` for required environment variables. For development, you'll need:
* OnchainKit API key
* WalletConnect Project ID
* Base Sepolia testnet ETH

### Running Locally
```bash
npm run dev
```
Visit http://localhost:3000

### Testing Smart Contracts
```bash
npx hardhat test
```

### Building for Production
```bash
npm run build
npm run start
```

## Project Structure

```
mini-app-hodl/
├── app/                # Next.js app directory
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   └── lib/            # Utilities
├── contracts/          # Smart contracts
├── scripts/            # Deployment scripts
├── test/               # Contract tests
└── docs/               # Documentation
```

## Style Guidelines

### JavaScript/TypeScript
* Use TypeScript for new code
* Follow existing code style
* Use meaningful variable names
* Add comments for complex logic

### React Components
* Use functional components with hooks
* Keep components small and focused
* Use proper prop types/interfaces
* Follow the existing component structure

### Smart Contracts
* Follow Solidity best practices
* Include comprehensive tests
* Document all functions
* Use OpenZeppelin contracts where possible

## Getting Help

* Check the [documentation](docs/)
* Look for existing issues
* Ask in discussions
* Contact maintainers

## Recognition

Contributors will be recognized in:
* README.md contributors section
* Release notes
* Project documentation

Thank you for contributing! 🚀