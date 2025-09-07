import { defineConfig } from 'cypress'
import { devServer } from '@cypress/vite-dev-server'
import path from 'path'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    viewportWidth: 1280,
    viewportHeight: 720,
     video: false, // Disable video recording to reduce memory usage
    screenshotOnRunFailure: true,
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // Task registration for logging
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
      
      return config
    },
    // Add stability configurations
    experimentalMemoryManagement: true,
    experimentalModifyObstructiveThirdPartyCode: true,
    experimentalRunAllSpecs: false,
    // Increase timeouts for accessibility tests
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 60000,
    // Reduce retries to prevent infinite loops
    retries: {
      runMode: 1,
      openMode: 0,
    },
    // Browser-specific configurations
    chromeWebSecurity: false,
    // Disable uncaught exception handling for accessibility tests
    // @ts-expect-error: experimentalSessionAndOrigin is not yet in Cypress types
    experimentalSessionAndOrigin: true,
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
    // Disable some accessibility rules that can be flaky in tests
    CYPRESS_A11Y_STRICT: 'false',
  },
  // Use spec reporter by default, mochawesome for CI
  reporter: process.env.CI ? 'mochawesome' : 'spec',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: false,
    json: true,
  },
  // Global configurations
  defaultCommandTimeout: 15000,
  requestTimeout: 15000,
  responseTimeout: 15000,
  pageLoadTimeout: 60000,
  retries: {
    runMode: 1,
    openMode: 0,
  },
})
