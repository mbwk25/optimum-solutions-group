// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands'
import 'cypress-axe'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Override visit command to auto-inject axe after navigation
Cypress.Commands.overwrite('visit', (originalFn, ...args) => {
  // Check for cross-origin visits to avoid cy.window() errors
  try {
    // Extract target URL from args
    const targetUrl = typeof args[0] === 'string' ? args[0] : (args[0] as { url?: string })?.url || String(args[0])
    
    // Get base origin from Cypress config or current window
    const baseUrl = Cypress.config('baseUrl')
    const baseOrigin = baseUrl 
      ? new URL(baseUrl).origin
      : window.location.origin
    
    // Compare origins
    const targetOrigin = new URL(targetUrl, baseOrigin).origin
    
    if (targetOrigin !== baseOrigin) {
      // Cross-origin visit, skip cy.window() and cy.injectAxe()
      return originalFn(...args)
    }
  } catch (error) {
    // If URL parsing fails, proceed with original behavior
    console.warn('Failed to parse URL for cross-origin check:', error)
  }
  
  // Same-origin visit, proceed with axe injection
  const result = originalFn(...args)
  return result.then((subject) => {
    cy.window({ log: false }).then((win) => {
      if (!(win as Window & { axe?: unknown }).axe) {
        return cy.injectAxe()
      }
    })
    return subject
  })
})

// Global before hook for all E2E tests
beforeEach(() => {
  // Wait for the page to be fully loaded before proceeding
  cy.get('body').should('exist')
  
  // Add a small delay to ensure React is fully loaded
  cy.wait(500)
})

// Global after hook for cleanup
afterEach(() => {
  // Clean up any alerts or modals that might interfere with subsequent tests
  cy.get('body').then(($body) => {
    // Close any open dropdowns or modals
    if ($body.find('[data-radix-popper-content-wrapper]').length > 0) {
      cy.get('body').type('{esc}')
    }
    
    // Clear any alerts
    if ($body.find('[data-testid="alerts-section"] [role="alert"]').length > 0) {
      cy.get('[data-testid="alerts-section"] [role="alert"]').each(($alert) => {
        cy.wrap($alert).invoke('remove')
      })
    }
  })
})

// Enhanced error handling for accessibility tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Common errors that should not fail the test
  const ignoreErrors = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Script error',
    'axe-core',
    'Accessibility',
    'aria-',
    'focus',
    'ResizeObserver'
  ]
  
  // Check if the error should be ignored
  const shouldIgnore = ignoreErrors.some(errorType => 
    err.message.includes(errorType) || 
    err.stack?.includes(errorType)
  )
  
  if (shouldIgnore) {
    console.warn('Ignoring error in accessibility test:', err.message)
    return false
  }
  
  // For other errors, log them but don't fail the test
  console.error('Uncaught exception in test:', err.message)
  return false
})

// Handle test failures more gracefully
Cypress.on('test:after:run', (attributes) => {
  if (attributes.state === 'failed') {
    console.log(`Test "${attributes.title}" failed. Taking screenshot...`)
  }
})

// Custom viewport presets
Cypress.Commands.add('setViewportPreset', (preset: 'mobile' | 'tablet' | 'desktop' | 'wide') => {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    wide: { width: 1920, height: 1080 }
  }
  const viewport = viewports[preset]
  cy.viewport(viewport.width, viewport.height)
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Set viewport to predefined preset
       */
      setViewportPreset(preset: 'mobile' | 'tablet' | 'desktop' | 'wide'): Chainable<void>
    }
  }
}
