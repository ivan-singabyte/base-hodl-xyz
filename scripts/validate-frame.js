#!/usr/bin/env node

/**
 * Script to validate Farcaster frame configuration
 * Run: node scripts/validate-frame.js
 */

const https = require('https');

const APP_URL = process.env.NEXT_PUBLIC_URL || 'https://base-hodl.xyz';

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function validateFrame() {
  console.log(`${colors.blue}🔍 Validating Farcaster Frame Configuration${colors.reset}\n`);
  console.log(`Testing URL: ${APP_URL}\n`);

  const validationSteps = [
    {
      name: 'Farcaster JSON endpoint',
      url: `${APP_URL}/.well-known/farcaster.json`,
      validate: (data) => {
        const json = JSON.parse(data);
        return json.frame && json.frame.name === 'HODL Vault';
      }
    },
    {
      name: 'Base App JSON endpoint',
      url: `${APP_URL}/.well-known/base-app.json`,
      validate: (data) => {
        const json = JSON.parse(data);
        return json.app && json.app.id === 'hodl-vault';
      }
    },
    {
      name: 'Frame page',
      url: `${APP_URL}/frame`,
      validate: (data) => {
        return data.includes('HODL Vault') && data.includes('fc:frame');
      }
    },
    {
      name: 'Frame API endpoint',
      url: `${APP_URL}/api/frame`,
      validate: (data) => {
        const json = JSON.parse(data);
        return json.name === 'HODL Vault';
      }
    },
    {
      name: 'Open Graph image',
      url: `${APP_URL}/og-image.png`,
      validate: (data, status) => status === 200
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const step of validationSteps) {
    process.stdout.write(`Checking ${step.name}... `);
    
    try {
      const result = await fetchUrl(step.url);
      
      if (result.status !== 200) {
        console.log(`${colors.red}✗ Failed (HTTP ${result.status})${colors.reset}`);
        failed++;
        continue;
      }

      const isValid = step.validate(result.data, result.status);
      
      if (isValid) {
        console.log(`${colors.green}✓ Passed${colors.reset}`);
        passed++;
      } else {
        console.log(`${colors.red}✗ Failed (Invalid data)${colors.reset}`);
        failed++;
      }
    } catch (error) {
      console.log(`${colors.red}✗ Failed (${error.message})${colors.reset}`);
      failed++;
    }
  }

  console.log(`\n${colors.blue}📊 Validation Results${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

  // Frame debugger URLs
  console.log(`\n${colors.blue}🔧 Frame Debugging Tools${colors.reset}`);
  console.log(`Warpcast Validator: https://warpcast.com/~/developers/frames?url=${encodeURIComponent(APP_URL)}`);
  console.log(`Frame.js Playground: https://debugger.framesjs.org/?url=${encodeURIComponent(APP_URL)}/frame`);
  
  // Recommendations
  if (failed > 0) {
    console.log(`\n${colors.yellow}⚠️  Recommendations:${colors.reset}`);
    console.log('1. Ensure all endpoints are accessible');
    console.log('2. Check that metadata is properly formatted');
    console.log('3. Verify og-image.png exists in public folder');
    console.log('4. Test with the Frame debugger links above');
  } else {
    console.log(`\n${colors.green}✅ All validations passed! Your frame is ready for Farcaster.${colors.reset}`);
  }

  // Mini-app submission info
  console.log(`\n${colors.blue}📱 Mini-App Submission${colors.reset}`);
  console.log('To get listed on Base mini-apps:');
  console.log('1. Submit at: https://base.org/ecosystem/apps/submit');
  console.log('2. For Farcaster: Share your frame in /base channel');
  console.log('3. Tag @base for visibility');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run validation
validateFrame().catch(console.error);