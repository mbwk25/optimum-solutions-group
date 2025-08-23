/**
 * Comprehensive Accessibility Testing Configuration
 * 
 * This file contains configuration for axe-core accessibility testing,
 * including custom rules, standards compliance, and test scenarios.
 */

export interface AccessibilityTestConfig {
  // WCAG compliance level
  level: 'A' | 'AA' | 'AAA'
  // Tags to include in testing
  tags: string[]
  // Rules to enable/disable
  rules: Record<string, { enabled: boolean; options?: Record<string, unknown> }>
  // Elements to exclude from testing
  exclude: string[]
}

// WCAG 2.1 AA Configuration (Default)
export const wcag21AAConfig: AccessibilityTestConfig = {
  level: 'AA',
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  rules: {
    // Color contrast requirements
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: false }, // AAA level
    
    // Keyboard navigation
    'focus-order-semantics': { enabled: true },
    'keyboard': { enabled: true },
    'focus-trap': { enabled: true },
    
    // Screen reader compatibility
    'aria-required-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'duplicate-id-aria': { enabled: true },
    
    // Form accessibility
    'label': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'autocomplete-valid': { enabled: true },
    
    // Interactive elements
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    'image-alt': { enabled: true },
    
    // Page structure
    'page-has-heading-one': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-one-main': { enabled: true },
    'region': { enabled: true }
  },
  exclude: [
    // Exclude third-party widgets that we cannot control
    '.third-party-widget',
    '[data-test-ignore-a11y]'
  ]
}

// WCAG 2.1 AAA Configuration (Strict)
export const wcag21AAAConfig: AccessibilityTestConfig = {
  level: 'AAA',
  tags: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21aaa'],
  rules: {
    ...wcag21AAConfig.rules,
    'color-contrast-enhanced': { enabled: true }, // 7:1 ratio for AAA
    'focus-visible': { enabled: true },
    'scrollable-region-focusable': { enabled: true }
  },
  exclude: wcag21AAConfig.exclude
}

// Mobile-specific accessibility configuration
export const mobileA11yConfig: AccessibilityTestConfig = {
  level: 'AA',
  tags: ['wcag2a', 'wcag2aa', 'best-practice'],
  rules: {
    ...wcag21AAConfig.rules,
    'target-size': { enabled: true }, // Touch target size
    'meta-viewport': { enabled: true },
    'css-orientation-lock': { enabled: true }
  },
  exclude: wcag21AAConfig.exclude
}

// Test scenarios for common accessibility patterns
export const accessibilityScenarios = {
  // Form testing scenarios
  formTesting: [
    { action: 'focus', target: '[data-testid="input-name"]' },
    { action: 'tab', expectedFocus: 'input-email' },
    { action: 'tab', expectedFocus: 'select-category' },
    { action: 'enter' }, // Open dropdown
    { action: 'arrow-down' },
    { action: 'enter' }, // Select option
    { action: 'tab', expectedFocus: 'textarea-message' },
    { action: 'tab', expectedFocus: 'checkbox-subscribe' },
    { action: 'space' }, // Toggle checkbox
    { action: 'tab', expectedFocus: 'btn-submit' },
    { action: 'enter' } // Submit form
  ],
  
  // Button testing scenarios
  buttonTesting: [
    { action: 'focus', target: '[data-testid="btn-primary"]' },
    { action: 'enter' }, // Activate with Enter
    { action: 'focus', target: '[data-testid="btn-secondary"]' },
    { action: 'space' }, // Activate with Space
    { action: 'tab', expectedFocus: 'btn-outline' }
  ],
  
  // Modal/dialog testing scenarios
  modalTesting: [
    { action: 'focus', target: '[data-testid="btn-open-modal"]' },
    { action: 'enter' }, // Open modal
    { action: 'tab' }, // Focus should be trapped in modal
    { action: 'escape' }, // Close modal
    // Focus should return to trigger button
  ]
}

// Accessibility violation severity levels
export enum ViolationSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SERIOUS = 'serious',
  CRITICAL = 'critical'
}

// Custom accessibility rules for our application
export const customRules = {
  // Ensure all buttons have meaningful text
  'custom-button-text': {
    selector: 'button',
    evaluate: (node: Element) => {
      const text = node.textContent?.trim() || ''
      const ariaLabel = node.getAttribute('aria-label')
      const title = node.getAttribute('title')
      
      if (!text && !ariaLabel && !title) {
        return false
      }
      
      // Check for generic button text
      const genericTexts = ['click here', 'button', 'submit', 'ok']
      return !genericTexts.includes(text.toLowerCase())
    },
    message: 'Buttons should have descriptive text that explains their purpose'
  },
  
  // Ensure form inputs have associated labels
  'custom-input-labels': {
    selector: 'input[type="text"], input[type="email"], input[type="password"], textarea',
    evaluate: (node: Element) => {
      const id = node.getAttribute('id')
      const ariaLabel = node.getAttribute('aria-label')
      const ariaLabelledBy = node.getAttribute('aria-labelledby')
      
      if (ariaLabel || ariaLabelledBy) return true
      
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        return !!label
      }
      
      return false
    },
    message: 'Form inputs must have associated labels'
  }
}

// Accessibility testing best practices
export const testingBestPractices = {
  // Test with different user scenarios
  userScenarios: [
    'keyboard-only-user',
    'screen-reader-user',
    'low-vision-user',
    'motor-impairment-user',
    'cognitive-disability-user'
  ],
  
  // Key areas to focus on
  focusAreas: [
    'keyboard-navigation',
    'screen-reader-compatibility',
    'color-contrast',
    'focus-management',
    'error-handling',
    'form-accessibility',
    'interactive-elements',
    'page-structure'
  ],
  
  // Common accessibility patterns to test
  patterns: [
    'form-validation-with-aria-live',
    'modal-focus-trap',
    'dropdown-aria-expanded',
    'tab-panel-navigation',
    'error-message-association',
    'loading-state-announcements'
  ]
}

// Export default configuration
export const defaultConfig = wcag21AAConfig

export default {
  wcag21AAConfig,
  wcag21AAAConfig,
  mobileA11yConfig,
  accessibilityScenarios,
  customRules,
  testingBestPractices,
  ViolationSeverity
}
