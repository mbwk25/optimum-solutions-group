#!/usr/bin/env node
/**
 * PWA Development Tools
 * Utilities for PWA development and debugging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = {
  'validate-manifest': validateManifest,
  'check-icons': checkIcons,
  'analyze-performance': analyzePerformance,
  'test-offline': testOffline,
  'help': showHelp
};

function validateManifest() {
  console.log('🔍 Validating PWA Manifest...');
  
  try {
    const manifestPath = path.join(__dirname, '../public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missing = required.filter(field => !manifest[field]);
    
    if (missing.length === 0) {
      console.log('✅ Manifest validation passed');
      console.log(`📱 App: ${manifest.name} (${manifest.short_name})`);
      console.log(`🎯 Start URL: ${manifest.start_url}`);
      console.log(`📺 Display: ${manifest.display}`);
      console.log(`🎨 Theme: ${manifest.theme_color}`);
      console.log(`🔢 Icons: ${manifest.icons.length} defined`);
    } else {
      console.log('❌ Manifest validation failed');
      console.log('Missing required fields:', missing.join(', '));
    }
  } catch (error) {
    console.error('❌ Error reading manifest:', error.message);
  }
}

function checkIcons() {
  console.log('🖼️  Checking PWA Icons...');
  
  try {
    const manifestPath = path.join(__dirname, '../public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    const publicDir = path.join(__dirname, '../public');
    let found = 0, missing = 0;
    
    manifest.icons.forEach(icon => {
      const iconPath = path.join(publicDir, icon.src.replace(/^\//, ''));
      if (fs.existsSync(iconPath)) {
        found++;
        console.log(`✅ ${icon.src} (${icon.sizes})`);
      } else {
        missing++;
        console.log(`❌ ${icon.src} (${icon.sizes}) - NOT FOUND`);
      }
    });
    
    console.log(`\n📊 Summary: ${found} found, ${missing} missing`);
    
    if (missing > 0) {
      console.log('\n💡 Run "npm run generate:icons" to create placeholder icons');
    }
  } catch (error) {
    console.error('❌ Error checking icons:', error.message);
  }
}

function analyzePerformance() {
  console.log('⚡ Performance Analysis Tips:');
  console.log('');
  console.log('1. 🔍 Open DevTools → Lighthouse → Progressive Web App');
  console.log('2. 📊 Check Core Web Vitals in DevTools → Performance');
  console.log('3. 🌐 Test with Chrome DevTools → Application → Service Workers');
  console.log('4. 📱 Test installation: Chrome → ⋮ → Install App');
  console.log('5. 🔧 Debug with our PerformanceMonitor component');
  console.log('');
  console.log('Common issues to check:');
  console.log('• Service Worker registration');
  console.log('• Manifest validation');
  console.log('• HTTPS requirement');
  console.log('• Icon availability');
  console.log('• Caching strategy');
}

function testOffline() {
  console.log('🔌 Offline Testing Guide:');
  console.log('');
  console.log('1. Open DevTools → Network → Throttling → Offline');
  console.log('2. Reload the page to test offline functionality');
  console.log('3. Check if cached resources load correctly');
  console.log('4. Test PWA install prompt behavior');
  console.log('5. Verify service worker cache strategy');
  console.log('');
  console.log('Expected behavior:');
  console.log('• ✅ App should load from cache');
  console.log('• ✅ Core functionality should work');
  console.log('• ✅ Offline indicator should show');
  console.log('• ✅ Data should sync when back online');
}

function showHelp() {
  console.log('🔧 PWA Development Tools');
  console.log('');
  console.log('Available commands:');
  console.log('  validate-manifest  - Check manifest.json validity');
  console.log('  check-icons       - Verify icon availability');
  console.log('  analyze-performance - Performance testing tips');
  console.log('  test-offline      - Offline testing guide');
  console.log('  help             - Show this help');
  console.log('');
  console.log('Usage: node scripts/pwa-dev-tools.js <command>');
}

// Run the command
const command = process.argv[2] || 'help';
const handler = commands[command];

if (handler) {
  handler();
} else {
  console.log(`❌ Unknown command: ${command}`);
  showHelp();
}
