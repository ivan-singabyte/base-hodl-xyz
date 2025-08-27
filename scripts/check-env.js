#!/usr/bin/env node

/**
 * Script to check if environment variables are properly configured
 */

console.log('=== Environment Variable Check ===\n');

const requiredVars = [
  'NEXT_PUBLIC_VAULT_ADDRESS',
  'NEXT_PUBLIC_ONCHAINKIT_API_KEY',
  'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID'
];

const warnings = [];
const errors = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  
  if (!value) {
    errors.push(`❌ ${varName} is not set`);
  } else {
    // Check for common issues
    if (value.includes('\n')) {
      warnings.push(`⚠️  ${varName} contains newline characters`);
    }
    if (value.includes(' ') && varName !== 'NEXT_PUBLIC_URL') {
      warnings.push(`⚠️  ${varName} contains spaces`);
    }
    
    // Specific validations
    if (varName === 'NEXT_PUBLIC_VAULT_ADDRESS') {
      if (!value.startsWith('0x')) {
        errors.push(`❌ ${varName} should start with '0x'`);
      } else if (value.length !== 42) {
        warnings.push(`⚠️  ${varName} doesn't appear to be a valid Ethereum address (should be 42 characters)`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    } else if (varName === 'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID') {
      if (value.length !== 32) {
        warnings.push(`⚠️  ${varName} doesn't appear to be a valid WalletConnect project ID (should be 32 characters)`);
      } else {
        console.log(`✅ ${varName}: ${value.substring(0, 8)}...${value.substring(24)}`);
      }
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    }
  }
});

console.log('\n=== Results ===\n');

if (errors.length > 0) {
  console.log('ERRORS:');
  errors.forEach(error => console.log(error));
  console.log('\nPlease set these environment variables in your .env.local file or Vercel dashboard.');
}

if (warnings.length > 0) {
  console.log('\nWARNINGS:');
  warnings.forEach(warning => console.log(warning));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All environment variables are properly configured!');
}

process.exit(errors.length > 0 ? 1 : 0);