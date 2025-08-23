describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.visit('/component-showcase')
  })

  describe('Component Visual Tests', () => {
    it('should capture button component visuals', () => {
      cy.get('[data-testid="buttons-card"]').scrollIntoView()
      
      // Capture all button variants
      cy.get('[data-testid="buttons-card"]')
        .screenshot('buttons-all-variants', {
          padding: 20,
          capture: 'viewport'
        })
      
      // Capture individual button states
      cy.get('[data-testid="btn-primary"]')
        .screenshot('button-primary-default')
      
      // Capture hover state
      cy.get('[data-testid="btn-primary"]')
        .trigger('mouseover')
        .screenshot('button-primary-hover')
      
      // Capture focus state
      cy.get('[data-testid="btn-primary"]')
        .focus()
        .screenshot('button-primary-focus')
      
      // Capture disabled state
      cy.get('[data-testid="btn-disabled"]')
        .screenshot('button-disabled-state')
    })

    it('should capture form component visuals', () => {
      cy.get('[data-testid="form-card"]').scrollIntoView()
      
      // Capture empty form
      cy.get('[data-testid="form-card"]')
        .screenshot('form-empty-state', {
          padding: 20
        })
      
      // Capture form with data
      cy.get('[data-testid="input-name"]').type('Visual Test User')
      cy.get('[data-testid="input-email"]').type('visual@test.com')
      cy.get('[data-testid="select-category"]').click()
      cy.get('[data-testid="option-support"]').click()
      cy.get('[data-testid="textarea-message"]').type('Testing visual regression')
      cy.get('[data-testid="checkbox-subscribe"]').check()
      
      cy.get('[data-testid="form-card"]')
        .screenshot('form-filled-state', {
          padding: 20
        })
      
      // Capture form validation error
      cy.get('[data-testid="input-email"]')
        .clear()
        .type('invalid-email')
        .blur()
      
      cy.get('[data-testid="form-card"]')
        .screenshot('form-validation-error', {
          padding: 20
        })
    })

    it('should capture select component visuals', () => {
      cy.get('[data-testid="select-category"]').scrollIntoView()
      
      // Closed state
      cy.get('[data-testid="select-category"]')
        .screenshot('select-closed-state')
      
      // Open dropdown
      cy.get('[data-testid="select-category"]').click()
      
      // Capture dropdown open state
      cy.get('body')
        .screenshot('select-dropdown-open', {
          capture: 'viewport'
        })
      
      // Close dropdown and show selected state
      cy.get('[data-testid="option-support"]').click()
      cy.get('[data-testid="select-category"]')
        .screenshot('select-option-selected')
    })

    it('should capture badge component visuals', () => {
      cy.get('[data-testid="badges-card"]').scrollIntoView()
      
      // Capture all badge variants
      cy.get('[data-testid="badges-card"]')
        .screenshot('badges-all-variants', {
          padding: 20
        })
      
      // Individual badge screenshots
      cy.get('[data-testid="badge-default"]')
        .screenshot('badge-default-variant')
      
      cy.get('[data-testid="badge-secondary"]')
        .screenshot('badge-secondary-variant')
      
      cy.get('[data-testid="badge-destructive"]')
        .screenshot('badge-destructive-variant')
      
      cy.get('[data-testid="badge-outline"]')
        .screenshot('badge-outline-variant')
    })

    it('should capture alert component visuals', () => {
      // Trigger error alert
      cy.get('[data-testid="btn-destructive"]').click()
      
      // Capture error alert
      cy.get('[data-testid="alerts-section"]')
        .screenshot('alert-error-state', {
          padding: 10
        })
      
      // Trigger success alert
      cy.get('[data-testid="input-name"]').type('Alert Test User')
      cy.get('[data-testid="input-email"]').type('alert@test.com')
      cy.get('[data-testid="textarea-message"]').type('Testing alert visuals')
      cy.get('[data-testid="btn-submit"]').click()
      
      // Capture multiple alerts
      cy.get('[data-testid="alerts-section"]')
        .screenshot('alerts-multiple-states', {
          padding: 10
        })
    })

    it('should capture card component visuals', () => {
      cy.get('[data-testid="cards-grid"]').scrollIntoView()
      
      // Capture all pricing cards
      cy.get('[data-testid="cards-grid"]')
        .screenshot('cards-pricing-grid', {
          padding: 20
        })
      
      // Capture individual cards
      cy.get('[data-testid="pricing-card-basic"]')
        .screenshot('card-basic-plan')
      
      cy.get('[data-testid="pricing-card-pro"]')
        .screenshot('card-pro-plan')
      
      cy.get('[data-testid="pricing-card-enterprise"]')
        .screenshot('card-enterprise-plan')
      
      // Capture hover states
      cy.get('[data-testid="pricing-card-basic"]')
        .trigger('mouseover')
        .screenshot('card-basic-plan-hover')
    })
  })

  describe('Layout Visual Tests', () => {
    it('should capture full page layout', () => {
      // Capture full page
      cy.screenshot('full-page-layout', {
        capture: 'fullPage'
      })
      
      // Capture above-the-fold content
      cy.screenshot('page-header-section', {
        capture: 'viewport'
      })
    })

    it('should capture responsive layouts', () => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1280, height: 720, name: 'desktop' },
        { width: 1920, height: 1080, name: 'large-desktop' }
      ]
      
      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height)
        cy.wait(500) // Let layout stabilize
        
        // Capture full layout on each viewport
        cy.screenshot(`layout-${viewport.name}`, {
          capture: 'fullPage'
        })
        
        // Capture form section on each viewport
        cy.get('[data-testid="form-card"]').scrollIntoView()
        cy.get('[data-testid="form-card"]')
          .screenshot(`form-layout-${viewport.name}`, {
            padding: 20
          })
        
        // Capture cards grid on each viewport
        cy.get('[data-testid="cards-grid"]').scrollIntoView()
        cy.get('[data-testid="cards-grid"]')
          .screenshot(`cards-layout-${viewport.name}`, {
            padding: 20
          })
      })
    })
  })

  describe('Theme Visual Tests', () => {
    it('should capture light theme visuals', () => {
      // Ensure light theme is active
      cy.get('html').then($html => {
        $html.removeClass('dark').addClass('light')
      })
      
      cy.wait(500) // Let theme changes apply
      
      // Capture components in light theme
      cy.get('[data-testid="buttons-card"]')
        .screenshot('buttons-light-theme', { padding: 20 })
      
      cy.get('[data-testid="form-card"]')
        .screenshot('form-light-theme', { padding: 20 })
      
      cy.get('[data-testid="badges-card"]')
        .screenshot('badges-light-theme', { padding: 20 })
    })

    it('should capture dark theme visuals', () => {
      // Switch to dark theme
      cy.get('html').then($html => {
        $html.removeClass('light').addClass('dark')
      })
      
      cy.wait(500) // Let theme changes apply
      
      // Capture components in dark theme
      cy.get('[data-testid="buttons-card"]')
        .screenshot('buttons-dark-theme', { padding: 20 })
      
      cy.get('[data-testid="form-card"]')
        .screenshot('form-dark-theme', { padding: 20 })
      
      cy.get('[data-testid="badges-card"]')
        .screenshot('badges-dark-theme', { padding: 20 })
      
      // Capture full page in dark theme
      cy.screenshot('full-page-dark-theme', {
        capture: 'fullPage'
      })
    })
  })

  describe('Interaction State Visuals', () => {
    it('should capture loading and error states', () => {
      // Capture loading state button
      cy.get('[data-testid="btn-loading"]')
        .screenshot('button-loading-state')
      
      // Trigger and capture error alert
      cy.get('[data-testid="btn-destructive"]').click()
      cy.get('[data-testid="alerts-section"]')
        .screenshot('error-alert-visual')
      
      // Capture form validation errors
      cy.get('[data-testid="input-email"]')
        .type('invalid')
        .blur()
      
      cy.get('[data-testid="input-email"]')
        .screenshot('input-validation-error')
    })

    it('should capture focus and active states', () => {
      // Button focus states
      cy.get('[data-testid="btn-primary"]')
        .focus()
        .screenshot('button-focus-ring')
      
      // Input focus states
      cy.get('[data-testid="input-name"]')
        .focus()
        .screenshot('input-focus-state')
      
      // Checkbox focus and checked states
      cy.get('[data-testid="checkbox-subscribe"]')
        .focus()
        .screenshot('checkbox-focus-unchecked')
      
      cy.get('[data-testid="checkbox-subscribe"]')
        .check()
        .screenshot('checkbox-focus-checked')
    })

    it('should capture hover effects', () => {
      // Button hover effects
      const hoverElements = [
        { selector: '[data-testid="btn-primary"]', name: 'primary-button' },
        { selector: '[data-testid="btn-secondary"]', name: 'secondary-button' },
        { selector: '[data-testid="btn-outline"]', name: 'outline-button' },
        { selector: '[data-testid="pricing-card-basic"]', name: 'pricing-card-basic' },
        { selector: '[data-testid="pricing-card-pro"]', name: 'pricing-card-pro' }
      ]
      
      hoverElements.forEach(element => {
        cy.get(element.selector)
          .scrollIntoView()
          .trigger('mouseover')
          .screenshot(`${element.name}-hover-effect`)
          .trigger('mouseout')
      })
    })
  })

  describe('Form Workflow Visuals', () => {
    it('should capture complete form submission flow', () => {
      cy.get('[data-testid="form-card"]').scrollIntoView()
      
      // Step 1: Empty form
      cy.get('[data-testid="form-card"]')
        .screenshot('form-workflow-01-empty')
      
      // Step 2: Partially filled
      cy.get('[data-testid="input-name"]').type('Workflow User')
      cy.get('[data-testid="form-card"]')
        .screenshot('form-workflow-02-partial')
      
      // Step 3: Validation error
      cy.get('[data-testid="input-email"]').type('invalid').blur()
      cy.get('[data-testid="form-card"]')
        .screenshot('form-workflow-03-validation-error')
      
      // Step 4: Fixed and complete
      cy.get('[data-testid="input-email"]').clear().type('workflow@test.com')
      cy.get('[data-testid="textarea-message"]').type('Testing visual workflow')
      cy.get('[data-testid="form-card"]')
        .screenshot('form-workflow-04-complete')
      
      // Step 5: Submit and success
      cy.get('[data-testid="btn-submit"]').click()
      cy.get('[data-testid="alerts-section"]')
        .screenshot('form-workflow-05-success-alert')
    })
  })

  describe('Component Comparison Tests', () => {
    it('should capture component variations side by side', () => {
      // Capture all button variants in one shot for comparison
      cy.get('[data-testid="buttons-card"] .flex.gap-4.flex-wrap').first()
        .screenshot('button-variants-comparison')
      
      // Capture all badge variants for comparison
      cy.get('[data-testid="badges-card"] .flex.gap-2.flex-wrap').first()
        .screenshot('badge-variants-comparison')
    })
  })

  describe('Print and High Contrast Visuals', () => {
    it('should capture high contrast visuals', () => {
      // Simulate high contrast mode
      cy.get('html').then($html => {
        $html.addClass('high-contrast')
      })
      
      cy.wait(500)
      
      // Capture key components in high contrast
      cy.get('[data-testid="buttons-card"]')
        .screenshot('buttons-high-contrast')
      
      cy.get('[data-testid="form-card"]')
        .screenshot('form-high-contrast')
      
      cy.get('html').then($html => {
        $html.removeClass('high-contrast')
      })
    })

    it('should capture print styles', () => {
      // This would capture print-specific styles if implemented
      cy.get('body').then($body => {
        $body.addClass('print-preview')
      })
      
      cy.screenshot('print-layout', {
        capture: 'fullPage'
      })
      
      cy.get('body').then($body => {
        $body.removeClass('print-preview')
      })
    })
  })
})
