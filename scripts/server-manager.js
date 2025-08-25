import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

/**
 * Server Management Utility with Multiple Fallback Strategies
 * Ensures reliable server startup in CI environments
 */

const SERVER_CONFIGS = [
  {
    name: 'vite-preview',
    command: 'npm',
    args: ['run', 'preview'],
    port: 4173,
    priority: 1,
    description: 'Vite preview server (production build)'
  },
  {
    name: 'http-server',
    command: 'npx',
    args: ['http-server', 'dist', '-p', '8080', '--cors', '-c-1'],
    port: 8080,
    priority: 2,
    description: 'HTTP Server (simple static server)'
  },
  {
    name: 'serve',
    command: 'npx',
    args: ['serve', '-s', 'dist', '-p', '8081'],
    port: 8081,
    priority: 3,
    description: 'Serve package (SPA-friendly)'
  },
  {
    name: 'python-server',
    command: 'python3',
    args: ['-m', 'http.server', '8082', '--directory', 'dist'],
    port: 8082,
    priority: 4,
    description: 'Python HTTP server (fallback)'
  }
];

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const isDebug = process.env.DEBUG_SERVER === 'true';

class ServerManager {
  constructor() {
    this.activeServers = new Map();
    this.maxRetries = 3;
    this.retryDelay = 2000;
    this.healthCheckTimeout = 30000;
  }

  /**
   * Test if a port is available
   */
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = http.createServer();
      server.listen(port, () => {
        server.close();
        resolve(true);
      });
      server.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Check if server is responding at given URL
   */
  async isServerHealthy(url, timeout = 10000) {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(false), timeout);
      
