#!/usr/bin/env node

/**
 * Script to run accessibility tests with enhanced error handling and stability
 */

import { spawn } from 'child_process';

console.log('🚀 Starting Accessibility Tests...\n');

// Configuration
const config = {
  maxRetries: 2,
  timeout: 300000, // 5 minutes
};

// Function to run accessibility tests using start-server-and-test
function runAccessibilityTests(retryCount = 0) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Attempt ${retryCount + 1} of ${config.maxRetries + 1}`);
    
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const testProcess = spawn(npmCmd, [
      'run',
      'test:cypress:accessibility'
    ], {
      stdio: 'inherit',
      timeout: config.timeout,
      env: {
        ...process.env,
        CYPRESS_A11Y_STRICT: 'false',
        CYPRESS_VIDEO: 'false',
        CYPRESS_SCREENSHOT_ON_RUN_FAILURE: 'true'
      }
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Accessibility tests passed!');
        resolve();
      } else if (retryCount < config.maxRetries) {
        console.log(`\n⚠️  Test attempt ${retryCount + 1} failed. Retrying...`);
        setTimeout(() => {
          runAccessibilityTests(retryCount + 1)
            .then(resolve)
            .catch(reject);
        }, 2000); // Wait 2 seconds before retry
      } else {
        console.log('\n❌ All test attempts failed.');
        reject(new Error(`Accessibility tests failed after ${config.maxRetries + 1} attempts`));
      }
    });

    testProcess.on('error', (error) => {
      console.error('❌ Failed to start tests:', error.message);
      reject(error);
    });
  });
}

// Main execution
async function main() {
  try {
    console.log('🔍 Running accessibility tests...');
    
    // Run the tests using the existing start-server-and-test setup
    await runAccessibilityTests();
    
    console.log('\n🎉 Accessibility testing completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Accessibility testing failed:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Accessibility testing interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Accessibility testing terminated');
  process.exit(0);
});

// Run the script
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
