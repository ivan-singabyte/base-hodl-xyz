#!/usr/bin/env node

/**
 * Base App Discovery Readiness Checker
 * Run: node scripts/check-base-readiness.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const APP_URL = process.env.NEXT_PUBLIC_URL || 'https://base-hodl.xyz';

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function checkLocalFiles() {
  log.header('Local File Checks');
  
  const requiredFiles = [
    { path: 'public/og-image.png', description: 'Open Graph image' },
    { path: 'public/icon-512.png', description: 'App icon (512x512)' },
    { path: 'public/manifest.json', description: 'PWA manifest' },
    { path: '.env.local', description: 'Environment variables', optional: true }
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
      log.success(`${file.description} found: ${file.path}`);
    } else if (file.optional) {
      log.warning(`${file.description} not found (optional): ${file.path}`);
    } else {
      log.error(`${file.description} missing: ${file.path}`);
    }
  }
}

async function checkEndpoints() {
  log.header('API Endpoint Checks');

  const endpoints = [
    {
      name: 'App Metadata',
      url: `${APP_URL}/.well-known/app-metadata.json`,
      required: ['name', 'description', 'icon', 'url']
    },
    {
      name: 'Farcaster Config',
      url: `${APP_URL}/.well-known/farcaster.json`,
      required: ['frame', 'accountAssociation']
    },
    {
      name: 'Base App Config',
      url: `${APP_URL}/.well-known/base-app.json`,
      required: ['app', 'technical', 'discovery']
    },
    {
      name: 'Frame Page',
      url: `${APP_URL}/frame`,
      isHtml: true,
      required: ['fc:frame', 'og:image']
    }
  ];

  let allPassed = true;

  for (const endpoint of endpoints) {
    try {
      const result = await fetchUrl(endpoint.url);
      
      if (result.status !== 200) {
        log.error(`${endpoint.name}: HTTP ${result.status}`);
        allPassed = false;
        continue;
      }

      if (endpoint.isHtml) {
        const hasRequiredTags = endpoint.required.every(tag => 
          result.data.includes(tag)
        );
        if (hasRequiredTags) {
          log.success(`${endpoint.name}: All required tags present`);
        } else {
          log.error(`${endpoint.name}: Missing required tags`);
          allPassed = false;
        }
      } else {
        const json = JSON.parse(result.data);
        const hasRequiredFields = endpoint.required.every(field => 
          field.split('.').reduce((obj, key) => obj?.[key], json) !== undefined
        );
        
        if (hasRequiredFields) {
          log.success(`${endpoint.name}: Valid with all required fields`);
        } else {
          log.error(`${endpoint.name}: Missing required fields`);
          allPassed = false;
        }
      }
    } catch (error) {
      log.error(`${endpoint.name}: ${error.message}`);
      allPassed = false;
    }
  }

  return allPassed;
}

async function checkMetaTags() {
  log.header('Meta Tag Validation');

  try {
    const result = await fetchUrl(APP_URL);
    const html = result.data;

    const requiredMeta = [
      { name: 'og:title', pattern: /<meta[^>]*property="og:title"[^>]*>/i },
      { name: 'og:description', pattern: /<meta[^>]*property="og:description"[^>]*>/i },
      { name: 'og:image', pattern: /<meta[^>]*property="og:image"[^>]*>/i },
      { name: 'twitter:card', pattern: /<meta[^>]*name="twitter:card"[^>]*>/i },
      { name: 'fc:frame', pattern: /<meta[^>]*(?:property|name)="fc:frame"[^>]*>/i }
    ];

    for (const meta of requiredMeta) {
      if (meta.pattern.test(html)) {
        log.success(`Meta tag ${meta.name} found`);
      } else {
        log.warning(`Meta tag ${meta.name} not found on homepage`);
      }
    }
  } catch (error) {
    log.error(`Failed to check meta tags: ${error.message}`);
  }
}

async function checkReadiness() {
  console.log(`${colors.blue}🚀 Base App Discovery Readiness Check${colors.reset}`);
  console.log(`${colors.blue}Testing: ${APP_URL}${colors.reset}`);

  // Run all checks
  await checkLocalFiles();
  const endpointsOk = await checkEndpoints();
  await checkMetaTags();

  // Environment check
  log.header('Environment Variables');
  const requiredEnvVars = [
    'NEXT_PUBLIC_ONCHAINKIT_API_KEY',
    'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID',
    'NEXT_PUBLIC_VAULT_ADDRESS',
    'NEXT_PUBLIC_URL'
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      log.success(`${envVar} is set`);
    } else {
      log.warning(`${envVar} is not set (check .env.local)`);
    }
  }

  // Final recommendations
  log.header('Submission Readiness');

  if (endpointsOk) {
    log.success('All critical endpoints are functional');
  } else {
    log.error('Some endpoints are not working properly');
  }

  console.log(`\n${colors.cyan}📋 Next Steps:${colors.reset}`);
  console.log('1. Create screenshots of your app (home & dashboard)');
  console.log('2. Update contract address in app-metadata.json');
  console.log('3. Submit at: https://base.org/ecosystem/apps/submit');
  console.log('4. Share frame on Farcaster: /base channel');
  console.log('5. Test frame at: https://warpcast.com/~/developers/frames');

  console.log(`\n${colors.cyan}🔗 Quick Links:${colors.reset}`);
  console.log(`Frame Validator: https://warpcast.com/~/developers/frames?url=${encodeURIComponent(APP_URL)}`);
  console.log(`Frame Debugger: https://debugger.framesjs.org/?url=${encodeURIComponent(APP_URL + '/frame')}`);
  console.log(`App Metadata: ${APP_URL}/.well-known/app-metadata.json`);

  console.log(`\n${colors.green}✅ Readiness check complete!${colors.reset}`);
}

// Run the checker
checkReadiness().catch(console.error);