      const checkHealth = async () => {
        try {
          const response = await fetch(url, { 
            method: 'GET',
            signal: AbortSignal.timeout(timeout)
          });
          
          if (response.ok) {
            clearTimeout(timeoutId);
            resolve(true);
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          if (isDebug) {
            console.log(`⚠️ Health check failed for ${url}:`, error.message);
          }
          setTimeout(checkHealth, 1000);
        }
      };
      
      checkHealth();
    });
  }

  /**
   * Start a server with given configuration
   */
  async startServer(config, retries = this.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🚀 Starting ${config.name} (attempt ${attempt}/${retries}): ${config.description}`);
        
        // Check if port is available
        const portAvailable = await this.isPortAvailable(config.port);
        if (!portAvailable && attempt === 1) {
          throw new Error(`Port ${config.port} is already in use`);
        }

        // Check if required command exists
        if (config.command !== 'npm') {
          try {
            await execAsync(`which ${config.command}`);
          } catch (error) {
            throw new Error(`Command '${config.command}' not found in PATH`);
          }
        }

        const serverProcess = spawn(config.command, config.args, {
          stdio: isDebug ? ['pipe', 'pipe', 'pipe'] : ['pipe', 'ignore', 'ignore'],
          detached: false,
          shell: process.platform === 'win32'
        });

        // Handle process output for debugging
        if (isDebug && serverProcess.stdout) {
          serverProcess.stdout.on('data', (data) => {
            console.log(`📟 ${config.name} stdout:`, data.toString().trim());
          });
        }

        if (isDebug && serverProcess.stderr) {
          serverProcess.stderr.on('data', (data) => {
            console.log(`📟 ${config.name} stderr:`, data.toString().trim());
          });
        }

        // Wait for server to start
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Server startup timeout after ${this.healthCheckTimeout}ms`));
          }, this.healthCheckTimeout);

          serverProcess.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
          });

          // Give server time to start, then check health
          setTimeout(async () => {
            try {
              const url = `http://localhost:${config.port}`;
              const isHealthy = await this.isServerHealthy(url, 20000);
              
              clearTimeout(timeout);
              
              if (isHealthy) {
                resolve();
              } else {
                reject(new Error('Server failed health check'));
              }
            } catch (error) {
              clearTimeout(timeout);
              reject(error);
            }
          }, 3000);
        });

        // Server started successfully
        this.activeServers.set(config.name, {
          process: serverProcess,
          config,
          url: `http://localhost:${config.port}`,
          pid: serverProcess.pid
        });

        console.log(`✅ ${config.name} started successfully on port ${config.port}`);
        return {
          success: true,
          config,
          url: `http://localhost:${config.port}`,
          pid: serverProcess.pid
        };

      } catch (error) {
        console.log(`❌ ${config.name} failed (attempt ${attempt}/${retries}):`, error.message);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  /**
   * Try to start servers in priority order until one succeeds
   */
  async startBestAvailableServer(preferredPort = null) {
    console.log('🎯 Finding best available server configuration...');
    
    // Sort by priority or filter by preferred port
    let configs = SERVER_CONFIGS.sort((a, b) => a.priority - b.priority);
    
    if (preferredPort) {
      const preferredConfig = configs.find(c => c.port === preferredPort);
      if (preferredConfig) {
        configs = [preferredConfig, ...configs.filter(c => c.port !== preferredPort)];
      }
    }

    const errors = [];
    
    for (const config of configs) {
      try {
        const result = await this.startServer(config);
        console.log(`🎉 Successfully started server: ${config.name} at ${result.url}`);
        return result;
      } catch (error) {
        errors.push({ config: config.name, error: error.message });
        console.log(`⏭️ Trying next server configuration...`);
      }
    }

    // All servers failed
    throw new Error(`All server configurations failed:\n${errors.map(e => `- ${e.config}: ${e.error}`).join('\n')}`);
  }

  /**
   * Stop all active servers
   */
  async stopAllServers() {
    console.log('🛑 Stopping all active servers...');
    
    for (const [name, serverInfo] of this.activeServers) {
      try {
        console.log(`🛑 Stopping ${name} (PID: ${serverInfo.pid})`);
        
        if (serverInfo.process && !serverInfo.process.killed) {
          serverInfo.process.kill('SIGTERM');
          
          // Wait a bit, then force kill if necessary
          setTimeout(() => {
            if (!serverInfo.process.killed) {
              serverInfo.process.kill('SIGKILL');
            }
          }, 5000);
        }
        
        console.log(`✅ ${name} stopped`);
      } catch (error) {
        console.log(`⚠️ Error stopping ${name}:`, error.message);
      }
    }
    
    this.activeServers.clear();
  }

  /**
   * Get information about active servers
   */
  getActiveServers() {
    const active = [];
    for (const [name, serverInfo] of this.activeServers) {
      active.push({
        name,
        url: serverInfo.url,
        port: serverInfo.config.port,
        pid: serverInfo.pid,
        description: serverInfo.config.description
      });
    }
    return active;
  }

  /**
   * Validate that dist directory exists and has content
   */
  async validateDistDirectory() {
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    try {
      const distStats = await fs.promises.stat(distPath);
      if (!distStats.isDirectory()) {
        throw new Error('dist is not a directory');
      }

      const indexStats = await fs.promises.stat(indexPath);
      if (!indexStats.isFile()) {
        throw new Error('index.html not found in dist directory');
      }

      const indexContent = await fs.promises.readFile(indexPath, 'utf-8');
      if (indexContent.length < 100) {
        throw new Error('index.html appears to be empty or incomplete');
      }

      console.log('✅ dist directory validation passed');
      return { valid: true, indexSize: indexContent.length };
    } catch (error) {
      throw new Error(`dist directory validation failed: ${error.message}`);
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new ServerManager();
  
  // Handle process termination
  process.on('SIGINT', async () => {
    console.log('\n🚫 Received SIGINT, stopping servers...');
    await manager.stopAllServers();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🚫 Received SIGTERM, stopping servers...');
    await manager.stopAllServers();
    process.exit(0);
  });

  async function main() {
    try {
      // Validate dist directory first
      console.log('🔍 Validating build output...');
      await manager.validateDistDirectory();
      
      // Start best available server
      const preferredPort = process.argv[2] ? parseInt(process.argv[2]) : null;
      const result = await manager.startBestAvailableServer(preferredPort);
      
      console.log(`\n🌟 Server ready: ${result.url}`);
      console.log('Press Ctrl+C to stop the server');
      
      // Keep process alive
      process.stdin.resume();
      
    } catch (error) {
      console.error('💥 Failed to start server:', error.message);
      process.exit(1);
    }
  }

  main();
}

export default ServerManager;
