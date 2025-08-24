#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * 
 * Analyzes the built bundle and generates reports for CI/CD pipeline
 */

import fs from 'fs';
import path from 'path';
import { filesize } from 'filesize';

const DIST_PATH = './dist';
const ASSETS_PATH = './dist/assets';

async function analyzeBundles() {
  console.log('🔍 Analyzing bundle...');

  if (!fs.existsSync(DIST_PATH)) {
    console.error('❌ Build directory not found. Please run build first.');
    process.exit(1);
  }

  // Get all files in assets directory recursively
  const assetFiles = [];
  if (fs.existsSync(ASSETS_PATH)) {
    const scanDirectory = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.css')) {
          assetFiles.push(fullPath);
        }
      }
    };
    scanDirectory(ASSETS_PATH);
  }

  const bundleData = {
    timestamp: new Date().toISOString(),
    totalAssets: assetFiles.length,
    assets: [],
    summary: {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      totalSizeFormatted: '',
      jsSizeFormatted: '',
      cssSizeFormatted: ''
    }
  };

  // Analyze each asset file
  for (const filePath of assetFiles) {
    const stats = fs.statSync(filePath);
    const size = stats.size;
    const fileName = path.basename(filePath);
    const relativePath = path.relative(ASSETS_PATH, filePath);
    
    const fileData = {
      name: fileName,
      path: relativePath,
      size: size,
      sizeFormatted: filesize(size),
      type: fileName.endsWith('.js') ? 'javascript' : 'css',
      gzipSize: Math.round(size * 0.3), // Rough estimation
      gzipSizeFormatted: filesize(Math.round(size * 0.3))
    };

    bundleData.assets.push(fileData);
    bundleData.summary.totalSize += size;
    
    if (fileName.endsWith('.js')) {
      bundleData.summary.jsSize += size;
    } else if (fileName.endsWith('.css')) {
      bundleData.summary.cssSize += size;
    }
  }

  // Format summary sizes
  bundleData.summary.totalSizeFormatted = filesize(bundleData.summary.totalSize);
  bundleData.summary.jsSizeFormatted = filesize(bundleData.summary.jsSize);
  bundleData.summary.cssSizeFormatted = filesize(bundleData.summary.cssSize);

  // Sort by size descending
  bundleData.assets.sort((a, b) => b.size - a.size);

  // Generate JSON report
  fs.writeFileSync('bundle-analyzer-report.json', JSON.stringify(bundleData, null, 2));

  // Generate HTML report
  const htmlReport = generateHtmlReport(bundleData);
  fs.writeFileSync(path.join(DIST_PATH, 'stats.html'), htmlReport);

  console.log('📊 Bundle Analysis Summary:');
  console.log(`   Total Size: ${bundleData.summary.totalSizeFormatted}`);
  console.log(`   JavaScript: ${bundleData.summary.jsSizeFormatted}`);
  console.log(`   CSS: ${bundleData.summary.cssSizeFormatted}`);
  console.log(`   Assets: ${bundleData.totalAssets} files`);
  console.log('✅ Bundle analysis complete');

  return bundleData;
}

function generateHtmlReport(bundleData) {
  const { summary, assets } = bundleData;
  
  const assetRows = assets.map(asset => `
    <tr>
      <td>${asset.name}</td>
      <td>${asset.type}</td>
      <td>${asset.sizeFormatted}</td>
      <td>${asset.gzipSizeFormatted}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Bundle Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .summary h2 { margin-top: 0; }
    .stat { display: inline-block; margin-right: 20px; }
    .stat-value { font-weight: bold; font-size: 1.2em; color: #0066cc; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f8f9fa; font-weight: 600; }
    .type-javascript { color: #f7df1e; }
    .type-css { color: #1572b6; }
  </style>
</head>
<body>
  <h1>Bundle Analysis Report</h1>
  <p>Generated on ${bundleData.timestamp}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="stat">
      <div>Total Size</div>
      <div class="stat-value">${summary.totalSizeFormatted}</div>
    </div>
    <div class="stat">
      <div>JavaScript</div>
      <div class="stat-value">${summary.jsSizeFormatted}</div>
    </div>
    <div class="stat">
      <div>CSS</div>
      <div class="stat-value">${summary.cssSizeFormatted}</div>
    </div>
    <div class="stat">
      <div>Total Assets</div>
      <div class="stat-value">${bundleData.totalAssets}</div>
    </div>
  </div>

  <h2>Asset Details</h2>
  <table>
    <thead>
      <tr>
        <th>File Name</th>
        <th>Type</th>
        <th>Size</th>
        <th>Gzipped</th>
      </tr>
    </thead>
    <tbody>
      ${assetRows}
    </tbody>
  </table>
</body>
</html>
  `;
}

// Run analyzer if called directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  analyzeBundles().catch(error => {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  });
}

// Always run if this is the main module
if (process.argv[1] && process.argv[1].endsWith('analyze-bundle.js')) {
  analyzeBundles().catch(error => {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  });
}

export default analyzeBundles;
