#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up separate staging project on Vercel...\n');

const STAGING_PROJECT_NAME = 'base-hodl-staging';

function runCommand(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', ...options });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return error.stdout || error.stderr || '';
  }
}

async function setupStagingProject() {
  const token = process.env.VERCEL_TOKEN;
  
  if (!token) {
    console.error('❌ VERCEL_TOKEN environment variable is required');
    console.log('   Please run: export VERCEL_TOKEN=your-token');
    process.exit(1);
  }

  // Check if .env.staging exists
  const envStagingPath = path.join(__dirname, '..', '.env.staging');
  if (!fs.existsSync(envStagingPath)) {
    console.error('❌ .env.staging file not found!');
    process.exit(1);
  }

  console.log('📦 Creating separate staging project on Vercel...');
  
  // First, we need to unlink the current project to create a new one
  const vercelPath = path.join(__dirname, '..', '.vercel');
  const vercelBackupPath = path.join(__dirname, '..', '.vercel.production.backup');
  
  // Backup current .vercel directory
  if (fs.existsSync(vercelPath)) {
    console.log('📁 Backing up production .vercel configuration...');
    if (fs.existsSync(vercelBackupPath)) {
      fs.rmSync(vercelBackupPath, { recursive: true, force: true });
    }
    fs.renameSync(vercelPath, vercelBackupPath);
  }

  try {
    // Create new project for staging
    console.log(`\n🆕 Creating new Vercel project: ${STAGING_PROJECT_NAME}`);
    console.log('   This will be your dedicated staging environment\n');
    
    // Link to a new project with staging name
    const linkOutput = runCommand(
      `vercel link --yes --project ${STAGING_PROJECT_NAME} --token ${token}`,
      { stdio: 'pipe' }
    );
    
    console.log('✅ Staging project created/linked\n');

    // Now set up environment variables for staging
    console.log('⚙️  Setting up staging environment variables...\n');
    
    // Read .env.staging
    require('dotenv').config({ path: envStagingPath });
    
    const stagingVars = [
      { key: 'NEXT_PUBLIC_VAULT_ADDRESS', value: '0x71Da6632aD3De77677E82202853889bFC5028989' },
      { key: 'NEXT_PUBLIC_IS_STAGING', value: 'true' },
      { key: 'NEXT_PUBLIC_CHAIN_ID', value: '84532' },
      { key: 'NEXT_PUBLIC_CHAIN_NAME', value: 'Base Sepolia' },
      { key: 'NEXT_PUBLIC_URL', value: `https://${STAGING_PROJECT_NAME}.vercel.app` },
      { key: 'NEXT_PUBLIC_ONCHAINKIT_API_KEY', value: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || 'your_api_key' },
      { key: 'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID', value: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your_project_id' },
    ];

    for (const { key, value } of stagingVars) {
      if (value && value !== 'your_api_key' && value !== 'your_project_id') {
        console.log(`   Setting ${key}...`);
        runCommand(
          `echo "${value}" | vercel env add ${key} production --token ${token}`,
          { stdio: 'pipe', ignoreError: true }
        );
      }
    }

    console.log('\n✅ Environment variables configured for staging\n');

    // Deploy to staging
    console.log('🚢 Deploying to staging environment...\n');
    const deployOutput = runCommand(
      `vercel --prod --yes --token ${token}`,
      { stdio: 'inherit' }
    );

    // Restore production .vercel directory
    if (fs.existsSync(vercelBackupPath)) {
      console.log('\n📁 Restoring production .vercel configuration...');
      if (fs.existsSync(vercelPath)) {
        // Save staging config
        const stagingVercelPath = path.join(__dirname, '..', '.vercel.staging');
        if (fs.existsSync(stagingVercelPath)) {
          fs.rmSync(stagingVercelPath, { recursive: true, force: true });
        }
        fs.renameSync(vercelPath, stagingVercelPath);
      }
      fs.renameSync(vercelBackupPath, vercelPath);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ STAGING ENVIRONMENT SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📌 Important URLs:');
    console.log(`   Staging: https://${STAGING_PROJECT_NAME}.vercel.app`);
    console.log(`   Production: https://base-hodl.xyz (unchanged)`);
    console.log('\n📝 Next Steps:');
    console.log('   1. Visit your staging site to test');
    console.log('   2. Configure custom domain if needed');
    console.log('   3. Set up branch deployments in Vercel dashboard');
    console.log('\n💡 To deploy to staging in the future:');
    console.log('   npm run deploy:staging');
    console.log('\n⚠️  Note: Your production environment remains unchanged');
    console.log('   Production is still at https://base-hodl.xyz\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    // Restore production .vercel if something went wrong
    if (fs.existsSync(vercelBackupPath)) {
      console.log('🔄 Restoring production configuration...');
      if (fs.existsSync(vercelPath)) {
        fs.rmSync(vercelPath, { recursive: true, force: true });
      }
      fs.renameSync(vercelBackupPath, vercelPath);
    }
    
    process.exit(1);
  }
}

// Run setup
setupStagingProject().catch(console.error);