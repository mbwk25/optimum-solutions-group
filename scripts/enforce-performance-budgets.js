#!/usr/bin/env node

/**
 * Performance Budget Enforcement Script
 * 
 * This script validates performance metrics against defined budgets
 * and fails the build if budgets are exceeded.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Load performance budgets configuration
 */
function loadBudgets() {
  try {
    const budgetsPath = path.join(process.cwd(), 'performance-budgets.json');
    if (!fs.existsSync(budgetsPath)) {
      console.log(`${colors.yellow}⚠️ No performance-budgets.json found${colors.reset}`);
      return null;
    }
    
    const budgets = JSON.parse(fs.readFileSync(budgetsPath, 'utf8'));
    console.log(`${colors.blue}📋 Loaded performance budgets (v${budgets.metadata.version})${colors.reset}`);
    return budgets;
  } catch (error) {
    console.error(`${colors.red}❌ Error loading performance budgets:${colors.reset}`, error.message);
    return null;
  }
}

/**
 * Load performance data from reports
 */
function loadPerformanceData() {
  const data = {};
  
  try {
    // Load Lighthouse data
    const lighthouseFiles = fs.readdirSync(process.cwd())
      .filter(file => file.includes('performance-report') && file.endsWith('.json'));
    
    if (lighthouseFiles.length > 0) {
      const lighthouseData = JSON.parse(fs.readFileSync(lighthouseFiles[0], 'utf8'));
      data.lighthouse = lighthouseData.scores || {};
      data.coreWebVitals = lighthouseData.metrics || {};
    }
    
    // Load bundle analysis data
    const bundleFiles = fs.readdirSync(process.cwd())
      .filter(file => file.includes('bundle-analyzer-report') && file.endsWith('.json'));
      
    if (bundleFiles.length > 0) {
      const bundleData = JSON.parse(fs.readFileSync(bundleFiles[0], 'utf8'));
      data.resources = {
        totalBundle: bundleData.totalSize || 0,
        initialBundle: bundleData.initialSize || 0
      };
    }
    
    console.log(`${colors.blue}📊 Loaded performance data${colors.reset}`);
    return data;
  } catch (error) {
    console.error(`${colors.red}❌ Error loading performance data:${colors.reset}`, error.message);
    return {};
  }
}

/**
 * Check if a value exceeds budget
 */
function checkBudget(value, budget, isMinimum = false) {
  if (typeof value !== 'number' || typeof budget !== 'object') {
    return { status: 'unknown', message: 'Invalid data' };
  }
  
  let threshold, target, status, message;
  
  if (isMinimum) {
    threshold = budget.min || 0;
    target = budget.target || threshold;
    
    if (value >= target) {
      status = 'excellent';
      message = `✅ ${value} (target: ${target})`;
    } else if (value >= threshold) {
      status = 'good';
      message = `⚠️ ${value} (min: ${threshold}, target: ${target})`;
    } else {
      status = 'fail';
      message = `❌ ${value} < ${threshold} (minimum required)`;
    }
  } else {
    threshold = budget.max || Infinity;
    target = budget.target || threshold;
    
    if (value <= target) {
      status = 'excellent';
      message = `✅ ${value}${budget.unit || ''} (target: ${target}${budget.unit || ''})`;
    } else if (value <= threshold) {
      status = 'good';
      message = `⚠️ ${value}${budget.unit || ''} (max: ${threshold}${budget.unit || ''})`;
    } else {
      status = 'fail';
      message = `❌ ${value}${budget.unit || ''} > ${threshold}${budget.unit || ''} (budget exceeded)`;
    }
  }
  
  return { status, message, value, threshold, target };
}

/**
 * Format file size in human-readable format
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate budget report
 */
