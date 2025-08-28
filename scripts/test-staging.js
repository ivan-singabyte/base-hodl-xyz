#!/usr/bin/env node
const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.staging' });

async function testStagingEnvironment() {
  console.log('🧪 Testing Staging Environment\n');
  console.log('================================\n');
  
  const results = {
    passed: [],
    failed: []
  };
  
  // Test 1: Environment Variables
  console.log('1️⃣  Checking environment variables...');
  const requiredEnvVars = [
    'NEXT_PUBLIC_VAULT_ADDRESS',
    'NEXT_PUBLIC_ONCHAINKIT_API_KEY',
    'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID',
    'NEXT_PUBLIC_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  if (missingVars.length === 0) {
    results.passed.push('✅ All required environment variables are set');
  } else {
    results.failed.push(`❌ Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  // Test 2: Contract Address Format
  console.log('2️⃣  Validating contract address...');
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
  if (vaultAddress && ethers.isAddress(vaultAddress)) {
    results.passed.push('✅ Valid vault contract address');
  } else {
    results.failed.push('❌ Invalid vault contract address');
  }
  
  // Test 3: RPC Connection
  console.log('3️⃣  Testing Base Sepolia RPC connection...');
  try {
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const blockNumber = await provider.getBlockNumber();
    results.passed.push(`✅ Connected to Base Sepolia (Block: ${blockNumber})`);
    
    // Test 4: Contract Deployment Check
    console.log('4️⃣  Checking contract deployment...');
    const code = await provider.getCode(vaultAddress);
    if (code !== '0x') {
      results.passed.push('✅ Contract is deployed on Base Sepolia');
      
      // Test 5: Contract Interface
      console.log('5️⃣  Verifying contract interface...');
      const vaultABI = require('../artifacts/contracts/HodlVault.sol/HodlVault.json').abi;
      const vault = new ethers.Contract(vaultAddress, vaultABI, provider);
      
      try {
        // Try to call a view function
        const lockDurations = await vault.getLockDurations();
        results.passed.push(`✅ Contract interface verified (${lockDurations.length} lock durations)`);
      } catch (error) {
        results.failed.push('❌ Contract interface mismatch');
      }
    } else {
      results.failed.push('❌ No contract deployed at the specified address');
    }
  } catch (error) {
    results.failed.push(`❌ RPC connection failed: ${error.message}`);
  }
  
  // Test 6: URL Configuration
  console.log('6️⃣  Checking URL configuration...');
  const appUrl = process.env.NEXT_PUBLIC_URL;
  if (appUrl && appUrl.startsWith('https://')) {
    results.passed.push('✅ Valid HTTPS URL configured');
  } else {
    results.failed.push('❌ Invalid or insecure URL configuration');
  }
  
  // Print Results
  console.log('\n================================');
  console.log('📊 TEST RESULTS\n');
  
  if (results.passed.length > 0) {
    console.log('PASSED:');
    results.passed.forEach(r => console.log('  ' + r));
  }
  
  if (results.failed.length > 0) {
    console.log('\nFAILED:');
    results.failed.forEach(r => console.log('  ' + r));
  }
  
  console.log('\n================================');
  console.log(`Total: ${results.passed.length} passed, ${results.failed.length} failed`);
  
  if (results.failed.length === 0) {
    console.log('\n🎉 All staging tests passed! Ready for deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues before deploying.');
    process.exit(1);
  }
}

// Run tests
testStagingEnvironment().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});