#!/usr/bin/env node

/**
 * Manifest Validation Script for Base Mini App
 * Validates manifest.json against Base Mini App requirements
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '../public/manifest.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Required icon sizes for Base Mini Apps
const REQUIRED_ICONS = [
  { size: '16x16', file: 'favicon-16x16.png', required: false },
  { size: '32x32', file: 'favicon-32x32.png', required: false },
  { size: '72x72', file: 'icon-72.png', required: false },
  { size: '96x96', file: 'icon-96.png', required: false },
  { size: '128x128', file: 'icon-128.png', required: false },
  { size: '144x144', file: 'icon-144.png', required: false },
  { size: '152x152', file: 'icon-152.png', required: false },
  { size: '192x192', file: 'icon-192.png', required: true },
  { size: '384x384', file: 'icon-384.png', required: false },
  { size: '512x512', file: 'icon-512.png', required: true },
  { size: '1024x1024', file: 'icon-1024.png', required: true } // Critical for Base App
];

// Valid categories for Base Mini Apps
const VALID_CATEGORIES = [
  'social', 'games', 'defi', 'tools', 'entertainment', 
  'education', 'finance', 'productivity', 'lifestyle', 
  'news', 'sports', 'music', 'art', 'photography'
];

class ManifestValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  log(type, message) {
    switch(type) {
      case 'error':
        this.errors.push(message);
        console.log(`${colors.red}✗ ERROR: ${message}${colors.reset}`);
        break;
      case 'warning':
        this.warnings.push(message);
        console.log(`${colors.yellow}⚠ WARNING: ${message}${colors.reset}`);
        break;
      case 'success':
        this.successes.push(message);
        console.log(`${colors.green}✓ ${message}${colors.reset}`);
        break;
      case 'info':
        console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
        break;
    }
  }

  validateManifestStructure(manifest) {
    console.log('\n📋 Validating Manifest Structure...\n');

    // Required fields
    const requiredFields = ['name', 'short_name', 'description', 'icons', 'start_url', 'display'];
    requiredFields.forEach(field => {
      if (!manifest[field]) {
        this.log('error', `Missing required field: ${field}`);
      } else {
        this.log('success', `Required field present: ${field}`);
      }
    });

    // Validate name length
    if (manifest.name && manifest.name.length > 45) {
      this.log('warning', `Name is too long (${manifest.name.length} chars). Recommended max: 45 chars`);
    }

    // Validate short_name length
    if (manifest.short_name && manifest.short_name.length > 12) {
      this.log('warning', `Short name is too long (${manifest.short_name.length} chars). Recommended max: 12 chars`);
    }

    // Validate description
    if (manifest.description) {
      if (manifest.description.length > 130) {
        this.log('error', `Description too long (${manifest.description.length} chars). Max: 130 chars`);
      } else {
        this.log('success', `Description length OK (${manifest.description.length}/130 chars)`);
      }
    }

    // Validate primaryCategory
    if (manifest.primaryCategory) {
      if (VALID_CATEGORIES.includes(manifest.primaryCategory)) {
        this.log('success', `Valid primary category: ${manifest.primaryCategory}`);
      } else {
        this.log('error', `Invalid primary category: ${manifest.primaryCategory}. Valid options: ${VALID_CATEGORIES.join(', ')}`);
      }
    } else {
      this.log('warning', 'No primaryCategory specified - this affects discoverability');
    }

    // Validate tags
    if (manifest.tags) {
      this.log('success', `Tags present (${manifest.tags.length} tags) - improves search discovery`);
      if (manifest.tags.length > 20) {
        this.log('warning', 'Too many tags (>20) may dilute search relevance');
      }
    } else {
      this.log('warning', 'No tags specified - consider adding for better search discovery');
    }

    // Check for noindex in production
    if (manifest.noindex === true) {
      this.log('error', 'noindex is set to true - app won\'t appear in search!');
    }

    // Validate display mode
    if (manifest.display && !['fullscreen', 'standalone', 'minimal-ui', 'browser'].includes(manifest.display)) {
      this.log('error', `Invalid display mode: ${manifest.display}`);
    }
  }

  validateIcons(manifest) {
    console.log('\n🎨 Validating Icons...\n');

    if (!manifest.icons || !Array.isArray(manifest.icons)) {
      this.log('error', 'Icons array is missing or invalid');
      return;
    }

    // Check for 1024x1024 icon (critical for Base App)
    const has1024 = manifest.icons.some(icon => 
      icon.sizes && icon.sizes.includes('1024')
    );
    
    if (!has1024) {
      this.log('error', 'Missing 1024x1024 icon - REQUIRED for Base App visibility');
    } else {
      this.log('success', '1024x1024 icon configured - critical for Base App');
    }

    // Validate each icon entry
    manifest.icons.forEach(icon => {
      if (!icon.src) {
        this.log('error', 'Icon entry missing src');
        return;
      }

      if (!icon.sizes) {
        this.log('warning', `Icon ${icon.src} missing sizes attribute`);
      }

      if (!icon.type) {
        this.log('warning', `Icon ${icon.src} missing type attribute`);
      }

      // Check if file exists
      const iconPath = path.join(PUBLIC_DIR, icon.src.replace(/^\//, ''));
      if (fs.existsSync(iconPath)) {
        const stats = fs.statSync(iconPath);
        const sizeInKB = Math.round(stats.size / 1024);
        
        if (sizeInKB > 500) {
          this.log('warning', `Icon ${icon.src} is large (${sizeInKB}KB) - consider optimizing`);
        }
        
        // Special check for 1024x1024
        if (icon.sizes && icon.sizes.includes('1024') && sizeInKB > 200) {
          this.log('warning', `1024x1024 icon is ${sizeInKB}KB - recommend <200KB for faster loading`);
        }
      } else {
        this.log('error', `Icon file not found: ${icon.src}`);
      }
    });

    // Check for required icon files
    console.log('\n📁 Checking Icon Files...\n');
    REQUIRED_ICONS.forEach(({ size, file, required }) => {
      const filePath = path.join(PUBLIC_DIR, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeInKB = Math.round(stats.size / 1024);
        this.log('success', `${file} exists (${sizeInKB}KB)`);
      } else if (required) {
        this.log('error', `Missing required icon: ${file} (${size})`);
      } else {
        this.log('warning', `Missing recommended icon: ${file} (${size})`);
      }
    });
  }

  validateFrameMetadata() {
    console.log('\n🖼️ Checking Frame Metadata...\n');

    // Check for OG image
    const ogImagePath = path.join(PUBLIC_DIR, 'og-image.png');
    if (fs.existsSync(ogImagePath)) {
      const stats = fs.statSync(ogImagePath);
      const sizeInKB = Math.round(stats.size / 1024);
      this.log('success', `OG image exists (${sizeInKB}KB)`);
      
      if (sizeInKB > 1000) {
        this.log('warning', `OG image is large (${sizeInKB}KB) - may load slowly on social shares`);
      }
    } else {
      this.log('error', 'Missing og-image.png - required for social sharing');
    }

    // Check layout.tsx for frame metadata
    const layoutPath = path.join(__dirname, '../app/layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');
      
      if (layoutContent.includes('fc:frame')) {
        this.log('success', 'Farcaster frame metadata detected in layout.tsx');
        
        // Check for frame buttons
        if (layoutContent.includes('fc:frame:button')) {
          this.log('success', 'Frame buttons configured for interactivity');
        }
        
        // Check for aspect ratio
        if (layoutContent.includes('fc:frame:image:aspect_ratio')) {
          this.log('success', 'Frame aspect ratio specified');
        }
      } else {
        this.log('warning', 'No Farcaster frame metadata found - consider adding for better social integration');
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60) + '\n');

    console.log(`${colors.green}✓ Passed: ${this.successes.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Warnings: ${this.warnings.length}${colors.reset}`);
    console.log(`${colors.red}✗ Errors: ${this.errors.length}${colors.reset}`);

    if (this.errors.length === 0) {
      console.log(`\n${colors.green}🎉 Manifest validation passed! Your app meets Base Mini App requirements.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}❌ Validation failed. Please fix the errors above.${colors.reset}`);
    }

    console.log('\n📚 Documentation: https://docs.base.org/mini-apps/search-discovery');
    console.log('='.repeat(60) + '\n');

    return this.errors.length === 0;
  }

  run() {
    console.log(`\n${colors.cyan}🔍 Base Mini App Manifest Validator${colors.reset}`);
    console.log('='.repeat(60));

    // Check if manifest exists
    if (!fs.existsSync(MANIFEST_PATH)) {
      this.log('error', `Manifest file not found at: ${MANIFEST_PATH}`);
      return false;
    }

    let manifest;
    try {
      const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
      manifest = JSON.parse(manifestContent);
      this.log('success', 'Manifest file parsed successfully');
    } catch (error) {
      this.log('error', `Failed to parse manifest.json: ${error.message}`);
      return false;
    }

    // Run validations
    this.validateManifestStructure(manifest);
    this.validateIcons(manifest);
    this.validateFrameMetadata();

    // Generate report
    const isValid = this.generateReport();
    process.exit(isValid ? 0 : 1);
  }
}

// Run validator
const validator = new ManifestValidator();
validator.run();