function generateReport(budgets, performanceData, environment = 'production') {
  const report = {
    environment,
    timestamp: new Date().toISOString(),
    results: {
      lighthouse: {},
      coreWebVitals: {},
      resources: {},
      network: {}
    },
    summary: {
      total: 0,
      passed: 0,
      warnings: 0,
      failed: 0
    }
  };
  
  const envConfig = budgets.environments[environment] || budgets.environments.production;
  const multiplier = envConfig.multiplier || 1.0;
  
  console.log(`${colors.cyan}🎯 Performance Budget Analysis (${environment})${colors.reset}`);
  console.log(`${colors.cyan}📏 Environment multiplier: ${multiplier}${colors.reset}\n`);
  
  // Check Lighthouse scores
  if (budgets.budgets.lighthouse && performanceData.lighthouse) {
    console.log(`${colors.bright}🔍 Lighthouse Scores${colors.reset}`);
    
    Object.entries(budgets.budgets.lighthouse).forEach(([metric, budget]) => {
      const value = performanceData.lighthouse[metric];
      if (value !== undefined) {
        const adjustedBudget = {
          ...budget,
          min: Math.floor((budget.min || 0) * multiplier),
          target: Math.floor((budget.target || 0) * multiplier)
        };
        
        const result = checkBudget(value, adjustedBudget, true);
        report.results.lighthouse[metric] = result;
        report.summary.total++;
        
        console.log(`  ${metric}: ${result.message}`);
        
        if (result.status === 'fail') report.summary.failed++;
        else if (result.status === 'good') report.summary.warnings++;
        else report.summary.passed++;
      }
    });
    console.log();
  }
  
  // Check Core Web Vitals
  if (budgets.budgets.coreWebVitals && performanceData.coreWebVitals) {
    console.log(`${colors.bright}⚡ Core Web Vitals${colors.reset}`);
    
    Object.entries(budgets.budgets.coreWebVitals).forEach(([metric, budget]) => {
      const value = performanceData.coreWebVitals[metric];
      if (value !== undefined) {
        const adjustedBudget = {
          ...budget,
          max: Math.ceil((budget.max || Infinity) * multiplier),
          target: Math.ceil((budget.target || 0) * multiplier)
        };
        
        const result = checkBudget(value, adjustedBudget, false);
        report.results.coreWebVitals[metric] = result;
        report.summary.total++;
        
        console.log(`  ${metric.toUpperCase()}: ${result.message}`);
        
        if (result.status === 'fail') report.summary.failed++;
        else if (result.status === 'good') report.summary.warnings++;
        else report.summary.passed++;
      }
    });
    console.log();
  }
  
  // Check Resource budgets
  if (budgets.budgets.resources && performanceData.resources) {
    console.log(`${colors.bright}📦 Resource Budgets${colors.reset}`);
    
    Object.entries(budgets.budgets.resources).forEach(([metric, budget]) => {
      const value = performanceData.resources[metric];
      if (value !== undefined) {
        const adjustedBudget = {
          ...budget,
          max: Math.ceil((budget.max || Infinity) * multiplier),
          target: Math.ceil((budget.target || 0) * multiplier)
        };
        
        const result = checkBudget(value, adjustedBudget, false);
        report.results.resources[metric] = result;
        report.summary.total++;
        
        // Format message with human-readable sizes for bytes
        let displayMessage = result.message;
        if (budget.unit === 'bytes') {
          displayMessage = displayMessage
            .replace(/\d+bytes/g, (match) => formatSize(parseInt(match)))
            .replace(/\d+/g, (match) => formatSize(parseInt(match)));
        }
        
        console.log(`  ${metric}: ${displayMessage}`);
        
        if (result.status === 'fail') report.summary.failed++;
        else if (result.status === 'good') report.summary.warnings++;
        else report.summary.passed++;
      }
    });
    console.log();
  }
  
  return report;
}

/**
 * Generate budget report summary
 */
