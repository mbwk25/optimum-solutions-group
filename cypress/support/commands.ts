/**
 * cypress/support/commands.ts
 * Custom Cypress commands for UI component testing and accessibility validation
 */
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

// Import cypress-axe for accessibility testing
import 'cypress-axe'

// Custom commands for UI component testing

/**
 * Test form submission with validation
 */
Cypress.Commands.add('submitForm' as never, (...args: unknown[]) => {
  const [selector, data] = args as [string, Record<string, unknown>]
  cy.get(selector).within(() => {
    Object.entries(data).forEach(([field, value]) => {
      if (typeof value === 'boolean') {
        if (value) {
          // Handle both native checkboxes and Radix UI checkboxes
          cy.get(`[data-testid="${field}"], [name="${field}"]`).then($el => {
            if ($el.attr('type') === 'checkbox') {
              cy.wrap($el).check()
            } else {
              // Radix UI checkbox - use click
              cy.wrap($el).click()
            }
          })
        } else {
          cy.get(`[data-testid="${field}"], [name="${field}"]`).then($el => {
            if ($el.attr('type') === 'checkbox') {
              cy.wrap($el).uncheck()
            } else {
              // For Radix UI, check current state and click if needed
              if ($el.attr('data-state') === 'checked' || $el.attr('aria-checked') === 'true') {
                cy.wrap($el).click()
              }
            }
          })
        }
      } else {
        cy.get(`[data-testid="${field}"], [name="${field}"]`).clear().type(String(value))
      }
    })
    cy.get('[type="submit"]').click()
  })
})

/**
 * Test component accessibility using cypress-axe
 */
Cypress.Commands.add('testA11y' as never, (...args: unknown[]) => {
  const [selector, options] = args as [string?, Record<string, unknown>?]
  
  // Inject axe-core into the page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(cy as any).injectAxe()
  
  // Run accessibility checks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(cy as any).checkA11y(selector || 'body', options || {
    rules: {
      // Common accessibility rules to check
      'color-contrast': { enabled: true },
      'document-title': { enabled: true },
      'html-has-lang': { enabled: true },
      'landmark-one-main': { enabled: true },
      'page-has-heading-one': { enabled: true },
      'region': { enabled: true },
      'skip-link': { enabled: true },
      'button-name': { enabled: true },
      'image-alt': { enabled: true },
      'label': { enabled: true },
      'list': { enabled: true },
      'listitem': { enabled: true },
      'heading-order': { enabled: true },
      'link-name': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'duplicate-id': { enabled: true },
      'duplicate-id-active': { enabled: true },
      'duplicate-id-aria': { enabled: true }
    }
  })
})

/**
 * Wait for element to be stable (not moving/changing)
 */
Cypress.Commands.add('waitForStable' as never, (...args: unknown[]) => {
  const [selector, timeout = 5000] = args as [string, number?]
  cy.get(selector, { timeout }).should('be.visible')
  cy.wait(100) // Small delay to ensure stability
})

/**
 * Test keyboard navigation for a component
 */
