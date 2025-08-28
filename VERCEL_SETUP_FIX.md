# Fix Vercel Staging Setup

## Current Problem
- Pushing to `staging` branch deploys to production project as "Preview"
- We need it to deploy to the staging project instead

## Solution Steps

### Step 1: Disconnect Git from Staging Project (if connected incorrectly)

1. Go to: https://vercel.com/ivan-singabytes-projects/base-hodl-staging/settings/git
2. If it's connected to a different repo or branch, disconnect it

### Step 2: Connect Staging Project to GitHub

1. Go to: https://vercel.com/ivan-singabytes-projects/base-hodl-staging

2. Click **"Settings"** → **"Git"**

3. Click **"Connect Git Repository"** (or "GitHub Integration")

4. Select:
   - Repository: `ivan-singabyte/base-hodl-xyz`
   - Branch to deploy: `staging`

5. **IMPORTANT**: When it asks for "Production Branch", set it to: `staging`
   - This tells Vercel that for THIS project, `staging` branch is the "production" deployment

### Step 3: Configure Production Project

1. Go to: https://vercel.com/ivan-singabytes-projects/base-hodl-xyz/settings/git

2. Under **"Ignored Build Step"** or **"Git Configuration"**:
   - Make sure it's set to only deploy from `main` branch
   - OR add `staging` to ignored branches

3. This prevents the production project from creating preview deployments for staging

## Alternative: Using Vercel CLI

If the UI is confusing, we can set it up via CLI:

```bash
# Remove current .vercel
rm -rf .vercel

# Link to staging project and set it up
VERCEL_TOKEN=your-token vercel link \
  --project base-hodl-staging \
  --yes \
  --token your-token

# Then configure git
VERCEL_TOKEN=your-token vercel git connect \
  --yes \
  --token your-token
```

## What Should Happen After Setup

When you push to:
- **`main` branch** → Deploys to `base-hodl-xyz` project → https://base-hodl.xyz
- **`staging` branch** → Deploys to `base-hodl-staging` project → https://base-hodl-staging.vercel.app

## Quick Test

After setting up, test with:

```bash
git checkout staging
echo "# Test staging deploy" >> README.md
git commit -am "test: staging deployment"
git push origin staging
```

Then check:
- https://vercel.com/ivan-singabytes-projects/base-hodl-staging
- You should see a new "Production" deployment (not Preview)

## Important Notes

In Vercel terminology:
- Each PROJECT has its own "Production Branch"
- For `base-hodl-xyz` project: Production Branch = `main`
- For `base-hodl-staging` project: Production Branch = `staging`

This way:
- `staging` branch deploys as "Production" to staging project
- `main` branch deploys as "Production" to production project