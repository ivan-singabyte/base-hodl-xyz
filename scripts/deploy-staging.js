#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying to staging environment...\n');

// Check if we're on the staging branch
try {
  const currentBranch = execSync('git branch --show-current').toString().trim();
  
  if (currentBranch !== 'staging') {
    console.warn('⚠️  Warning: You are not on the staging branch.');
    console.log(`   Current branch: ${currentBranch}`);
    console.log('   It is recommended to deploy from the staging branch.\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Do you want to continue? (y/N): ', (answer) => {
      rl.close();
      if (answer.toLowerCase() !== 'y') {
        console.log('Deployment cancelled.');
        process.exit(0);
      }
      deployToStaging();
    });
  } else {
    deployToStaging();
  }
} catch (error) {
  console.error('Error checking git branch:', error.message);
  process.exit(1);
}

function deployToStaging() {
  try {
    // Check if .env.staging exists
    const envStagingPath = path.join(__dirname, '..', '.env.staging');
    if (!fs.existsSync(envStagingPath)) {
      console.error('❌ .env.staging file not found!');
      console.log('   Please create .env.staging with your staging configuration.');
      process.exit(1);
    }
    
    // Load staging environment variables
    require('dotenv').config({ path: envStagingPath });
    
    // Verify required environment variables
    const requiredVars = [
      'NEXT_PUBLIC_VAULT_ADDRESS',
      'NEXT_PUBLIC_ONCHAINKIT_API_KEY',
      'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      console.log('\nPlease update .env.staging with the required values.');
      process.exit(1);
    }
    
    console.log('✅ Environment variables loaded from .env.staging\n');
    
    // Run build with staging configuration
    console.log('📦 Building application for staging...');
    execSync('npm run build:staging', { stdio: 'inherit' });
    
    console.log('\n✅ Build completed successfully!');
    
    // Deploy to Vercel staging
    console.log('\n🚢 Deploying to Vercel staging project...');
    
    // Switch to staging project configuration
    const vercelPath = path.join(__dirname, '..', '.vercel');
    const prodVercelPath = path.join(__dirname, '..', '.vercel.production');
    const stagingVercelPath = path.join(__dirname, '..', '.vercel.staging');
    
    // Backup production config and use staging config
    if (fs.existsSync(stagingVercelPath)) {
      if (fs.existsSync(vercelPath)) {
        if (!fs.existsSync(prodVercelPath)) {
          fs.renameSync(vercelPath, prodVercelPath);
        }
      }
      // Copy staging config
      execSync(`cp -r ${stagingVercelPath} ${vercelPath}`);
    } else {
      console.error('❌ Staging project not set up!');
      console.log('   Please run: npm run setup:staging');
      process.exit(1);
    }
    
    try {
      // Deploy with staging configuration
      const vercelToken = process.env.VERCEL_TOKEN;
      const deployCommand = vercelToken 
        ? `vercel --prod --yes --token ${vercelToken}`
        : 'vercel --prod --yes';
      execSync(deployCommand, { stdio: 'inherit' });
      
      // Restore production config
      if (fs.existsSync(prodVercelPath)) {
        fs.rmSync(vercelPath, { recursive: true, force: true });
        fs.renameSync(prodVercelPath, vercelPath);
      }
      
      console.log('\n✅ Successfully deployed to staging!');
      console.log('   Your staging site should be available at your Vercel staging URL.');
      console.log('\n📝 Next steps:');
      console.log('   1. Visit your Vercel dashboard to see the deployment');
      console.log('   2. Configure your domain settings if needed');
      console.log('   3. Test the staging environment thoroughly');
      
    } catch (vercelError) {
      console.error('\n❌ Vercel deployment failed!');
      console.log('\nTroubleshooting:');
      console.log('   1. Make sure you have the Vercel CLI installed: npm i -g vercel');
      console.log('   2. Make sure you are logged in: vercel login');
      console.log('   3. Make sure your project is linked: vercel link');
      console.log('\nAlternatively, you can deploy manually:');
      console.log('   1. Push to the staging branch');
      console.log('   2. Configure automatic deployments in Vercel dashboard');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}