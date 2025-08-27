#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Embeds & Previews Configuration\n');

let errors = [];
let warnings = [];
let success = [];

// Check 1: Farcaster manifest file
const manifestPath = path.join(__dirname, '../public/.well-known/farcaster.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.frame && manifest.frame.name) {
      success.push('✅ Farcaster manifest file exists and is valid JSON');
    } else {
      warnings.push('⚠️  Farcaster manifest exists but may be incomplete');
    }
  } catch (e) {
    errors.push('❌ Farcaster manifest file exists but has invalid JSON');
  }
} else {
  errors.push('❌ Missing Farcaster manifest file at /.well-known/farcaster.json');
}

// Check 2: OG image
const ogImagePath = path.join(__dirname, '../public/og-image.png');
if (fs.existsSync(ogImagePath)) {
  const stats = fs.statSync(ogImagePath);
  const sizeInMB = stats.size / (1024 * 1024);
  success.push(`✅ OG image exists (${sizeInMB.toFixed(2)} MB)`);
  if (sizeInMB > 5) {
    warnings.push('⚠️  OG image is larger than 5MB, consider optimizing');
  }
} else {
  errors.push('❌ Missing OG image at /public/og-image.png');
}

// Check 3: Icons
const iconSizes = ['192', '512'];
iconSizes.forEach(size => {
  const iconPath = path.join(__dirname, `../public/icon-${size}.png`);
  if (fs.existsSync(iconPath)) {
    success.push(`✅ Icon ${size}x${size} exists`);
  } else {
    warnings.push(`⚠️  Missing icon-${size}.png`);
  }
});

// Check 4: Environment variables
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_URL',
    'NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME',
    'NEXT_PUBLIC_APP_HERO_IMAGE',
    'NEXT_PUBLIC_SPLASH_IMAGE',
    'NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      success.push(`✅ Environment variable ${varName} is defined`);
    } else {
      errors.push(`❌ Missing environment variable: ${varName}`);
    }
  });
  
  // Check if URL is production
  if (envContent.includes('NEXT_PUBLIC_URL=http://localhost')) {
    warnings.push('⚠️  NEXT_PUBLIC_URL is still set to localhost');
  }
} else {
  errors.push('❌ Missing .env.local file');
}

// Check 5: Share functionality
const shareButtonPath = path.join(__dirname, '../app/components/ShareButton.tsx');
if (fs.existsSync(shareButtonPath)) {
  const content = fs.readFileSync(shareButtonPath, 'utf8');
  if (content.includes('Farcaster') && content.includes('Twitter')) {
    success.push('✅ Share functionality implemented for Farcaster and Twitter');
  }
  
  if (!content.includes('useComposeCast')) {
    warnings.push('⚠️  Consider using MiniKit\'s useComposeCast hook for better integration');
  }
}

// Print results
console.log('=== VALIDATION RESULTS ===\n');

if (success.length > 0) {
  console.log('✅ SUCCESS:');
  success.forEach(s => console.log(`  ${s}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(w => console.log(`  ${w}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS:');
  errors.forEach(e => console.log(`  ${e}`));
  console.log('');
}

// Summary
console.log('=== SUMMARY ===');
console.log(`✅ ${success.length} checks passed`);
console.log(`⚠️  ${warnings.length} warnings`);
console.log(`❌ ${errors.length} errors`);

if (errors.length === 0) {
  console.log('\n🎉 Your app meets the basic embed requirements!');
  console.log('\n📝 Next steps:');
  console.log('  1. Test your embeds at: https://farcaster.xyz/~/developers/mini-apps/debug');
  console.log('  2. Deploy to production and update NEXT_PUBLIC_URL');
  console.log('  3. Consider implementing dynamic embeds for personalized sharing');
} else {
  console.log('\n⚠️  Please fix the errors before deploying.');
  process.exit(1);
}