const { validateEnvironment } = require('./chrome-config');
const ServerManager = require('./server-manager');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Audit Runner with Retry Logic and Robust Error Handling
 * Integrates Chrome configuration, server management, and audit execution
 */

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const isDebug = process.env.DEBUG_AUDIT === 'true';

class AuditRunner {
  constructor(options = {}) {
    this.serverManager = new ServerManager();
    this.maxRetries = options.maxRetries || (isCI ? 3 : 2);
    this.retryDelay = options.retryDelay || 5000;
    this.auditTimeout = options.auditTimeout || (isCI ? 120000 : 60000);
    this.activeServer = null;
  }

  /**
   * Enhanced Lighthouse configuration for CI
   */
  getLighthouseConfig(categories = null) {
    const config = {
      extends: 'lighthouse:default',
      settings: {
        maxWaitForFcp: isCI ? 45000 : 15000,
        maxWaitForLoad: isCI ? 60000 : 45000,
        networkQuietThresholdMs: isCI ? 1000 : 1000,
        cpuQuietThresholdMs: isCI ? 1000 : 1000,
        pauseAfterFcpMs: isCI ? 2000 : 1000,
        pauseAfterLoadMs: isCI ? 2000 : 1000,
        networkUserAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        emulatedFormFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false
        },
        formFactor: 'desktop',
        onlyCategories: categories || ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: isCI ? [
          'uses-http2',
          'bf-cache',
          'largest-contentful-paint-element'
        ] : []
      }
    };

    if (isDebug) {
      console.log('🔧 Lighthouse Configuration:', JSON.stringify(config, null, 2));
    }

