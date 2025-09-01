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
})

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // when there are uncaught exceptions from the application
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  return true
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
