#!/bin/bash

echo "🚀 Configuring Vercel for automatic staging deployments..."
echo ""
echo "This script will help you set up automatic deployments from the staging branch."
echo ""

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN not set. Please run:"
    echo "   export VERCEL_TOKEN=your-token"
    exit 1
fi

echo "📝 Manual steps required in Vercel Dashboard:"
echo "================================================"
echo ""
echo "1. Go to: https://vercel.com/ivan-singabytes-projects/base-hodl-staging/settings/git"
echo ""
echo "2. Under 'Production Branch':"
echo "   - Set to: staging"
echo ""
echo "3. Under 'Branch Deployments':"
echo "   - Enable automatic deployments for 'staging' branch"
echo ""
echo "4. Environment Variables (should already be set):"
echo "   - NEXT_PUBLIC_VAULT_ADDRESS=0x71Da6632aD3De77677E82202853889bFC5028989"
echo "   - NEXT_PUBLIC_IS_STAGING=true"
echo "   - NEXT_PUBLIC_ONCHAINKIT_API_KEY=[your-key]"
echo "   - NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=[your-id]"
echo ""
echo "================================================"
echo ""

# Link staging project for CLI operations
echo "🔗 Linking staging project..."
rm -rf .vercel
vercel link --yes --project base-hodl-staging --token $VERCEL_TOKEN

# Save configuration
cp -r .vercel .vercel.staging

echo "✅ Staging project linked and configuration saved to .vercel.staging"
echo ""
echo "📌 For Production project (base-hodl-xyz):"
echo "   - Go to: https://vercel.com/ivan-singabytes-projects/base-hodl-xyz/settings/git"
echo "   - Ensure 'Production Branch' is set to: main"
echo "   - DO NOT enable staging branch there!"
echo ""
echo "✅ Configuration complete!"
echo ""
echo "To test automatic deployment:"
echo "1. Make a change in the staging branch"
echo "2. Push to GitHub"
echo "3. Vercel will automatically deploy to https://base-hodl-staging.vercel.app"