#!/usr/bin/env node

/**
 * Bundle Size Checker Script
 * 
 * Checks bundle size against defined limits and reports violations.
 * Used in CI/CD pipeline to ensure bundle size stays within acceptable limits.
 */

import fs from 'fs';
import path from 'path';
import { filesize } from 'filesize';

// Default size limits (in bytes)
const DEFAULT_LIMITS = {
  js: 300 * 1024,      // 300KB for JavaScript
  css: 100 * 1024,     // 100KB for CSS
  total: 500 * 1024,   // 500KB total
  individual: 200 * 1024 // 200KB for any individual file
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class BundleSizeChecker {
  constructor(options = {}) {
    this.options = {
      path: options.path || './dist/assets',
      limits: { ...DEFAULT_LIMITS, ...options.limits },
      outputFormat: options.outputFormat || 'console',
      failOnLimit: options.failOnLimit !== false,
      verbose: options.verbose || false,
      baseline: options.baseline || null,
      outputFile: options.outputFile || null
    };

    this.results = {
      files: [],
      totalSize: 0,
      violations: [],
      warnings: [],
      summary: {}
    };
  }

  /**
   * Analyze bundle files and check sizes
   */
  async analyze() {
    try {
      const assetsPath = path.resolve(this.options.path);
      
      if (!fs.existsSync(assetsPath)) {
        throw new Error(`Assets directory not found: ${assetsPath}`);
      }

      this.log(`🔍 Analyzing bundle files in: ${assetsPath}`);
      
      // Get all files recursively
      const files = this.getFilesRecursively(assetsPath);
      
      // Analyze each file
      for (const file of files) {
        const stat = fs.statSync(file);
        const relativePath = path.relative(assetsPath, file);
        const ext = path.extname(file).slice(1);
        
        const fileInfo = {
          path: relativePath,
          fullPath: file,
          size: stat.size,
          extension: ext,
          sizeFormatted: filesize(stat.size),
          type: this.getFileType(ext)
        };

        this.results.files.push(fileInfo);
        this.results.totalSize += stat.size;

        // Check individual file limits
        this.checkIndividualFileSize(fileInfo);
      }

      // Check aggregate limits
      this.checkAggregateSizes();

      // Compare with baseline if provided
      if (this.options.baseline) {
        await this.compareWithBaseline();
      }

      // Generate summary
      this.generateSummary();

      return this.results;
    } catch (error) {
      this.error(`Error analyzing bundle: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all files recursively from directory
   */
  getFilesRecursively(dir) {
    let files = [];
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(this.getFilesRecursively(fullPath));
      } else if (this.shouldAnalyzeFile(item)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Check if file should be analyzed
   */
  shouldAnalyzeFile(filename) {
    const ext = path.extname(filename).slice(1).toLowerCase();
    const relevantExtensions = ['js', 'css', 'mjs', 'jsx', 'ts', 'tsx'];
    
    // Skip source maps and hot update files
    if (filename.includes('.map') || filename.includes('hot-update')) {
      return false;
    }
    
    return relevantExtensions.includes(ext);
  }

  /**
   * Get file type for categorization
   */
  getFileType(extension) {
    const jsExtensions = ['js', 'mjs', 'jsx', 'ts', 'tsx'];
    const cssExtensions = ['css', 'scss', 'sass', 'less'];
    
    if (jsExtensions.includes(extension)) return 'js';
    if (cssExtensions.includes(extension)) return 'css';
    return 'other';
  }

  /**
   * Check individual file size limits
   */
  checkIndividualFileSize(fileInfo) {
    const typeLimit = this.options.limits[fileInfo.type];
    const individualLimit = this.options.limits.individual;
    
    // Check type-specific limit
    if (typeLimit && fileInfo.size > typeLimit) {
      this.results.violations.push({
        type: 'type-limit',
        file: fileInfo.path,
        size: fileInfo.size,
        limit: typeLimit,
        fileType: fileInfo.type,
        message: `${fileInfo.path} (${fileInfo.sizeFormatted}) exceeds ${fileInfo.type.toUpperCase()} limit of ${filesize(typeLimit)}`
      });
    }

    // Check individual file limit
    if (fileInfo.size > individualLimit) {
      this.results.violations.push({
        type: 'individual-limit',
        file: fileInfo.path,
        size: fileInfo.size,
        limit: individualLimit,
        message: `${fileInfo.path} (${fileInfo.sizeFormatted}) exceeds individual file limit of ${filesize(individualLimit)}`
      });
    }

    // Warning for files approaching limits
    const warningThreshold = 0.8; // 80% of limit
    if (typeLimit && fileInfo.size > typeLimit * warningThreshold && fileInfo.size <= typeLimit) {
      this.results.warnings.push({
        type: 'approaching-limit',
        file: fileInfo.path,
        size: fileInfo.size,
        limit: typeLimit,
        percentage: Math.round((fileInfo.size / typeLimit) * 100),
        message: `${fileInfo.path} is approaching ${fileInfo.type.toUpperCase()} limit (${Math.round((fileInfo.size / typeLimit) * 100)}%)`
      });
    }
  }

  /**
   * Check aggregate size limits
   */
  checkAggregateSizes() {
    // Group files by type
    const sizesByType = this.results.files.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + file.size;
      return acc;
    }, {});

    // Check total size limit
    if (this.results.totalSize > this.options.limits.total) {
      this.results.violations.push({
        type: 'total-limit',
        size: this.results.totalSize,
        limit: this.options.limits.total,
        message: `Total bundle size (${filesize(this.results.totalSize)}) exceeds limit of ${filesize(this.options.limits.total)}`
      });
    }

    // Check type aggregate limits
    Object.entries(sizesByType).forEach(([type, size]) => {
      const limit = this.options.limits[`${type}Total`] || this.options.limits.total;
      if (size > limit) {
        this.results.violations.push({
          type: 'aggregate-limit',
          fileType: type,
          size: size,
          limit: limit,
          message: `Total ${type.toUpperCase()} size (${filesize(size)}) exceeds limit of ${filesize(limit)}`
        });
      }
    });

    this.results.sizesByType = sizesByType;
  }

  /**
   * Compare with baseline sizes
   */
  async compareWithBaseline() {
    try {
      const baselinePath = path.resolve(this.options.baseline);
      
      if (!fs.existsSync(baselinePath)) {
        this.log(`⚠️  Baseline file not found: ${baselinePath}`);
        return;
      }

      const baselineData = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
      const baselineTotal = baselineData.totalSize || 0;
      
      const sizeDiff = this.results.totalSize - baselineTotal;
      const percentChange = baselineTotal > 0 ? (sizeDiff / baselineTotal) * 100 : 0;

      this.results.baseline = {
        previousSize: baselineTotal,
        currentSize: this.results.totalSize,
        difference: sizeDiff,
        percentChange: percentChange,
        isRegression: sizeDiff > 0 && Math.abs(percentChange) > 5 // 5% threshold
      };

      if (this.results.baseline.isRegression) {
        this.results.warnings.push({
          type: 'size-regression',
          message: `Bundle size increased by ${filesize(sizeDiff)} (${percentChange.toFixed(2)}%) compared to baseline`,
          previousSize: baselineTotal,
          currentSize: this.results.totalSize
        });
      }

    } catch (error) {
      this.log(`⚠️  Error comparing with baseline: ${error.message}`);
    }
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    const filesByType = this.results.files.reduce((acc, file) => {
      acc[file.type] = acc[file.type] || [];
      acc[file.type].push(file);
      return acc;
    }, {});

    this.results.summary = {
      totalFiles: this.results.files.length,
      totalSize: this.results.totalSize,
      totalSizeFormatted: filesize(this.results.totalSize),
      violationCount: this.results.violations.length,
      warningCount: this.results.warnings.length,
      filesByType: Object.entries(filesByType).reduce((acc, [type, files]) => {
        acc[type] = {
          count: files.length,
          totalSize: files.reduce((sum, f) => sum + f.size, 0),
          largestFile: files.reduce((largest, f) => f.size > largest.size ? f : largest, files[0] || { size: 0 })
        };
        acc[type].totalSizeFormatted = filesize(acc[type].totalSize);
        return acc;
      }, {}),
      largestFile: this.results.files.reduce((largest, f) => f.size > largest.size ? f : largest, { size: 0 }),
      utilizationByType: {}
    };

    // Calculate utilization percentages
    Object.entries(this.results.summary.filesByType).forEach(([type, info]) => {
      const limit = this.options.limits[type] || this.options.limits.total;
      this.results.summary.utilizationByType[type] = {
        used: info.totalSize,
        limit: limit,
        percentage: Math.round((info.totalSize / limit) * 100)
      };
    });
  }

  /**
   * Output results
   */
  async outputResults() {
    switch (this.options.outputFormat) {
      case 'json':
        await this.outputJSON();
        break;
      case 'html':
        await this.outputHTML();
        break;
      case 'github':
        await this.outputGitHubActions();
        break;
      default:
        this.outputConsole();
    }

    if (this.options.outputFile) {
      await this.saveToFile();
    }
  }

  /**
   * Console output
   */
  outputConsole() {
    console.log(`\n${colors.cyan}📦 Bundle Size Analysis${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}\n`);

    // Summary
    console.log(`${colors.green}📊 Summary:${colors.reset}`);
    console.log(`  Total files: ${this.results.summary.totalFiles}`);
    console.log(`  Total size: ${colors.yellow}${this.results.summary.totalSizeFormatted}${colors.reset}`);
    
    if (this.results.baseline) {
      const diff = this.results.baseline.difference;
      const symbol = diff > 0 ? '↗️' : diff < 0 ? '↘️' : '→';
      const color = diff > 0 ? colors.red : diff < 0 ? colors.green : colors.yellow;
      console.log(`  Baseline comparison: ${color}${symbol} ${filesize(Math.abs(diff))} (${this.results.baseline.percentChange.toFixed(2)}%)${colors.reset}`);
    }
    
    console.log('');

    // Size by type
    Object.entries(this.results.summary.filesByType).forEach(([type, info]) => {
      const utilization = this.results.summary.utilizationByType[type];
      const color = utilization.percentage > 90 ? colors.red : utilization.percentage > 70 ? colors.yellow : colors.green;
      console.log(`  ${type.toUpperCase()}: ${color}${info.totalSizeFormatted}${colors.reset} (${utilization.percentage}% of limit)`);
    });

    // Violations
    if (this.results.violations.length > 0) {
      console.log(`\n${colors.red}❌ Violations (${this.results.violations.length}):${colors.reset}`);
      this.results.violations.forEach(violation => {
        console.log(`  ${colors.red}•${colors.reset} ${violation.message}`);
      });
    }

    // Warnings
    if (this.results.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️  Warnings (${this.results.warnings.length}):${colors.reset}`);
      this.results.warnings.forEach(warning => {
        console.log(`  ${colors.yellow}•${colors.reset} ${warning.message}`);
      });
    }

    // Top files if verbose
    if (this.options.verbose) {
      console.log(`\n${colors.blue}📄 Largest files:${colors.reset}`);
      const topFiles = this.results.files
        .sort((a, b) => b.size - a.size)
        .slice(0, 10);
      
      topFiles.forEach(file => {
        console.log(`  ${file.path}: ${colors.cyan}${file.sizeFormatted}${colors.reset}`);
      });
    }

    // Success/failure message
    if (this.results.violations.length > 0) {
      console.log(`\n${colors.red}❌ Bundle size check failed with ${this.results.violations.length} violations${colors.reset}`);
    } else {
      console.log(`\n${colors.green}✅ Bundle size check passed${colors.reset}`);
    }

    console.log('');
  }

  /**
   * JSON output
   */
  async outputJSON() {
    const output = {
      timestamp: new Date().toISOString(),
      results: this.results,
      options: this.options
    };

    if (this.options.outputFile) {
      fs.writeFileSync(this.options.outputFile, JSON.stringify(output, null, 2));
    } else {
      console.log(JSON.stringify(output, null, 2));
    }
  }

  /**
   * GitHub Actions output
   */
  async outputGitHubActions() {
    // Set outputs for GitHub Actions
    console.log(`::set-output name=total-size::${this.results.totalSize}`);
    console.log(`::set-output name=violation-count::${this.results.violations.length}`);
    console.log(`::set-output name=warning-count::${this.results.warnings.length}`);
    
    if (this.results.baseline) {
      console.log(`::set-output name=size-change::${this.results.baseline.difference}`);
      console.log(`::set-output name=size-change-percent::${this.results.baseline.percentChange}`);
    }

    // Annotations for violations
    this.results.violations.forEach(violation => {
      console.log(`::error::${violation.message}`);
    });

    // Annotations for warnings
    this.results.warnings.forEach(warning => {
      console.log(`::warning::${warning.message}`);
    });

    // Summary for PR comment
    const summary = this.generateMarkdownSummary();
    console.log(`::set-output name=summary::${encodeURIComponent(summary)}`);
  }

  /**
   * Generate markdown summary for PR comments
   */
  generateMarkdownSummary() {
    let summary = `## 📦 Bundle Size Report\n\n`;
    
    summary += `**Total Size:** ${this.results.summary.totalSizeFormatted}\n`;
    summary += `**Files:** ${this.results.summary.totalFiles}\n\n`;

    if (this.results.baseline) {
      const diff = this.results.baseline.difference;
      const emoji = diff > 0 ? '📈' : diff < 0 ? '📉' : '📊';
      const sign = diff > 0 ? '+' : '';
      summary += `**Change:** ${emoji} ${sign}${filesize(diff)} (${this.results.baseline.percentChange.toFixed(2)}%)\n\n`;
    }

    summary += `### Size Breakdown\n\n`;
    summary += `| Type | Size | Utilization |\n`;
    summary += `|------|------|-------------|\n`;
    
    Object.entries(this.results.summary.filesByType).forEach(([type, info]) => {
      const utilization = this.results.summary.utilizationByType[type];
      const status = utilization.percentage > 90 ? '🔴' : utilization.percentage > 70 ? '🟡' : '🟢';
      summary += `| ${type.toUpperCase()} | ${info.totalSizeFormatted} | ${status} ${utilization.percentage}% |\n`;
    });

    if (this.results.violations.length > 0) {
      summary += `\n### ❌ Violations (${this.results.violations.length})\n\n`;
      this.results.violations.forEach(v => {
        summary += `- ${v.message}\n`;
      });
    }

    if (this.results.warnings.length > 0) {
      summary += `\n### ⚠️ Warnings (${this.results.warnings.length})\n\n`;
      this.results.warnings.forEach(w => {
        summary += `- ${w.message}\n`;
      });
    }

    return summary;
  }

  /**
   * Save baseline for future comparisons
   */
  async saveBaseline(filePath) {
    const baselineData = {
      timestamp: new Date().toISOString(),
      totalSize: this.results.totalSize,
      sizesByType: this.results.sizesByType,
      files: this.results.files.map(f => ({
        path: f.path,
        size: f.size,
        type: f.type
      }))
    };

    fs.writeFileSync(filePath, JSON.stringify(baselineData, null, 2));
    this.log(`💾 Baseline saved to: ${filePath}`);
  }

  /**
   * Utility methods
   */
  log(message) {
    if (this.options.verbose || this.options.outputFormat === 'console') {
      console.log(message);
    }
  }

  error(message) {
    console.error(`${colors.red}Error: ${message}${colors.reset}`);
  }

  /**
   * Exit with appropriate code
   */
  exit() {
    const hasViolations = this.results.violations.length > 0;
    
    if (this.options.failOnLimit && hasViolations) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const arg = args[i];
    const value = args[i + 1];

    switch (arg) {
      case '--path':
        options.path = value;
        break;
      case '--limit':
        options.limits = { ...options.limits, total: parseInt(value) };
        break;
      case '--js-limit':
        options.limits = { ...options.limits, js: parseInt(value) };
        break;
      case '--css-limit':
        options.limits = { ...options.limits, css: parseInt(value) };
        break;
      case '--format':
        options.outputFormat = value;
        break;
      case '--output':
        options.outputFile = value;
        break;
      case '--baseline':
        options.baseline = value;
        break;
      case '--save-baseline':
        options.saveBaseline = value;
        break;
      case '--fail-on-limit':
        options.failOnLimit = value !== 'false';
        break;
      case '--verbose':
        options.verbose = true;
        i--; // No value for this flag
        break;
    }
  }

  try {
    const checker = new BundleSizeChecker(options);
    await checker.analyze();
    await checker.outputResults();

    // Save baseline if requested
    if (options.saveBaseline) {
      await checker.saveBaseline(options.saveBaseline);
    }

    checker.exit();
  } catch (error) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run if called directly (ES module equivalent)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { BundleSizeChecker };
