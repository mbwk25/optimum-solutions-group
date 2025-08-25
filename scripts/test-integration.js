#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests the integration between chrome-config.js and server-manager.js
 * to ensure they work properly in CI environments
 */

import { validateEnvironment } from './chrome-config.js';
import ServerManager from './server-manager.js';

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

async function testIntegration() {
  console.log('🧪 Starting integration test...');
  console.log(`🔧 Environment: ${isCI ? 'CI' : 'Local'}`);
  
  const serverManager = new ServerManager();
  let testServer = null;
  
  try {
    // Step 1: Start a test server
    console.log('🏗️ Step 1: Starting test server...');
    testServer = await serverManager.startBestAvailableServer(8080);
    console.log(`✅ Test server started: ${testServer.url}`);
    
    // Step 2: Wait for server to be ready
    console.log('⏳ Step 2: Waiting for server stability...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Test chrome-config validation
    console.log('🔍 Step 3: Testing chrome configuration and validation...');
    const validationResult = await validateEnvironment(testServer.url);
    
    if (validationResult.success) {
      console.log('✅ Integration test PASSED');
      console.log('📊 Results:', JSON.stringify(validationResult, null, 2));
      return true;
    } else {
      console.log('❌ Integration test FAILED');
      console.log('📊 Results:', JSON.stringify(validationResult, null, 2));
      return false;
    }
    
  } catch (error) {
    console.error('💥 Integration test ERROR:', error.message);
    return false;
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up test resources...');
    if (testServer) {
      await serverManager.stopAllServers();
    }
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testIntegration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test runner error:', error);
      process.exit(1);
    });
}

export default testIntegration;
