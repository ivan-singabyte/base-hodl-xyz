# Deploy Hook Setup for Staging

Since Vercel's Git integration doesn't allow selecting specific branches for different projects, we'll use Deploy Hooks + GitHub Actions for automatic staging deployments.

## Step 1: Create Deploy Hook in Vercel

1. Go to your staging project: https://vercel.com/ivan-singabytes-projects/base-hodl-staging/settings

2. Navigate to **"Git" → "Deploy Hooks"** section
   - Or direct link: https://vercel.com/ivan-singabytes-projects/base-hodl-staging/settings/git#deploy-hooks

3. Click **"Create Hook"**

4. Set:
   - **Hook Name**: `staging-branch` (or any name you prefer)
   - **Git Branch**: `staging`

5. Click **"Create Hook"**

6. You'll get a URL like:
   ```
   https://api.vercel.com/v1/integrations/deploy/prj_xxxxx/hook_xxxxx
   ```

7. **COPY THIS URL** - you'll need it for the next step

## Step 2: Add Deploy Hook to GitHub Secrets

1. Go to your GitHub repository: https://github.com/ivan-singabyte/base-hodl-xyz

2. Navigate to **Settings → Secrets and variables → Actions**
   - Direct link: https://github.com/ivan-singabyte/base-hodl-xyz/settings/secrets/actions

3. Click **"New repository secret"**

4. Add:
   - **Name**: `VERCEL_STAGING_DEPLOY_HOOK`
   - **Secret**: Paste the deploy hook URL from Step 1

5. Click **"Add secret"**

## Step 3: Test the Setup

The GitHub Action is already configured in `.github/workflows/deploy-staging.yml`.

Test it by pushing to staging:

```bash
git checkout staging
git pull origin staging
echo "# Deploy test $(date)" >> README.md
git commit -am "test: deploy hook"
git push origin staging
```

## Step 4: Verify

1. Go to GitHub Actions: https://github.com/ivan-singabyte/base-hodl-xyz/actions
   - You should see "Deploy Staging" workflow running

2. Go to Vercel: https://vercel.com/ivan-singabytes-projects/base-hodl-staging
   - You should see a new deployment triggered

## How It Works

```mermaid
graph LR
    A[Push to staging branch] --> B[GitHub Action triggers]
    B --> C[Calls Deploy Hook]
    C --> D[Vercel builds staging project]
    D --> E[Deploys to base-hodl-staging.vercel.app]
```

## Alternative: Manual Deploy Hook Trigger

If you need to manually trigger a deployment:

```bash
# Replace with your actual deploy hook URL
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_xxxxx/hook_xxxxx"
```

## Benefits of This Approach

✅ **Clear separation**: Each project has its own deploy trigger
✅ **No conflicts**: Production and staging are completely independent
✅ **Flexible**: Can add more conditions in GitHub Actions
✅ **Secure**: Deploy hook is stored as GitHub secret
✅ **Automatic**: Every push to staging triggers deployment

## Troubleshooting

### If deployment doesn't trigger:

1. Check GitHub Actions ran successfully
2. Verify deploy hook URL is correct in GitHub secrets
3. Check Vercel project for deployment logs

### If wrong project deploys:

1. Make sure deploy hook was created in `base-hodl-staging` project
2. Verify the hook is configured for `staging` branch

## Summary

After setup, your workflow will be:

1. **Contributors push to `staging` branch**
2. **GitHub Action automatically triggers**
3. **Deploy hook calls Vercel**
4. **Staging deploys to https://base-hodl-staging.vercel.app**

No manual intervention needed! 🚀