# Configure staging.base-hodl.xyz Subdomain

## Steps to Set Up staging.base-hodl.xyz

### Step 1: Add Domain in Vercel

1. Go to your staging project: https://vercel.com/ivan-singabytes-projects/base-hodl-staging/settings/domains

2. Click **"Add"** button

3. Enter: `staging.base-hodl.xyz`

4. Click **"Add"**

5. Vercel will show you DNS records that need to be configured

### Step 2: Configure DNS Records

You'll need to add a CNAME record to your domain's DNS settings. The exact steps depend on where your domain is registered.

#### If base-hodl.xyz is on Vercel:

1. Go to: https://vercel.com/ivan-singabytes-projects/base-hodl-xyz/settings/domains

2. Find `base-hodl.xyz` and click on it

3. Add a CNAME record:
   - **Name/Host**: `staging`
   - **Type**: `CNAME`
   - **Value/Points to**: `cname.vercel-dns.com.`
   - **TTL**: Automatic or 3600

#### If base-hodl.xyz is on Namecheap:

1. Log in to Namecheap
2. Go to Domain List → Manage → Advanced DNS
3. Add new record:
   - **Type**: `CNAME Record`
   - **Host**: `staging`
   - **Value**: `cname.vercel-dns.com.`
   - **TTL**: Automatic

#### If base-hodl.xyz is on Cloudflare:

1. Log in to Cloudflare
2. Select your domain `base-hodl.xyz`
3. Go to DNS → Records
4. Click "Add record":
   - **Type**: `CNAME`
   - **Name**: `staging` (will become staging.base-hodl.xyz)
   - **Target**: `cname.vercel-dns.com.`
   - **Proxy status**: DNS only (gray cloud)
   - **TTL**: Auto

#### If base-hodl.xyz is on GoDaddy:

1. Log in to GoDaddy
2. Go to My Products → Domain → DNS
3. Add record:
   - **Type**: `CNAME`
   - **Name**: `staging`
   - **Value**: `cname.vercel-dns.com.`
   - **TTL**: 1 hour

### Step 3: Verify in Vercel

1. Go back to: https://vercel.com/ivan-singabytes-projects/base-hodl-staging/settings/domains

2. You should see `staging.base-hodl.xyz` with status changing from:
   - "Invalid Configuration" → "Pending" → "Valid Configuration" ✅

3. This can take 5-30 minutes depending on DNS propagation

### Step 4: Update Environment Variables

1. In Vercel staging project settings: https://vercel.com/ivan-singabytes-projects/base-hodl-staging/settings/environment-variables

2. Update or add:
   ```
   NEXT_PUBLIC_URL=https://staging.base-hodl.xyz
   ```

3. Redeploy to apply changes:
   ```bash
   # Switch to staging project
   cp .vercel.staging .vercel
   
   # Deploy
   VERCEL_TOKEN=your-token vercel --prod
   ```

### Step 5: Update Local Configuration

Update `.env.staging`:
```env
# Staging Application URL
NEXT_PUBLIC_URL=https://staging.base-hodl.xyz
```

### Step 6: Test

1. Wait for DNS propagation (5-30 minutes)
2. Visit: https://staging.base-hodl.xyz
3. You should see your staging site with the yellow "STAGING" badge

## Troubleshooting

### If "Invalid Configuration" persists:

1. **Check DNS propagation**:
   ```bash
   dig staging.base-hodl.xyz
   # or
   nslookup staging.base-hodl.xyz
   ```

2. **Expected result**:
   ```
   staging.base-hodl.xyz. IN CNAME cname.vercel-dns.com.
   ```

3. **If using Cloudflare**:
   - Make sure proxy is **disabled** (gray cloud)
   - Vercel needs direct DNS, not proxied

### If SSL certificate error:

- Vercel automatically provisions SSL certificates
- This can take up to 24 hours
- Usually ready within minutes

### Alternative: Using A Record

If CNAME doesn't work, use an A record:
- **Type**: `A`
- **Name**: `staging`
- **Value**: `76.76.21.21` (Vercel's IP)

## Update Your Documentation

After setup, update these files:

1. **STAGING.md**: Change URLs to staging.base-hodl.xyz
2. **CONTRIBUTOR_GUIDE.md**: Update staging URL
3. **README.md**: Mention staging.base-hodl.xyz

## Benefits

✅ **Professional**: staging.base-hodl.xyz looks more professional
✅ **Clear separation**: Easy to distinguish from production
✅ **Consistent branding**: Keeps your domain branding
✅ **Easy to remember**: Contributors can easily remember the URL

## Summary

After setup:
- **Production**: https://base-hodl.xyz (or https://www.base-hodl.xyz)
- **Staging**: https://staging.base-hodl.xyz

Both use the same codebase but deploy to different environments!