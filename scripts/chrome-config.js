const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Chrome Configuration and Debugging Utility for CI environments
 * Handles NO_FCP and rendering issues in GitHub Actions
 */

// CI-optimized Chrome flags for headless rendering
const CI_CHROME_FLAGS = [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-features=TranslateUI',
  '--disable-web-security',
  '--disable-features=VizDisplayCompositor',
  '--run-all-compositor-stages-before-draw',
  '--disable-extensions',
  '--disable-plugins',
  '--disable-default-apps',
  '--disable-background-networking',
  '--disable-sync',
  '--metrics-recording-only',
  '--no-first-run',
  '--safebrowsing-disable-auto-update',
  '--disable-component-update',
  '--disable-domain-reliability',
  '--disable-client-side-phishing-detection',
  '--disable-hang-monitor',
  '--disable-popup-blocking',
  '--disable-prompt-on-repost',
  '--disable-component-extensions-with-background-pages',
  '--disable-ipc-flooding-protection',
  '--enable-automation',
  '--password-store=basic',
  '--use-mock-keychain',
  '--window-size=1920,1080',
  '--viewport=1920x1080',
  '--force-device-scale-factor=1',
  '--hide-scrollbars',
  '--mute-audio',
  '--autoplay-policy=no-user-gesture-required'
];

// Environment detection
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const isDebug = process.env.DEBUG_CHROME === 'true';

/**
 * Enhanced Chrome launcher with debugging
 */
async function launchChrome(options = {}) {
  const config = {
    headless: isCI ? 'new' : (options.headless !== false),
    args: isCI ? CI_CHROME_FLAGS : [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      ...(options.args || [])
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true
    },
    ignoreHTTPSErrors: true,
    ...options
  };

  if (isDebug) {
    console.log('🔍 Chrome Configuration:', JSON.stringify(config, null, 2));
  }

  try {
    const browser = await puppeteer.launch(config);
    
    if (isDebug) {
      console.log('✅ Chrome launched successfully');
      const version = await browser.version();
      console.log('📋 Chrome version:', version);
    }

    return browser;
  } catch (error) {
    console.error('❌ Failed to launch Chrome:', error.message);
    throw error;
  }
}

/**
 * Validate page rendering and content
 */
async function validatePageRendering(url, timeout = 30000) {
  const browser = await launchChrome();
  
  try {
    const page = await browser.newPage();
    
    // Set longer timeout for CI environments
    page.setDefaultNavigationTimeout(timeout);
    page.setDefaultTimeout(timeout);
    
    if (isDebug) {
      // Enable console logging from the page
      page.on('console', msg => console.log('📄 Page Console:', msg.text()));
      page.on('pageerror', error => console.error('📄 Page Error:', error.message));
      page.on('requestfailed', request => 
        console.error('📄 Request Failed:', request.url(), request.failure()?.errorText)
      );
    }

    console.log('🌐 Navigating to:', url);
    
    // Navigate with network idle strategy
    await page.goto(url, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout 
    });

    if (isDebug) {
      console.log('✅ Navigation completed');
    }

    // Wait for potential dynamic content
    await page.waitForTimeout(2000);

    // Check for basic content rendering
    const checks = await page.evaluate(() => {
      const body = document.body;
      const hasContent = body && body.textContent.trim().length > 0;
      const hasVisibleElements = document.querySelectorAll('*').length > 10;
      const hasImages = document.querySelectorAll('img').length > 0;
      const hasStyles = document.querySelectorAll('style, link[rel="stylesheet"]').length > 0;
      
      return {
        hasBody: !!body,
        hasContent,
        hasVisibleElements,
        hasImages,
        hasStyles,
        bodyText: body ? body.textContent.trim().substring(0, 200) + '...' : '',
        elementCount: document.querySelectorAll('*').length,
        title: document.title
      };
    });

    console.log('📊 Page validation results:', JSON.stringify(checks, null, 2));

    // Determine if page rendered successfully
    const isValid = checks.hasBody && checks.hasContent && checks.hasVisibleElements;
    
    if (!isValid) {
      throw new Error(`Page failed to render properly: ${JSON.stringify(checks)}`);
    }

    if (isDebug) {
      // Take a screenshot for debugging
      const screenshotPath = path.join(process.cwd(), 'debug-screenshot.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log('📸 Screenshot saved:', screenshotPath);
    }

    return {
      success: true,
      checks,
      message: 'Page rendered successfully'
    };

  } finally {
    await browser.close();
  }
}

/**
 * Test server response and basic connectivity
 */
async function testServerResponse(url, maxRetries = 5, retryDelay = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 Testing server response (attempt ${attempt}/${maxRetries}): ${url}`);
      
      // Use node's built-in fetch if available, otherwise use a simple HTTP check
      const response = await fetch(url);
      const text = await response.text();
      
      if (response.ok && text.length > 0) {
        console.log(`✅ Server responding (${response.status}), content length: ${text.length}`);
        return { success: true, status: response.status, contentLength: text.length };
      } else {
        throw new Error(`Server returned ${response.status}, content length: ${text.length}`);
      }
    } catch (error) {
      console.log(`⚠️ Server test attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Server failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

/**
 * Main validation function combining server and rendering checks
 */
async function validateEnvironment(url) {
  console.log('🚀 Starting environment validation...');
  
  try {
    // Step 1: Test server connectivity
    console.log('📡 Step 1: Testing server connectivity...');
    await testServerResponse(url);
    
    // Step 2: Test page rendering
    console.log('🎨 Step 2: Testing page rendering...');
    const renderResult = await validatePageRendering(url);
    
    console.log('✅ Environment validation completed successfully');
    return {
      success: true,
      server: { responding: true },
      rendering: renderResult,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// CLI usage
if (require.main === module) {
  const url = process.argv[2] || 'http://localhost:4173';
  
  validateEnvironment(url)
    .then(result => {
      console.log('\n📋 Final Result:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = {
  launchChrome,
  validatePageRendering,
  testServerResponse,
  validateEnvironment,
  CI_CHROME_FLAGS,
  isCI
};
