# E2E Testing with Cypress

This directory contains comprehensive End-to-End (E2E) testing setup using Cypress for the UI components project.

## 📁 Directory Structure

```
cypress/
├── e2e/                          # E2E test specifications
│   ├── components/               # Individual component tests
│   │   ├── button.cy.ts         # Button component E2E tests
│   │   └── form.cy.ts           # Form components E2E tests
│   ├── integration/              # Integration workflow tests
│   │   └── component-workflows.cy.ts
│   ├── accessibility/            # Accessibility testing
│   │   └── accessibility.cy.ts
│   ├── user-journeys/           # Complete user workflow tests
│   │   └── complete-workflows.cy.ts
│   └── visual/                  # Visual regression tests
│       └── visual-regression.cy.ts
├── support/                     # Cypress support files
│   ├── commands.ts             # Custom Cypress commands
│   ├── component.ts            # Component testing support
│   └── e2e.ts                  # E2E testing support
├── fixtures/                   # Test data and fixtures
│   └── testData.json          # Sample test data
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser (Chrome, Firefox, Edge)

### Installation

The Cypress dependencies are already installed with the project:

```bash
npm install
```

### Running Tests

#### Interactive Mode (Development)

Open Cypress Test Runner for development and debugging:

```bash
# Start dev server and open Cypress
npm run test:e2e:open

# Or manually start dev server first, then open Cypress
npm run dev
npm run cypress:open
```

#### Headless Mode (CI/Production)

Run all E2E tests in headless mode:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test categories
npm run test:e2e:components
npm run test:e2e:integration
npm run test:e2e:accessibility
npm run test:e2e:visual
npm run test:e2e:journeys

# Run tests in specific browsers
npm run cypress:run:chrome
npm run cypress:run:firefox
npm run cypress:run:edge
```

#### Combined Testing

Run both unit tests and E2E tests:

```bash
npm run test:all
```

## 🧪 Test Categories

### 1. Component Tests (`cypress/e2e/components/`)

Individual component testing focusing on:
- Rendering and visual appearance
- User interactions (click, hover, focus)
- State management
- Props validation
- Responsive behavior
- Accessibility compliance

**Example: Button Tests**
- All button variants (primary, secondary, outline, etc.)
- Different sizes (sm, default, lg)
- Interactive states (hover, focus, disabled)
- Click event handling
- Keyboard navigation
- Form integration

### 2. Integration Tests (`cypress/e2e/integration/`)

Complex workflows involving multiple components:
- Form submission with validation
- Alert system integration
- Component state synchronization
- Error handling flows
- Multi-step user interactions

**Example: Form Workflow**
- Form validation across multiple fields
- Dynamic button state changes
- Alert display coordination
- Cross-component state management

### 3. Accessibility Tests (`cypress/e2e/accessibility/`)

Comprehensive accessibility testing:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Color contrast validation
- ARIA attributes verification

**Key Features:**
- Automated axe-core accessibility scanning
- Keyboard-only navigation testing
- Screen reader simulation
- High contrast mode testing
- Touch target size validation (mobile)

### 4. User Journey Tests (`cypress/e2e/user-journeys/`)

Real-world user workflows:
- New user onboarding
- Complete form submission flows
- Error recovery scenarios
- Mobile user experiences
- Power user rapid interactions
- Cross-browser compatibility

**Example Journeys:**
- First-time user exploring components
- Frustrated user making mistakes and recovering
- Mobile user completing tasks
- Accessibility-first user using keyboard only
- Power user performing rapid interactions

### 5. Visual Regression Tests (`cypress/e2e/visual/`)

Screenshot-based visual testing:
- Component appearance verification
- Layout consistency across viewports
- Theme variations (light/dark)
- Hover and focus state visuals
- Form workflow visual states
- Cross-browser visual consistency

**Visual Test Categories:**
- Individual component screenshots
- Responsive layout testing
- Theme comparison (light/dark)
- Interactive state capture
- Complete workflow visualization

## 🛠 Custom Commands

We've created custom Cypress commands for common testing patterns:

### Form Testing
```javascript
cy.submitForm('[data-testid="contact-form"]', {
  name: 'John Doe',
  email: 'john@example.com',
  subscribe: true
})

cy.fillFormField('email', 'test@example.com', true)
```

### Accessibility Testing
```javascript
cy.testA11y()  // Check current page for violations
cy.testKeyboardNavigation(startSelector, keys, expectedSelectors)
```

### Component Testing
```javascript
cy.testResponsive(() => {
  // Test function to run on different viewports
})

cy.testThemes(() => {
  // Test function to run with different themes
})

cy.testModal(triggerSelector, modalSelector, closeSelector)
cy.testLoadingState(triggerSelector, loadingSelector, contentSelector)
```

### Viewport Presets
```javascript
cy.setViewportPreset('mobile')    // 375x667
cy.setViewportPreset('tablet')    // 768x1024
cy.setViewportPreset('desktop')   // 1280x720
cy.setViewportPreset('wide')      // 1920x1080
```

## 📊 Test Data and Fixtures

Test data is centralized in `cypress/fixtures/testData.json`:

