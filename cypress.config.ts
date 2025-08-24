import { defineConfig } from 'cypress'
import { devServer } from '@cypress/vite-dev-server'
import path from 'path'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // Better error handling and task registration
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
      
      // Handle uncaught exceptions more gracefully
      on('uncaught:exception', (err, runnable) => {
        // Don't fail tests on certain expected errors
        if (err.message.includes('ResizeObserver loop limit exceeded')) {
          return false
        }
        return true
      })
    },
  },
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: 'react',
        viteConfig: {
          resolve: {
            alias: {
              '@': path.resolve(__dirname, './src'),
            },
          },
        },
      })
    },
    viewportWidth: 1000,
    viewportHeight: 660,
    specPattern: 'cypress/component/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
  env: {
    // Custom environment variables for testing
    CYPRESS_BASE_URL: 'http://localhost:8080',
  },
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  pageLoadTimeout: 30000,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  // Use spec reporter by default, mochawesome for CI
  reporter: process.env.CI ? 'mochawesome' : 'spec',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: false,
    json: true,
  },
})
