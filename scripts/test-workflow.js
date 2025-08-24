#!/usr/bin/env node

/**
 * Test Workflow Components
 * 
 * Tests the main components of the GitHub Actions workflow locally
 * to ensure they work before pushing to trigger CI/CD.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';

const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✅'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠️'), msg),
  error: (msg) => console.log(chalk.red('❌'), msg),
  step: (msg) => console.log(chalk.cyan('\n🔄'), chalk.bold(msg))
};

class WorkflowTester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject({ stdout, stderr, code });
        }
      });
    });
  }

  async testStep(name, testFn) {
    log.step(`Testing: ${name}`);
    try {
      await testFn();
      log.success(`${name} - PASSED`);
      this.passed++;
    } catch (error) {
      log.error(`${name} - FAILED`);
      if (error.message) {
        console.log(chalk.red('   Error:'), error.message);
      }
      if (error.stdout) {
        console.log(chalk.gray('   Output:'), error.stdout.trim());
      }
      if (error.stderr) {
        console.log(chalk.red('   Error output:'), error.stderr.trim());
      }
      this.failed++;
    }
  }

  async run() {
    log.info('Starting GitHub Actions workflow component tests...\n');

    // Test 1: Dependencies installation
    await this.testStep('Dependencies Installation', async () => {
      const result = await this.runCommand('npm', ['list', '--depth=0']);
      if (!result.stdout.includes('glob@')) {
        throw new Error('glob dependency not found in dependencies');
      }
    });

    // Test 2: Build process
    await this.testStep('Build Process', async () => {
      await this.runCommand('npm', ['run', 'build']);
      if (!fs.existsSync('./dist')) {
        throw new Error('Build output directory not found');
      }
    });

    // Test 3: Bundle analyzer
    await this.testStep('Bundle Analyzer', async () => {
      const result = await this.runCommand('npm', ['run', 'bundle:analyze']);
      
      // Check if required files are generated
      if (!fs.existsSync('./bundle-analyzer-report.json')) {
        throw new Error('Bundle analyzer report not generated');
      }
      
      if (!fs.existsSync('./dist/stats.html')) {
        throw new Error('Bundle analyzer HTML report not generated');
      }

      // Validate JSON structure
      const report = JSON.parse(fs.readFileSync('./bundle-analyzer-report.json', 'utf8'));
      if (!report.summary || !report.assets) {
        throw new Error('Bundle analyzer report has invalid structure');
      }

      log.info(`   Bundle analysis: ${report.assets.length} assets, ${report.summary.totalSizeFormatted} total`);
    });

    // Test 4: Dashboard data generator (with mock data)
    await this.testStep('Dashboard Data Generator', async () => {
      // Create minimal test data
      const testDir = './test-reports';
      const testData = {
        timestamp: new Date().toISOString(),
        scores: { performance: 85, accessibility: 95 },
        metrics: { lcp: 1500, cls: 0.05 }
      };

      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      fs.writeFileSync(`${testDir}/performance-report.json`, JSON.stringify(testData));

      try {
        await this.runCommand('node', [
          'scripts/generate-dashboard-data.js',
          '--performance', `${testDir}/performance-report.json`,
          '--output', './test-dashboard.json'
        ]);

        if (!fs.existsSync('./test-dashboard.json')) {
          throw new Error('Dashboard data file not generated');
        }

        const dashboardData = JSON.parse(fs.readFileSync('./test-dashboard.json', 'utf8'));
        if (!dashboardData.summary || !dashboardData.performance) {
          throw new Error('Dashboard data has invalid structure');
        }

        log.info(`   Dashboard data: Status ${dashboardData.summary.status}, Score ${dashboardData.summary.overallScore}`);

      } finally {
        // Cleanup
        fs.rmSync(testDir, { recursive: true, force: true });
        fs.rmSync('./test-dashboard.json', { force: true });
        fs.rmSync('./test-dashboard.min.json', { force: true });
      }
    });

    // Test 5: TypeScript compilation
    await this.testStep('TypeScript Compilation', async () => {
      await this.runCommand('npm', ['run', 'type-check']);
    });

    // Test 6: Linting
    await this.testStep('ESLint Check', async () => {
      await this.runCommand('npm', ['run', 'lint']);
    });

    // Test 7: Check for required scripts
    await this.testStep('Required Scripts Check', async () => {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      const requiredScripts = ['build', 'analyze:bundle', 'bundle:analyze'];
      
      for (const script of requiredScripts) {
        if (!packageJson.scripts[script]) {
          throw new Error(`Missing required script: ${script}`);
        }
      }
    });

    // Cleanup test artifacts
    fs.rmSync('./bundle-analyzer-report.json', { force: true });

    // Summary
    console.log('\n' + '='.repeat(50));
    log.info('Test Summary:');
    log.success(`Passed: ${this.passed}`);
    if (this.failed > 0) {
      log.error(`Failed: ${this.failed}`);
    }
    if (this.warnings > 0) {
      log.warning(`Warnings: ${this.warnings}`);
    }

    if (this.failed === 0) {
      log.success('All tests passed! 🎉');
      log.info('The workflow components should work correctly in GitHub Actions.');
      log.info('Next steps:');
      log.info('1. Set up SLACK_WEBHOOK_URL secret in GitHub (or remove Slack notifications)');
      log.info('2. Push your changes to trigger the workflow');
      log.info('3. Monitor the Actions tab for successful execution');
    } else {
      log.error('Some tests failed. Please fix the issues before pushing.');
      process.exit(1);
    }
  }
}

// Run tests
const tester = new WorkflowTester();
tester.run().catch((error) => {
  log.error('Test runner failed:', error.message);
  process.exit(1);
});