```json
{
  "users": {
    "admin": { "email": "admin@example.com", "password": "admin123" },
    "user": { "email": "user@example.com", "password": "user123" }
  },
  "formData": {
    "contactForm": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "message": "Test message"
    }
  },
  "componentData": {
    "selectOptions": ["Apple", "Banana", "Cherry"],
    "notifications": [
      { "type": "success", "title": "Success!", "message": "Operation completed" }
    ]
  }
}
```

Usage in tests:
```javascript
cy.fixture('testData').then((data) => {
  const formData = data.formData.contactForm
  cy.get('[data-testid="input-name"]').type(formData.name)
})
```

## 🔧 Configuration

### Cypress Configuration (`cypress.config.ts`)

- **Base URL**: http://localhost:5173
- **Viewport**: 1280x720 (desktop), responsive testing available
- **Timeouts**: Configured for reliable testing
- **Retries**: 2 retries in run mode, 0 in open mode
- **Screenshots**: Enabled on failure
- **Video**: Enabled for debugging

### Environment Variables

```javascript
// cypress.config.ts
env: {
  CYPRESS_BASE_URL: 'http://localhost:5173'
}
```

## 🚨 Error Handling

### JSDOM Compatibility

We've added compatibility fixes for JSDOM limitations:

```javascript
// cypress/support/e2e.ts
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  return true
})
```

### Mock Setup

Required mocks for Radix UI components are configured in the global setup.

## 📈 Performance Testing

Performance thresholds are built into the tests:

```javascript
// Example: Button performance test
it('should handle rapid clicks without issues', () => {
  for (let i = 0; i < 10; i++) {
    cy.get('[data-testid="btn-primary"]').click()
  }
  cy.get('[data-testid="btn-primary"]').should('be.visible')
})
```

## 🔍 Debugging

### Visual Debugging

1. Use Cypress Test Runner in interactive mode
2. Time-travel through test steps
3. Inspect DOM at any point
4. View screenshots on failure

### Console Debugging

```javascript
cy.debug()  // Pause test execution
cy.pause()  // Pause with interactive controls
cy.log('Debug message')  // Custom logging
```

### Screenshots

Screenshots are automatically taken on test failure and can be manually captured:

```javascript
cy.screenshot('custom-screenshot-name')
cy.get('[data-testid="component"]').screenshot('component-state')
```

## 📱 Mobile Testing

Mobile-specific testing is integrated:

```javascript
cy.setViewportPreset('mobile')
// Touch events
cy.get('[data-testid="button"]').trigger('touchstart').trigger('touchend')
// Viewport-specific assertions
cy.get('[data-testid="button"]').should($btn => {
  const rect = $btn[0].getBoundingClientRect()
  expect(rect.height).to.be.at.least(44) // Touch target size
})
```

## 🌐 Cross-Browser Testing

Run tests across different browsers:

```bash
npm run cypress:run:chrome
npm run cypress:run:firefox
npm run cypress:run:edge
```

Browser-specific behaviors are handled in the tests where necessary.

## 📋 Best Practices

### Test Structure

```javascript
describe('Component Name', () => {
  beforeEach(() => {
    cy.visit('/component-showcase')
  })

  describe('Feature Category', () => {
    it('should perform specific behavior', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Selectors

- Prefer `data-testid` attributes for test selectors
- Avoid coupling tests to implementation details
- Use semantic selectors when appropriate (`cy.getByRole()`)

### Assertions

```javascript
// Good
cy.get('[data-testid="button"]').should('be.visible')
cy.get('[data-testid="input"]').should('have.value', 'expected')

// Better - with clear intent
cy.get('[data-testid="success-message"]')
  .should('be.visible')
  .and('contain.text', 'Success!')
```

### Async Handling

Cypress handles async automatically, but for custom logic:

```javascript
cy.get('[data-testid="loading"]').should('be.visible')
cy.get('[data-testid="content"]').should('be.visible')
cy.get('[data-testid="loading"]').should('not.exist')
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run E2E Tests
  run: npm run test:e2e
  
- name: Upload Screenshots
  uses: actions/upload-artifact@v2
  if: failure()
  with:
    name: cypress-screenshots
    path: cypress/screenshots
```

### Test Reports

Cypress generates detailed test reports and can integrate with various reporting tools.

## 🎯 Coverage

E2E tests provide:
- User interaction coverage
- Integration testing between components
- Real browser environment testing
- Visual regression detection
- Accessibility compliance verification
- Performance benchmarking

## 🤝 Contributing

When adding new tests:

1. Follow the established directory structure
2. Use descriptive test names
3. Include proper setup and teardown
4. Add accessibility checks where relevant
5. Consider mobile and responsive scenarios
6. Update this README if adding new patterns

## 🆘 Troubleshooting

### Common Issues

**Test fails in CI but passes locally:**
- Check viewport differences
- Verify timing/performance thresholds
- Review environment-specific configurations

**Flaky tests:**
- Add appropriate waits (`cy.wait()` for specific delays)
- Use better assertions (`should('be.visible')` instead of `should('exist')`)
- Check for race conditions in async operations

**Accessibility test failures:**
- Review axe-core violation details
- Check ARIA attributes and labels
- Verify keyboard navigation paths
- Test with actual screen readers when possible

### Getting Help

1. Check Cypress documentation
2. Review test logs and screenshots
3. Use interactive mode for debugging
4. Check browser developer tools during test execution

---

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library Guidelines](https://testing-library.com/docs/guiding-principles)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)

Happy Testing! 🎉