function printSummary(report) {
  const { passed, warnings, failed, total } = report.summary;
  
  console.log(`${colors.bright}📊 Budget Summary${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️ Warnings: ${warnings}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`📝 Total checks: ${total}\n`);
  
  // Overall status
  if (failed > 0) {
    console.log(`${colors.red}${colors.bright}❌ BUDGET EXCEEDED - Build should fail${colors.reset}`);
    return false;
  } else if (warnings > 0) {
    console.log(`${colors.yellow}${colors.bright}⚠️ BUDGET WARNINGS - Consider optimizing${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.green}${colors.bright}✅ ALL BUDGETS PASSED - Excellent performance!${colors.reset}`);
    return true;
  }
}

/**
 * Save report to file
 */
function saveReport(report) {
  try {
    const reportPath = path.join(process.cwd(), 'performance-budget-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`${colors.blue}💾 Budget report saved to: ${reportPath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Error saving report:${colors.reset}`, error.message);
  }
}

/**
 * Generate PR comment for budget results
 */
function generatePRComment(report) {
  const { passed, warnings, failed, total } = report.summary;
  
  let comment = `## 💰 Performance Budget Report\n\n`;
  comment += `**Environment:** ${report.environment}\n`;
  comment += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
  
  // Summary table
  comment += `### 📊 Summary\n\n`;
  comment += `| Status | Count |\n`;
  comment += `|--------|-------|\n`;
  comment += `| ✅ Passed | ${passed} |\n`;
  comment += `| ⚠️ Warnings | ${warnings} |\n`;
  comment += `| ❌ Failed | ${failed} |\n`;
  comment += `| **Total** | **${total}** |\n\n`;
  
  // Failed items
  if (failed > 0) {
    comment += `### ❌ Budget Violations\n\n`;
    Object.entries(report.results).forEach(([category, results]) => {
      Object.entries(results).forEach(([metric, result]) => {
        if (result.status === 'fail') {
          comment += `- **${category}.${metric}**: ${result.message}\n`;
        }
      });
    });
    comment += `\n`;
  }
  
  // Warnings
  if (warnings > 0) {
    comment += `### ⚠️ Performance Warnings\n\n`;
    Object.entries(report.results).forEach(([category, results]) => {
      Object.entries(results).forEach(([metric, result]) => {
        if (result.status === 'good') {
          comment += `- **${category}.${metric}**: ${result.message}\n`;
        }
      });
    });
    comment += `\n`;
  }
  
  // Overall result
  if (failed > 0) {
    comment += `### 🚫 Result: BUDGET EXCEEDED\n\n`;
    comment += `This PR exceeds performance budgets and should not be merged until issues are resolved.\n`;
  } else if (warnings > 0) {
    comment += `### ⚠️ Result: WARNINGS\n\n`;
    comment += `This PR has performance warnings. Consider optimizing before merging.\n`;
  } else {
    comment += `### ✅ Result: ALL BUDGETS PASSED\n\n`;
    comment += `Excellent! This PR meets all performance budgets.\n`;
  }
  
  // Save PR comment to file
  const commentPath = path.join(process.cwd(), 'pr-budget-comment.md');
  fs.writeFileSync(commentPath, comment);
  console.log(`${colors.blue}💬 PR comment saved to: ${commentPath}${colors.reset}`);
  
  return comment;
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.bright}${colors.magenta}💰 Performance Budget Enforcement${colors.reset}\n`);
  
  const budgets = loadBudgets();
  if (!budgets) {
    console.log(`${colors.yellow}⚠️ No budgets configured, skipping enforcement${colors.reset}`);
    process.exit(0);
  }
  
  const performanceData = loadPerformanceData();
  const environment = process.env.NODE_ENV || 'production';
  
  const report = generateReport(budgets, performanceData, environment);
  const passed = printSummary(report);
  
  // Save report and generate PR comment
  saveReport(report);
  generatePRComment(report);
  
  // Exit with appropriate code
  if (!passed && budgets.rules.failOn.budgetExceeded) {
    console.log(`${colors.red}🚫 Failing build due to budget violations${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ Build can proceed${colors.reset}`);
    process.exit(0);
  }
}

// Run the script
main();
