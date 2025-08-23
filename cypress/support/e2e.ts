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

// Global before hook for all E2E tests
beforeEach(() => {
  // Inject axe-core for accessibility testing
  cy.injectAxe()
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
  namespace Cypress {
    interface Chainable {
      /**
       * Set viewport to predefined preset
       */
      setViewportPreset(preset: 'mobile' | 'tablet' | 'desktop' | 'wide'): Chainable<void>
    }
  }
}
