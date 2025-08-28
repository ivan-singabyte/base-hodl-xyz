# Vercel Configuration Instructions

## Important: You DON'T need to change Production Branch!

The way Vercel works with our setup:

### For the Staging Project (base-hodl-staging)

You have two options:

### Option 1: Link Git Repository (Recommended)

1. Go to: https://vercel.com/ivan-singabytes-projects/base-hodl-staging/settings/git

2. If not connected, click **"Connect Git Repository"**
   - Select GitHub
   - Choose: `ivan-singabyte/base-hodl-xyz`

3. Under **"Production Branch"**, you can either:
   - Leave it as `main` and configure branch deployments
   - OR set it to `staging` (but this isn't necessary)

4. **Important**: Under **"Git Branch"** settings:
   - Find **"Configure Production Deployments from Branches"**
   - Add: `staging`
   - This will deploy the staging branch to your staging project

### Option 2: Use CLI Deployments (Current Setup)

Since we've been deploying via CLI, you can continue using:

```bash
# Switch to staging project
cp .vercel.staging .vercel

# Deploy manually
VERCEL_TOKEN=your-token vercel --prod

# Or use the script
npm run deploy:staging
```

## Recommended Configuration

### For base-hodl-staging project:

1. **Go to**: https://vercel.com/ivan-singabytes-projects/base-hodl-staging/settings/git

2. **Look for one of these sections**:
   - "Git Integration"
   - "Connected Git Repository"  
   - "Git Configuration"

3. **If you see "Connect a Git Repository"**, click it and:
   - Choose GitHub
   - Select `ivan-singabyte/base-hodl-xyz` repository
   - For "Import Branch", select `staging`

4. **If already connected**, look for:
   - "Branch Deployments"
   - "Deploy Branches"
   - "Deployment Protection"

5. **Configure it to deploy from `staging` branch**:
   - You might see options like:
     - "Only deploy the Production Branch"
     - "Deploy all branches"
     - "Configure branches to deploy"
   - Select the option that lets you specify branches
   - Add `staging` branch

### For base-hodl-xyz project (Production):

1. **Go to**: https://vercel.com/ivan-singabytes-projects/base-hodl-xyz/settings/git

2. **Ensure**:
   - Production Branch = `main`
   - Do NOT add staging branch here

## Alternative: Create Branch Deploy Hook

If you can't find the settings above, you can:

1. Go to project settings
2. Look for **"Deploy Hooks"**
3. Create a hook for staging branch
4. This will give you a URL to trigger deployments

## Testing Automatic Deployment

After configuration, test it:

```bash
git checkout staging
echo "# Test" >> README.md
git add README.md
git commit -m "test: staging auto-deploy"
git push origin staging
```

Then check: https://vercel.com/ivan-singabytes-projects/base-hodl-staging

You should see a new deployment triggered by the push.

## If You Don't See These Options

The Vercel UI might have changed. Look for:
- "Git" or "Git Integration" in settings
- "Deployments" settings
- "Branches" configuration
- "Environment" settings

The key is to tell Vercel to deploy the `staging` branch to the `base-hodl-staging` project.