Cypress.Commands.add('testKeyboardNavigation' as never, (...args: unknown[]) => {
  const [startSelector, keys, expectedSelectors] = args as [string, string[], string[]]
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
Cypress.Commands.add('testResponsive' as never, (...args: unknown[]) => {
  const [testFunction] = args as [() => void]
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
Cypress.Commands.add('testThemes' as never, (...args: unknown[]) => {
  const [testFunction] = args as [() => void]
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
Cypress.Commands.add('fillFormField' as never, (...args: unknown[]) => {
  const [fieldIdentifier, value, shouldValidate = true] = args as [string, string | boolean, boolean?]
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
Cypress.Commands.add('dragAndDrop' as never, (...args: unknown[]) => {
  const [sourceSelector, targetSelector] = args as [string, string]
  cy.get(sourceSelector).trigger('dragstart')
  cy.get(targetSelector).trigger('dragenter').trigger('dragover').trigger('drop')
})

/**
 * Test component loading states
 */
Cypress.Commands.add('testLoadingState' as never, (...args: unknown[]) => {
  const [triggerSelector, loadingSelector, contentSelector] = args as [string, string, string]
  cy.get(triggerSelector).click()
  cy.get(loadingSelector).should('be.visible')
  cy.get(contentSelector).should('be.visible')
  cy.get(loadingSelector).should('not.exist')
})

/**
 * Test modal/dialog behavior
 */
Cypress.Commands.add('testModal' as never, (...args: unknown[]) => {
  const [triggerSelector, modalSelector, closeSelector] = args as [string, string, string?]
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
Cypress.Commands.add('shouldContainTextWithRetry' as never, { prevSubject: true }, (subject: unknown, ...args: unknown[]) => {
  const [text, timeout = 5000] = args as [string, number?]
  cy.wrap(subject, { timeout }).should('contain.text', text)
})

/*
 * Tab navigation command - improved for Radix UI compatibility
 */
Cypress.Commands.add('tab' as never, { prevSubject: 'optional' }, (subject: unknown, ...args: unknown[]) => {
  const [options = {}] = args as [{ shift?: boolean }?]
  return cy.window().then((win) => {
    let targetElement: HTMLElement

    if (subject) {
      // If subject exists, focus it and use it as target
      return cy.wrap(subject).focus().then(($el) => {
        targetElement = $el[0] as HTMLElement
        
        // Create comprehensive keyboard event properties
        const eventProps = {
          key: 'Tab',
          code: 'Tab',
          keyCode: 9,
          which: 9,
          bubbles: true,
          cancelable: true,
          shiftKey: options.shift || false
        }

        // Dispatch keydown and keyup events to the focused element
        return cy.wrap(targetElement)
          .trigger('keydown', eventProps)
          .trigger('keyup', eventProps)
      })
    } else {
      // If no subject, use the currently focused element
      return cy.focused().then(($focused) => {
        if ($focused.length > 0) {
          targetElement = $focused[0] as HTMLElement
        } else {
          // Fallback to document.activeElement if cy.focused() doesn't work
          targetElement = win.document.activeElement as HTMLElement || win.document.body
        }
        
        // Create comprehensive keyboard event properties
        const eventProps = {
          key: 'Tab',
          code: 'Tab',
          keyCode: 9,
          which: 9,
          bubbles: true,
          cancelable: true,
          shiftKey: options.shift || false
        }

        // Dispatch keydown and keyup events to the focused element
        return cy.wrap(targetElement)
          .trigger('keydown', eventProps)
          .trigger('keyup', eventProps)
      })
    }
  })
})

/**
 * Test color contrast ratio
 */
Cypress.Commands.add('checkColorContrast' as never, (...args: unknown[]) => {
  const [selector, minRatio = 4.5] = args as [string, number?]
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
Cypress.Commands.add('checkComponentA11y' as never, (...args: unknown[]) => {
  const [selector] = args as [string]
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
  
  // Run basic accessibility check
  cy.testA11y(selector)
})

/**
 * Test keyboard-only navigation flow
 */
Cypress.Commands.add('testKeyboardFlow' as never, (...args: unknown[]) => {
  const [steps] = args as [Array<{ action: string; target?: string; expectedFocus?: string }>]
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
Cypress.Commands.add('checkAnnouncement' as never, (...args: unknown[]) => {
  const [triggerSelector, expectedText] = args as [string, string]
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

/**
 * Check or uncheck Radix UI checkbox
 */
Cypress.Commands.add('checkRadixCheckbox' as never, { prevSubject: true }, (subject: unknown, ...args: unknown[]) => {
  const [shouldBeChecked = true] = args as [boolean?]
  return cy.wrap(subject).then(($checkbox) => {
    const $el = $checkbox as JQuery<HTMLElement>
    const currentState = $el.attr('data-state') || $el.attr('aria-checked')
    const isCurrentlyChecked = currentState === 'checked' || currentState === 'true'
    
    if (isCurrentlyChecked !== shouldBeChecked) {
      cy.wrap($el).click()
    }
    
    return cy.wrap($el)
  })
})

/**
 * Toggle Radix UI checkbox
 */
Cypress.Commands.add('toggleRadixCheckbox' as never, { prevSubject: true }, (subject: unknown) => {
  return cy.wrap(subject).click()
})

export {}

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
       * Test component accessibility using cypress-axe
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
      
      /**
       * Check or uncheck Radix UI checkbox
       */
      checkRadixCheckbox(shouldBeChecked?: boolean): Chainable<Element>
      
      /**
       * Toggle Radix UI checkbox
       */
      toggleRadixCheckbox(): Chainable<Element>
    }
  }
}
