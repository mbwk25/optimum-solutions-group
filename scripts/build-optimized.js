#!/usr/bin/env node

/**
 * Advanced build script with optimization checks
 * This script builds the app with production optimizations and checks for performance issues
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { filesize } from 'filesize';
import chalk from 'chalk';
import ora from 'ora';

const spinner = ora('Starting optimized build...').start();

try {
  // Set environment for production
  process.env.NODE_ENV = 'production';
  
  // Clean dist directory
  spinner.text = 'Cleaning previous build...';
  try {
    execSync('rm -rf dist', { stdio: 'pipe' });
  } catch (e) {
    // Directory might not exist, continue
  }
  
  // Build with production config
  spinner.text = 'Building with production optimizations...';
  execSync('vite build --mode production', { 
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Analyze bundle size
  spinner.text = 'Analyzing bundle size...';
  
  const distPath = './dist';
  if (!existsSync(distPath)) {
    throw new Error('Build failed - dist directory not found');
  }
  
  // Get build stats
  const jsFiles = execSync('find dist -name "*.js" -type f', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
    
  const cssFiles = execSync('find dist -name "*.css" -type f', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
    
  const imageFiles = execSync('find dist -name "*.{jpg,jpeg,png,webp,avif,svg}" -type f', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  let totalJSSize = 0;
  let totalCSSSize = 0;
  let totalImageSize = 0;
  
  // Calculate sizes
  jsFiles.forEach(file => {
    try {
      const stats = execSync(`stat -c%s "${file}"`, { encoding: 'utf8' }).trim();
      totalJSSize += parseInt(stats);
    } catch (e) {
      // Skip if file doesn't exist
    }
  });
  
  cssFiles.forEach(file => {
    try {
      const stats = execSync(`stat -c%s "${file}"`, { encoding: 'utf8' }).trim();
      totalCSSSize += parseInt(stats);
    } catch (e) {
      // Skip if file doesn't exist
    }
  });
  
  imageFiles.forEach(file => {
    try {
      const stats = execSync(`stat -c%s "${file}"`, { encoding: 'utf8' }).trim();
      totalImageSize += parseInt(stats);
    } catch (e) {
      // Skip if file doesn't exist
    }
  });
  
  const totalSize = totalJSSize + totalCSSSize + totalImageSize;
  
  spinner.succeed('Build completed successfully!');
  
  // Output results
  console.log('\n' + chalk.bold.green('📊 Build Analysis:'));
  console.log(chalk.gray('─'.repeat(50)));
  
  console.log(`${chalk.blue('JavaScript:')} ${filesize(totalJSSize)}`);
  console.log(`${chalk.green('CSS:')} ${filesize(totalCSSSize)}`);
  console.log(`${chalk.yellow('Images:')} ${filesize(totalImageSize)}`);
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`${chalk.bold('Total:')} ${filesize(totalSize)}`);
  
  // Performance recommendations
  console.log('\n' + chalk.bold.blue('💡 Performance Tips:'));
  
  if (totalJSSize > 500000) {
    console.log(chalk.yellow('⚠️  JavaScript bundle is large. Consider code splitting.'));
  }
  
  if (totalCSSSize > 100000) {
    console.log(chalk.yellow('⚠️  CSS bundle is large. Consider purging unused styles.'));
  }
  
  if (totalImageSize > 2000000) {
    console.log(chalk.yellow('⚠️  Images are large. Consider WebP/AVIF formats.'));
  }
  
  if (jsFiles.length > 20) {
    console.log(chalk.yellow('⚠️  Many JS chunks. Consider bundling strategy.'));
  }
  
  console.log(chalk.green('✅ Build optimized and ready for deployment!'));
  
} catch (error) {
  spinner.fail('Build failed');
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
}
