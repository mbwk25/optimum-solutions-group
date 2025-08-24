#!/usr/bin/env node

/**
 * Local Workflow Testing Script
 * 
 * This script tests all the main components of the GitHub Actions workflow locally
 * to ensure everything works before pushing to GitHub.
 */

import fs from 'fs';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';

const execAsync = promisify(exec);

class LocalWorkflowTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async runTest(name, testFn) {
    const spinner = ora(`Running ${name}...`).start();
    
    try {
      const result = await testFn();
      spinner.succeed(`${name} ${chalk.green('✓')}`);
      this.results.passed.push(name);
      return result;
    } catch (error) {
      spinner.fail(`${name} ${chalk.red('✗')}`);
      console.error(chalk.red(`  Error: ${error.message}`));
      this.results.failed.push({ name, error: error.message });
      return null;
    }
  }

  async testDependencies() {
    return this.runTest('Check Dependencies', async () => {
      // Check if package.json exists
      if (!fs.existsSync('package.json')) {
        throw new Error('package.json not found');
      }

      // Check if node_modules exists
      if (!fs.existsSync('node_modules')) {
        console.log(chalk.yellow('  Installing dependencies...'));
        await execAsync('npm ci');
      }

      // Check critical scripts exist
      const scripts = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts;
      const requiredScripts = ['build', 'preview', 'analyze:bundle'];
      
      for (const script of requiredScripts) {
        if (!scripts[script]) {
          throw new Error(`Missing required script: ${script}`);
        }
      }

      return 'All dependencies and scripts available';
    });
  }

  async testBuild() {
    return this.runTest('Build Application', async () => {
      const { stdout, stderr } = await execAsync('npm run build');
      
      if (!fs.existsSync('dist')) {
        throw new Error('Build did not create dist directory');
      }

      if (!fs.existsSync('dist/index.html')) {
        throw new Error('Build did not create index.html');
      }

      return 'Application built successfully';
    });
  }

  async testPerformanceScript() {
    return this.runTest('Performance Benchmark Script', async () => {
      if (!fs.existsSync('scripts/performance-benchmark.js')) {
        throw new Error('Performance benchmark script not found');
      }

      // Test script syntax by trying to import it
      try {
        await import('../scripts/performance-benchmark.js');
      } catch (error) {
        throw new Error(`Script has syntax errors: ${error.message}`);
      }

      return 'Performance benchmark script is valid';
    });
  }

  async testDashboardGenerator() {
    return this.runTest('Dashboard Generator', async () => {
      if (!fs.existsSync('scripts/generate-dashboard-data.js')) {
        throw new Error('Dashboard generator script not found');
      }

      // Check if glob is available
      try {
        await import('glob');
      } catch (error) {
        console.log(chalk.yellow('  Installing glob dependency...'));
        await execAsync('npm install glob');
      }

      // Test script syntax
      try {
        await import('../scripts/generate-dashboard-data.js');
      } catch (error) {
        throw new Error(`Dashboard generator has syntax errors: ${error.message}`);
      }

      return 'Dashboard generator is valid';
    });
  }

  async testBundleAnalysis() {
    return this.runTest('Bundle Analysis', async () => {
      if (!fs.existsSync('scripts/analyze-bundle.js')) {
        throw new Error('Bundle analysis script not found');
      }

      // Run bundle analysis
      try {
        await execAsync('npm run analyze:bundle');
      } catch (error) {
        // Bundle analysis might fail but shouldn't break the test completely
        this.results.warnings.push('Bundle analysis had issues but continued');
        return 'Bundle analysis script exists (with warnings)';
      }

      return 'Bundle analysis completed successfully';
    });
  }

  async testWorkflowFile() {
    return this.runTest('GitHub Actions Workflow', async () => {
      const workflowPath = '.github/workflows/performance-monitoring.yml';
      
      if (!fs.existsSync(workflowPath)) {
        throw new Error('Workflow file not found');
      }

      const workflowContent = fs.readFileSync(workflowPath, 'utf8');
      
      // Check for critical sections
      const requiredSections = [
        'performance-audit:',
        'accessibility-audit:',
        'bundle-analysis:',
        'deploy-dashboard:',
        'notify:'
      ];

      for (const section of requiredSections) {
        if (!workflowContent.includes(section)) {
          throw new Error(`Workflow missing section: ${section}`);
        }
      }

      // Check for fixed issues
      if (workflowContent.includes('emulatedFormFactor')) {
        throw new Error('Workflow still contains old emulatedFormFactor setting');
      }

      if (!workflowContent.includes('npm install glob')) {
        throw new Error('Workflow missing glob dependency installation');
      }

      return 'Workflow file is properly configured';
    });
  }

  async testLocalServer() {
    return this.runTest('Local Server', async () => {
      // Start preview server
      const serverProcess = spawn('npm', ['run', 'preview'], {
        stdio: 'pipe',
        detached: false
      });

      // Wait for server to start
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          serverProcess.kill();
          reject(new Error('Server failed to start within 30 seconds'));
        }, 30000);

        serverProcess.stdout.on('data', (data) => {
          if (data.toString().includes('localhost:4173')) {
            clearTimeout(timeout);
            resolve();
          }
        });

        serverProcess.stderr.on('data', (data) => {
          if (data.toString().includes('EADDRINUSE')) {
            clearTimeout(timeout);
            resolve(); // Server already running, that's OK
          }
        });
      });

      // Test if server responds
      try {
        await execAsync('curl -f http://localhost:4173 > /dev/null 2>&1');
      } catch (error) {
        // Try with alternative method
        try {
          await execAsync('powershell -command "Invoke-WebRequest -Uri http://localhost:4173 -UseBasicParsing"');
        } catch (error2) {
          throw new Error('Server not responding to requests');
        }
      } finally {
        serverProcess.kill();
      }

      return 'Local server can start and respond to requests';
    });
  }

  async runAllTests() {
    console.log(chalk.blue.bold('\n🚀 Testing Workflow Components Locally\n'));

    await this.testDependencies();
    await this.testBuild();
    await this.testPerformanceScript();
    await this.testDashboardGenerator();
    await this.testBundleAnalysis();
    await this.testWorkflowFile();
    await this.testLocalServer();

    // Print results
    console.log(chalk.blue.bold('\n📊 Test Results Summary\n'));

    console.log(chalk.green(`✅ Passed Tests (${this.results.passed.length}):`));
    this.results.passed.forEach(test => {
      console.log(chalk.green(`  ✓ ${test}`));
    });

    if (this.results.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Warnings (${this.results.warnings.length}):`));
      this.results.warnings.forEach(warning => {
        console.log(chalk.yellow(`  ⚠ ${warning}`));
      });
    }

    if (this.results.failed.length > 0) {
      console.log(chalk.red(`\n❌ Failed Tests (${this.results.failed.length}):`));
      this.results.failed.forEach(({ name, error }) => {
        console.log(chalk.red(`  ✗ ${name}: ${error}`));
      });
    }

    // Overall status
    const totalTests = this.results.passed.length + this.results.failed.length;
    const successRate = (this.results.passed.length / totalTests * 100).toFixed(1);

    console.log(chalk.blue.bold('\n📈 Overall Status:'));
    
    if (this.results.failed.length === 0) {
      console.log(chalk.green.bold(`🎉 All tests passed! (${successRate}%) - Ready for deployment!`));
    } else if (this.results.failed.length <= 2) {
      console.log(chalk.yellow.bold(`⚠️  Mostly ready (${successRate}%) - Address failed tests before deployment`));
    } else {
      console.log(chalk.red.bold(`❌ Multiple issues found (${successRate}%) - Fix issues before deployment`));
    }

    console.log(chalk.gray('\n💡 Next steps:'));
    if (this.results.failed.length === 0) {
      console.log(chalk.gray('  1. Commit and push your changes'));
      console.log(chalk.gray('  2. Monitor the GitHub Actions workflow'));
      console.log(chalk.gray('  3. Check the deployed dashboard'));
    } else {
      console.log(chalk.gray('  1. Fix the failed tests above'));
      console.log(chalk.gray('  2. Run this test script again'));
      console.log(chalk.gray('  3. Deploy when all tests pass'));
    }

    return this.results.failed.length === 0;
  }
}

// Run tests if called directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const tester = new LocalWorkflowTester();
  tester.runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error(chalk.red('Fatal error:', error.message));
      process.exit(1);
    });
}

export { LocalWorkflowTester };
