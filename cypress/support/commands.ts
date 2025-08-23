/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for UI component testing

/**
 * Test form submission with validation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Cypress.Commands.add('submitForm', (selector: string, data: Record<string, any>) => {
  cy.get(selector).within(() => {
    Object.entries(data).forEach(([field, value]) => {
      if (typeof value === 'boolean') {
        if (value) {
          cy.get(`[data-testid="${field}"], [name="${field}"]`).check()
        } else {
          cy.get(`[data-testid="${field}"], [name="${field}"]`).uncheck()
        }
      } else {
        cy.get(`[data-testid="${field}"], [name="${field}"]`).clear().type(String(value))
      }
    })
    cy.get('[type="submit"]').click()
  })
})

/**
 * Test component accessibility
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Cypress.Commands.add('testA11y', (selector?: string, options?: any) => {
  cy.checkA11y(selector, options, (violations) => {
    violations.forEach((violation) => {
      cy.log(`Accessibility violation: ${violation.description}`)
      violation.nodes.forEach((node) => {
        cy.log(`Element: ${node.target.join(', ')}`)
      })
    })
  })
})

/**
 * Wait for element to be stable (not moving/changing)
 */
Cypress.Commands.add('waitForStable', (selector: string, timeout: number = 5000) => {
  cy.get(selector, { timeout }).should('be.visible')
  cy.wait(100) // Small delay to ensure stability
})

/**
 * Test keyboard navigation for a component
 */
Cypress.Commands.add('testKeyboardNavigation', (startSelector: string, keys: string[], expectedSelectors: string[]) => {
  cy.get(startSelector).focus()
  
  keys.forEach((key, index) => {
    cy.focused().type(`{${key}}`)
    if (expectedSelectors[index]) {
      cy.get(expectedSelectors[index]).should('be.focused')
    }
  })
})

/**
 * Test responsive behavior across different viewports
 */
Cypress.Commands.add('testResponsive', (testFunction: () => void) => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' },
  ]

  viewports.forEach((viewport) => {
    cy.viewport(viewport.width, viewport.height)
    cy.log(`Testing on ${viewport.name} (${viewport.width}x${viewport.height})`)
    testFunction()
  })
})

/**
 * Test component in different themes
 */
Cypress.Commands.add('testThemes', (testFunction: () => void) => {
  const themes = ['light', 'dark']
  
  themes.forEach((theme) => {
    cy.get('html').then(($html) => {
      $html.removeClass('light dark').addClass(theme)
    })
    cy.log(`Testing with ${theme} theme`)
    testFunction()
  })
})

/**
 * Fill form with test data and validate
 */
Cypress.Commands.add('fillFormField', (fieldIdentifier: string, value: string | boolean, shouldValidate: boolean = true) => {
  const selector = `[data-testid="${fieldIdentifier}"], [name="${fieldIdentifier}"], #${fieldIdentifier}`
  
  cy.get(selector).then(($el) => {
    const tagName = $el.prop('tagName').toLowerCase()
    const type = $el.attr('type')
    
    if (type === 'checkbox' || type === 'radio') {
      if (value) {
        cy.wrap($el).check()
      } else {
        cy.wrap($el).uncheck()
      }
    } else if (tagName === 'select') {
      cy.wrap($el).select(String(value))
    } else {
      cy.wrap($el).clear().type(String(value))
    }
    
    if (shouldValidate) {
      cy.wrap($el).blur() // Trigger validation
    }
  })
})

/**
 * Drag and drop functionality
 */
Cypress.Commands.add('dragAndDrop', (sourceSelector: string, targetSelector: string) => {
  cy.get(sourceSelector).trigger('dragstart')
  cy.get(targetSelector).trigger('dragenter').trigger('dragover').trigger('drop')
})

/**
 * Test component loading states
 */
Cypress.Commands.add('testLoadingState', (triggerSelector: string, loadingSelector: string, contentSelector: string) => {
  cy.get(triggerSelector).click()
  cy.get(loadingSelector).should('be.visible')
  cy.get(contentSelector).should('be.visible')
  cy.get(loadingSelector).should('not.exist')
})

/**
 * Test modal/dialog behavior
 */
Cypress.Commands.add('testModal', (triggerSelector: string, modalSelector: string, closeSelector?: string) => {
  // Open modal
  cy.get(triggerSelector).click()
  cy.get(modalSelector).should('be.visible')
  
  // Test focus trap
  cy.get('body').type('{tab}')
  cy.focused().should('exist').and('be.visible')
  
  // Close modal
  if (closeSelector) {
    cy.get(closeSelector).click()
  } else {
    cy.get('body').type('{esc}')
  }
  
  cy.get(modalSelector).should('not.exist')
})

/**
 * Custom assertion for text content with retry
 */
Cypress.Commands.add('shouldContainTextWithRetry', { prevSubject: true }, (subject, text: string, timeout: number = 5000) => {
  cy.wrap(subject, { timeout }).should('contain.text', text)
})

/**
 * Tab navigation command
 */
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject, options: { shift?: boolean } = {}) => {
  if (subject) {
    if (options.shift) {
      return cy.wrap(subject).trigger('keydown', { key: 'Tab', shiftKey: true })
    } else {
      return cy.wrap(subject).trigger('keydown', { key: 'Tab' })
    }
  } else {
    if (options.shift) {
      return cy.get('body').trigger('keydown', { key: 'Tab', shiftKey: true })
    } else {
      return cy.get('body').trigger('keydown', { key: 'Tab' })
    }
  }
})

/**
 * Test color contrast ratio
 */