    return config;
  }

  /**
   * Enhanced Chrome flags for Lighthouse in CI
   */
  getChromeFlags() {
    const baseFlags = [
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

    if (isCI) {
      baseFlags.push(
        '--disable-dev-tools',
        '--disable-logging',
        '--disable-background-mode',
        '--disable-default-apps',
        '--disable-extensions-http-throttling'
      );
    }

    return baseFlags;
  }

  /**
   * Start server with comprehensive validation
   */
  async startServerWithValidation(preferredPort = null) {
    console.log('🏗️ Starting server with comprehensive validation...');
    
    try {
      // Start the best available server
      this.activeServer = await this.serverManager.startBestAvailableServer(preferredPort);
      
      // Validate environment thoroughly
      console.log('🔍 Validating environment...');
      const validation = await validateEnvironment(this.activeServer.url);
      
      if (!validation.success) {
        throw new Error(`Environment validation failed: ${validation.error}`);
      }

      console.log('✅ Server started and validated successfully');
      return this.activeServer;
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Run Lighthouse audit with retry logic
   */
  async runLighthouseAudit(url, options = {}) {
    const config = this.getLighthouseConfig(options.categories);
    const chromeFlags = this.getChromeFlags();
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      console.log(`🔍 Running Lighthouse audit (attempt ${attempt}/${this.maxRetries})`);
      
      try {
        // Pre-audit validation to ensure everything is ready
        if (attempt === 1 || attempt > 2) {
          console.log('🌐 Pre-audit validation...');
          const validation = await validateEnvironment(url);
          
          if (!validation.success) {
            throw new Error(`Pre-audit validation failed: ${validation.error}`);
          }
        }

        const result = await lighthouse(url, {
          logLevel: isDebug ? 'info' : 'error',
          output: 'json',
          chromeFlags,
          port: undefined, // Let Lighthouse manage Chrome
          disableStorageReset: false,
          clearStorageTypes: ['cookies', 'websql', 'indexeddb', 'localstorage', 'sessionstorage', 'cachestorage']
        }, config);

        if (!result || !result.lhr) {
          throw new Error('Lighthouse returned invalid results');
        }

        // Validate the audit results
        const lhr = result.lhr;
        if (lhr.runtimeError && lhr.runtimeError.code === 'NO_FCP') {
          throw new Error('NO_FCP: Page did not paint any content - this usually indicates rendering issues');
        }

        console.log('✅ Lighthouse audit completed successfully');
        return result;

      } catch (error) {
        console.log(`❌ Lighthouse audit attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.maxRetries) {
          throw new Error(`Lighthouse audit failed after ${this.maxRetries} attempts: ${error.message}`);
        }
        
        // Progressive retry strategy
        const delayMs = this.retryDelay * attempt;
        console.log(`⏳ Waiting ${delayMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        // For NO_FCP errors, try to restart server on final attempts
        if (error.message.includes('NO_FCP') && attempt >= 2) {
          console.log('🔄 Attempting server restart due to NO_FCP error...');
          try {
            await this.serverManager.stopAllServers();
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.activeServer = await this.serverManager.startBestAvailableServer();
            url = this.activeServer.url;
          } catch (restartError) {
            console.log('⚠️ Server restart failed:', restartError.message);
          }
        }
      }
    }
  }

  /**
   * Run custom performance benchmark
   */
  async runCustomPerformanceBench(url, runs = 1) {
    console.log(`🚀 Running custom performance benchmark (${runs} runs)`);
    
    const results = [];
    
    for (let run = 1; run <= runs; run++) {
      console.log(`📊 Performance run ${run}/${runs}`);
      
      try {
        const result = await this.runLighthouseAudit(url, {
          categories: ['performance']
        });
        
        const lhr = result.lhr;
        const metrics = {
          performance: Math.round(lhr.categories.performance.score * 100),
          fcp: lhr.audits['first-contentful-paint']?.displayValue || 'N/A',
          lcp: lhr.audits['largest-contentful-paint']?.displayValue || 'N/A',
          tbt: lhr.audits['total-blocking-time']?.displayValue || 'N/A',
          cls: lhr.audits['cumulative-layout-shift']?.displayValue || 'N/A',
          si: lhr.audits['speed-index']?.displayValue || 'N/A'
        };
        
        results.push(metrics);
        console.log(`✅ Run ${run} completed:`, metrics);
        
      } catch (error) {
        console.log(`❌ Performance run ${run} failed:`, error.message);
        results.push({ error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Run comprehensive SEO audit
   */
  async runSEOAudit(url) {
    console.log('🔍 Running comprehensive SEO audit...');
    
    try {
      const result = await this.runLighthouseAudit(url, {
        categories: ['seo', 'accessibility', 'best-practices']
      });
      
      const lhr = result.lhr;
      const scores = {
        seo: Math.round(lhr.categories.seo.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100)
      };
      
      console.log('✅ SEO audit completed:', scores);
      return { scores, fullReport: result };
      
    } catch (error) {
      console.log('❌ SEO audit failed:', error.message);
      throw error;
    }
  }

  /**
   * Save audit results
   */
  async saveResults(results, outputPath) {
    try {
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      console.log('💾 Results saved to:', outputPath);
    } catch (error) {
      console.log('⚠️ Failed to save results:', error.message);
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    console.log('🧹 Cleaning up resources...');
    
    try {
      await this.serverManager.stopAllServers();
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.log('⚠️ Cleanup error:', error.message);
    }
  }
}

// CLI usage
if (require.main === module) {
  const auditType = process.argv[2] || 'performance';
  const url = process.argv[3];
  const outputPath = process.argv[4] || 'audit-results.json';
  
  const runner = new AuditRunner();
  
  // Handle process termination
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, cleaning up...');
    await runner.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, cleaning up...');
    await runner.cleanup();
    process.exit(0);
  });

  async function main() {
    try {
      let serverUrl = url;
      
      // If no URL provided, start local server
      if (!serverUrl) {
        const server = await runner.startServerWithValidation();
        serverUrl = server.url;
      }
      
      let results;
      
      switch (auditType) {
        case 'performance':
          results = await runner.runCustomPerformanceBench(serverUrl, 3);
          break;
        case 'seo':
          results = await runner.runSEOAudit(serverUrl);
          break;
        case 'lighthouse':
          results = await runner.runLighthouseAudit(serverUrl);
          break;
        default:
          throw new Error(`Unknown audit type: ${auditType}`);
      }
      
      await runner.saveResults(results, outputPath);
      console.log('🎉 Audit completed successfully!');
      
    } catch (error) {
      console.error('💥 Audit failed:', error.message);
      process.exit(1);
    } finally {
      await runner.cleanup();
    }
  }

  main();
}

module.exports = AuditRunner;
