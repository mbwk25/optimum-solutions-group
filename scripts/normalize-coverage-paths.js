#!/usr/bin/env node

/**
 * Coverage Path Normalization Script
 * 
 * This script normalizes absolute Windows paths in coverage/clover.xml to use
 * repo-relative paths, preventing workstation details from leaking into diffs.
 * 
 * Usage:
 *   node scripts/normalize-coverage-paths.js [input-file] [output-file]
 * 
 * If no arguments provided, defaults to:
 *   input:  coverage/clover.xml
 *   output: coverage/clover.xml (in-place)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DEFAULT_INPUT_FILE = 'coverage/clover.xml';
const DEFAULT_OUTPUT_FILE = 'coverage/clover.xml';

// Windows absolute path pattern to match
const WINDOWS_ABSOLUTE_PATH_REGEX = /path="C:\\([^"]*?)\\optimum-solutions-group\\([^"]*)"/g;

// Alternative patterns for different path formats
const ALTERNATIVE_PATTERNS = [
  // Handle forward slashes in paths
  /path="C:\/([^"]*?)\/optimum-solutions-group\/([^"]*)"/g,
  // Handle mixed separators
  /path="C:\\([^"]*?)\/optimum-solutions-group\/([^"]*)"/g,
  /path="C:\/([^"]*?)\\optimum-solutions-group\\([^"]*)"/g,
];

/**
 * Normalize a Windows absolute path to a repo-relative path
 * @param {string} match - The full match from the regex
 * @param {string} prefix - The part before optimum-solutions-group
 * @param {string} relativePath - The part after optimum-solutions-group
 * @returns {string} - The normalized path attribute
 */
function normalizePath(match, prefix, relativePath) {
  // Convert backslashes to forward slashes for consistency
  const normalizedRelativePath = relativePath.replace(/\\/g, '/');
  
  // Return the normalized path attribute
  return `path="${normalizedRelativePath}"`;
}

/**
 * Process the clover.xml content to normalize all Windows absolute paths
 * @param {string} content - The XML content to process
 * @returns {string} - The processed content with normalized paths
 */
function normalizeCloverXml(content) {
  let processedContent = content;
  
  // Apply the main Windows absolute path pattern
  processedContent = processedContent.replace(WINDOWS_ABSOLUTE_PATH_REGEX, normalizePath);
  
  // Apply alternative patterns for different path formats
  ALTERNATIVE_PATTERNS.forEach(pattern => {
    processedContent = processedContent.replace(pattern, normalizePath);
  });
  
  return processedContent;
}

/**
 * Main function to process the coverage file
 */
function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || DEFAULT_INPUT_FILE;
  const outputFile = args[1] || DEFAULT_OUTPUT_FILE;
  
  console.log(`🔧 Normalizing coverage paths...`);
  console.log(`📁 Input file: ${inputFile}`);
  console.log(`📁 Output file: ${outputFile}`);
  
  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: Input file '${inputFile}' does not exist`);
    process.exit(1);
  }
  
  try {
    // Read the input file
    console.log(`📖 Reading ${inputFile}...`);
    const content = fs.readFileSync(inputFile, 'utf8');
    
    // Count original absolute paths
    const originalMatches = content.match(WINDOWS_ABSOLUTE_PATH_REGEX) || [];
    const alternativeMatches = ALTERNATIVE_PATTERNS.reduce((count, pattern) => {
      const matches = content.match(pattern) || [];
      return count + matches.length;
    }, 0);
    const totalOriginalPaths = originalMatches.length + alternativeMatches;
    
    console.log(`🔍 Found ${totalOriginalPaths} absolute Windows paths to normalize`);
    
    if (totalOriginalPaths === 0) {
      console.log(`✅ No absolute Windows paths found - file is already normalized`);
      return;
    }
    
    // Normalize the content
    console.log(`🔄 Normalizing paths...`);
    const normalizedContent = normalizeCloverXml(content);
    
    // Count normalized paths
    const normalizedMatches = normalizedContent.match(/path="[^C:][^"]*"/g) || [];
    console.log(`✅ Normalized ${normalizedMatches.length} paths`);
    
    // Write the output file
    console.log(`💾 Writing to ${outputFile}...`);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, normalizedContent, 'utf8');
    
    console.log(`✅ Successfully normalized coverage paths!`);
    console.log(`📊 Summary:`);
    console.log(`   - Original absolute paths: ${totalOriginalPaths}`);
    console.log(`   - Normalized paths: ${normalizedMatches.length}`);
    console.log(`   - Output file: ${outputFile}`);
    
  } catch (error) {
    console.error(`❌ Error processing file: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();

export {
  normalizeCloverXml,
  normalizePath,
  WINDOWS_ABSOLUTE_PATH_REGEX,
  ALTERNATIVE_PATTERNS
};