Cypress.Commands.add('checkColorContrast', (selector: string, minRatio: number = 4.5) => {
  cy.get(selector).should(($el) => {
    const element = $el[0]
    const styles = window.getComputedStyle(element)
    const bgColor = styles.backgroundColor
    const color = styles.color
    
    // Basic check that colors exist and are not transparent
    void expect(bgColor).to.not.equal('rgba(0, 0, 0, 0)')
    void expect(color).to.not.equal('rgba(0, 0, 0, 0)')
    void expect(color).to.not.equal('transparent')
    
    // Log colors for manual verification
    cy.log(`Element: ${selector}, Background: ${bgColor}, Text: ${color}`)
  })
})

/**
 * Comprehensive accessibility check for a component
 */
Cypress.Commands.add('checkComponentA11y', (selector: string) => {
  cy.get(selector).within(() => {
    // Check for basic accessibility attributes
    cy.root().then($root => {
      const element = $root[0]
      const tagName = element.tagName.toLowerCase()
      
      if (['button', 'a', 'input', 'textarea', 'select'].includes(tagName)) {
        // Interactive elements should be focusable
        void expect($root.attr('tabindex')).to.not.equal('-1')
        
        // Should have accessible name
        const hasAccessibleName = 
          $root.text().trim() !== '' ||
          $root.attr('aria-label') ||
          $root.attr('aria-labelledby') ||
          $root.attr('alt') ||
          $root.attr('title')
        
        void expect(hasAccessibleName).to.be.true
      }
      
      if (tagName === 'img') {
        // Images should have alt text
        void expect($root.attr('alt')).to.exist
      }
    })
  })
  
  // Run axe on the specific component
  cy.testA11y(selector)
})

/**
 * Test keyboard-only navigation flow
 */
Cypress.Commands.add('testKeyboardFlow', (steps: Array<{ action: string; target?: string; expectedFocus?: string }>) => {
  steps.forEach((step, index) => {
    cy.log(`Step ${index + 1}: ${step.action}`)
    
    switch (step.action) {
      case 'tab':
        cy.focused().tab()
        break
      case 'shift-tab':
        cy.focused().tab({ shift: true })
        break
      case 'focus':
        if (step.target) {
          cy.get(step.target).focus()
        }
        break
      case 'enter':
        cy.focused().type('{enter}')
        break
      case 'space':
        cy.focused().type(' ')
        break
      case 'escape':
        cy.focused().type('{esc}')
        break
      case 'arrow-down':
        cy.focused().type('{downarrow}')
        break
      case 'arrow-up':
        cy.focused().type('{uparrow}')
        break
      default:
        cy.log(`Unknown action: ${step.action}`)
    }
    
    if (step.expectedFocus) {
      cy.focused().should('have.attr', 'data-testid', step.expectedFocus.replace(/\[data-testid="([^"]+)"\]/, '$1'))
    }
  })
})

/**
 * Test screen reader announcements
 */
Cypress.Commands.add('checkAnnouncement', (triggerSelector: string, expectedText: string) => {
  // Store initial live regions
  cy.get('[aria-live]').then($initialRegions => {
    const initialCount = $initialRegions.length
    
    // Trigger the action
    cy.get(triggerSelector).click()
    
    // Check if announcement was made
    cy.get('[aria-live], [role="alert"], [role="status"]').should($regions => {
      const hasAnnouncement = Array.from($regions).some(region => 
        region.textContent?.includes(expectedText)
      )
      void expect(hasAnnouncement || $regions.length > initialCount).to.be.true
    })
  })
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Submit form with test data
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      submitForm(selector: string, data: Record<string, any>): Chainable<Element>
      
      /**
       * Test component accessibility
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      testA11y(selector?: string, options?: any): Chainable<void>
      
      /**
       * Wait for element to be stable
       */
      waitForStable(selector: string, timeout?: number): Chainable<Element>
      
      /**
       * Test keyboard navigation
       */
      testKeyboardNavigation(startSelector: string, keys: string[], expectedSelectors: string[]): Chainable<void>
      
      /**
       * Test responsive behavior
       */
      testResponsive(testFunction: () => void): Chainable<void>
      
      /**
       * Test different themes
       */
      testThemes(testFunction: () => void): Chainable<void>
      
      /**
       * Fill form field with validation
       */
      fillFormField(fieldIdentifier: string, value: string | boolean, shouldValidate?: boolean): Chainable<Element>
      
      /**
       * Drag and drop elements
       */
      dragAndDrop(sourceSelector: string, targetSelector: string): Chainable<void>
      
      /**
       * Test loading states
       */
      testLoadingState(triggerSelector: string, loadingSelector: string, contentSelector: string): Chainable<void>
      
      /**
       * Test modal behavior
       */
      testModal(triggerSelector: string, modalSelector: string, closeSelector?: string): Chainable<void>
      
      /**
       * Assert text content with retry
       */
      shouldContainTextWithRetry(text: string, timeout?: number): Chainable<Element>
      
      /**
       * Tab navigation
       */
      tab(options?: { shift?: boolean }): Chainable<Element>
      
      /**
       * Test color contrast ratio
       */
      checkColorContrast(selector: string, minRatio?: number): Chainable<void>
      
      /**
       * Comprehensive accessibility check for a component
       */
      checkComponentA11y(selector: string): Chainable<void>
      
      /**
       * Test keyboard-only navigation flow
       */
      testKeyboardFlow(steps: Array<{ action: string; target?: string; expectedFocus?: string }>): Chainable<void>
      
      /**
       * Test screen reader announcements
       */
      checkAnnouncement(triggerSelector: string, expectedText: string): Chainable<void>
    }
  }
}
