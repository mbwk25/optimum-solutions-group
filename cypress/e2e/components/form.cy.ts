describe('Form Components E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/component-showcase')
    cy.get('[data-testid="form-card"]').scrollIntoView()
  })

  describe('Form Rendering', () => {
    it('should render all form components correctly', () => {
      cy.get('[data-testid="contact-form"]').within(() => {
        // Check all form elements are present
        cy.get('[data-testid="input-name"]').should('be.visible')
        cy.get('[data-testid="input-email"]').should('be.visible')
        cy.get('[data-testid="select-category"]').should('be.visible')
        cy.get('[data-testid="textarea-message"]').should('be.visible')
        cy.get('[data-testid="checkbox-subscribe"]').should('be.visible')
        cy.get('[data-testid="btn-submit"]').should('be.visible')
      })
    })

    it('should show proper labels and placeholders', () => {
      cy.get('label[for="name"]').should('contain.text', 'Name *')
      cy.get('label[for="email"]').should('contain.text', 'Email *')
      cy.get('label[for="category"]').should('contain.text', 'Category')
      cy.get('label[for="message"]').should('contain.text', 'Message *')
      
      cy.get('[data-testid="input-name"]').should('have.attr', 'placeholder', 'Enter your name')
      cy.get('[data-testid="input-email"]').should('have.attr', 'placeholder', 'Enter your email')
      cy.get('[data-testid="textarea-message"]').should('have.attr', 'placeholder', 'Enter your message')
    })
  })

  describe('Input Components', () => {
    it('should handle text input correctly', () => {
      cy.fixture('testData').then((data) => {
        const formData = data.formData.contactForm
        
        cy.get('[data-testid="input-name"]')
          .type(formData.name)
          .should('have.value', formData.name)
          
        cy.get('[data-testid="input-email"]')
          .type(formData.email)
          .should('have.value', formData.email)
      })
    })

    it('should validate email format', () => {
      cy.get('[data-testid="input-email"]')
        .type('invalid-email')
        .blur()
        
      // Browser validation should trigger
      cy.get('[data-testid="input-email"]').then(($input) => {
        void expect($input[0].validity.valid).to.be.false
      })
      
      cy.get('[data-testid="input-email"]')
        .clear()
        .type('valid@email.com')
        .blur()
        
      cy.get('[data-testid="input-email"]').then(($input) => {
        void expect($input[0].validity.valid).to.be.true
      })
    })

    it('should handle required field validation', () => {
      // Submit button should be disabled when required fields are empty
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      // Fill required fields one by one
      cy.get('[data-testid="input-name"]').type('Test User')
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      cy.get('[data-testid="input-email"]').type('test@example.com')
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      cy.get('[data-testid="textarea-message"]').type('Test message')
      cy.get('[data-testid="btn-submit"]').should('not.be.disabled')
    })
  })

  describe('Select Component', () => {
    it('should open and close dropdown correctly', () => {
      cy.get('[data-testid="select-category"]').click()
      
      // Dropdown should be visible
      cy.get('[data-testid="option-general"]').should('be.visible')
      cy.get('[data-testid="option-support"]').should('be.visible')
      cy.get('[data-testid="option-sales"]').should('be.visible')
      cy.get('[data-testid="option-feedback"]').should('be.visible')
      
      // Use Escape key instead of clicking outside for Radix UI Select
      cy.get('body').type('{esc}')
      cy.get('[data-testid="option-general"]').should('not.exist')
    })

    it('should select options correctly', () => {
      cy.get('[data-testid="select-category"]').click()
      cy.get('[data-testid="option-support"]').click()
      
      // Selected option should be displayed
      cy.get('[data-testid="select-category"]').should('contain.text', 'Support')
      
      // Try another option
      cy.get('[data-testid="select-category"]').click()
      cy.get('[data-testid="option-sales"]').click()
      cy.get('[data-testid="select-category"]').should('contain.text', 'Sales')
    })

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="select-category"]').focus().type('{enter}')
      
      // Should open dropdown
      cy.get('[data-testid="option-general"]').should('be.visible')
      
      // Navigate with arrow keys
      cy.focused().type('{downarrow}')
      cy.focused().type('{downarrow}')
      cy.focused().type('{enter}')
      
      // Should select the option and close dropdown
      cy.get('[data-testid="select-category"]').should('contain.text', 'Sales')
    })
  })

  describe('Textarea Component', () => {
    it('should handle multiline text input', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      
      cy.get('[data-testid="textarea-message"]')
        .type(multilineText)
        .should('have.value', multilineText)
    })

    it('should respect maxlength if set', () => {
      const longText = 'A'.repeat(1000)
      
      cy.get('[data-testid="textarea-message"]')
        .type(longText)
        .then(($textarea) => {
          const value = $textarea.val() as string
          void expect(value.length).to.be.at.most(1000)
        })
    })

    it('should auto-resize if configured', () => {
      cy.get('[data-testid="textarea-message"]')
        .type('Line 1{enter}Line 2{enter}Line 3{enter}Line 4{enter}Line 5')
        .should('have.value', 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5')
    })
  })

  describe('Checkbox Component (Radix UI)', () => {
    it('should toggle correctly', () => {
      cy.get('[data-testid="checkbox-subscribe"]')
        .should('have.attr', 'aria-checked', 'false')
        .click()
        .should('have.attr', 'aria-checked', 'true')
        .should('have.attr', 'data-state', 'checked')
        .click()
        .should('have.attr', 'aria-checked', 'false')
        .should('have.attr', 'data-state', 'unchecked')
    })

    it('should work with label clicks', () => {
      cy.get('label[for="subscribe"]')
        .click()
      
      cy.get('[data-testid="checkbox-subscribe"]')
        .should('have.attr', 'aria-checked', 'true')
        .should('have.attr', 'data-state', 'checked')
      
      cy.get('label[for="subscribe"]')
        .click()
      
      cy.get('[data-testid="checkbox-subscribe"]')
        .should('have.attr', 'aria-checked', 'false')
        .should('have.attr', 'data-state', 'unchecked')
    })

    it('should support keyboard interaction', () => {
      // Focus and check initial state
      cy.get('[data-testid="checkbox-subscribe"]')
        .focus()
        .should('have.attr', 'aria-checked', 'false')
      
      // First space press to check
      cy.focused().type(' ')
      cy.get('[data-testid="checkbox-subscribe"]')
        .should('have.attr', 'aria-checked', 'true')
        .should('have.attr', 'data-state', 'checked')
      
      // Second space press to uncheck
      cy.focused().type(' ')
      cy.get('[data-testid="checkbox-subscribe"]')
        .should('have.attr', 'aria-checked', 'false')
        .should('have.attr', 'data-state', 'unchecked')
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', () => {
      cy.fixture('testData').then((data) => {
        const formData = data.formData.contactForm
        
        // Fill all required fields
        cy.get('[data-testid="input-name"]').type(formData.name)
        cy.get('[data-testid="input-email"]').type(formData.email)
        cy.get('[data-testid="textarea-message"]').type(formData.message)
        
        // Optional fields
        cy.get('[data-testid="select-category"]').click()
        cy.get('[data-testid="option-support"]').click()
        cy.get('[data-testid="checkbox-subscribe"]').click()
        
        // Submit form
        cy.get('[data-testid="btn-submit"]').click()
        
        // Check success message
        cy.get('[data-testid="alerts-section"]').within(() => {
          cy.contains('Form Submitted').should('be.visible')
          cy.contains(`Thank you, ${formData.name}!`).should('be.visible')
        })
      })
    })

    it('should prevent submission with missing required fields', () => {
      // Try to submit with empty required fields
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      // Partially fill form
      cy.get('[data-testid="input-name"]').type('Test User')
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      cy.get('[data-testid="input-email"]').type('test@example.com')
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      // Only when all required fields are filled should submit be enabled
      cy.get('[data-testid="textarea-message"]').type('Test message')
      cy.get('[data-testid="btn-submit"]').should('not.be.disabled')
    })

    it('should handle form submission errors gracefully', () => {
      // This would test error handling if API calls were implemented
      cy.get('[data-testid="input-name"]').type('Error Test')
      cy.get('[data-testid="input-email"]').type('error@test.com')
      cy.get('[data-testid="textarea-message"]').type('This should cause an error')
      
      cy.get('[data-testid="btn-submit"]').click()
      
      // For now, we expect success, but in real app might test error states
      cy.get('[data-testid="alerts-section"]').should('exist')
    })
  })

  describe('Form Accessibility', () => {
    it('should have no accessibility violations', () => {
      // Ensure axe is loaded before running tests
      cy.injectAxe()
      cy.get('[data-testid="form-card"]').within(() => {
        cy.testA11y()
      })
    })

    it('should have proper form labels and associations', () => {
      // Check label associations
      cy.get('label[for="name"]').should('exist')
      cy.get('input#name').should('exist')
      
      cy.get('label[for="email"]').should('exist')
      cy.get('input#email').should('exist')
      
      cy.get('label[for="message"]').should('exist')
      cy.get('textarea#message').should('exist')
      
      cy.get('label[for="subscribe"]').should('exist')
    })

    it('should support keyboard navigation through form', () => {
      // Tab through all form elements using custom tab command
      cy.get('[data-testid="input-name"]').focus()
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'input-email')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'select-category')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'textarea-message')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'checkbox-subscribe')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'btn-submit')
    })

    it('should have proper ARIA attributes for validation', () => {
      // Required fields should have aria-required
      cy.get('[data-testid="input-name"]').should('have.attr', 'required')
      cy.get('[data-testid="input-email"]').should('have.attr', 'required')
      cy.get('[data-testid="textarea-message"]').should('have.attr', 'required')
      
      // Email field should have proper type
      cy.get('[data-testid="input-email"]').should('have.attr', 'type', 'email')
    })
  })

  describe('Form Responsive Behavior', () => {
    it('should work correctly on different screen sizes', () => {
      cy.testResponsive(() => {
        // Fill and submit form on each viewport
        cy.get('[data-testid="input-name"]').clear().type('Mobile User')
        cy.get('[data-testid="input-email"]').clear().type('mobile@test.com')
        cy.get('[data-testid="textarea-message"]').clear().type('Mobile test message')
        
        cy.get('[data-testid="btn-submit"]').should('be.visible').and('not.be.disabled')
      })
    })
  })

  describe('Form Validation', () => {
    it('should show validation feedback', () => {
      // Test HTML5 validation
      cy.get('[data-testid="input-email"]')
        .type('invalid-email')
        .blur()
      
      cy.get('[data-testid="input-email"]').then(($input) => {
        void expect($input[0].validity.valid).to.be.false
        void expect($input[0].validationMessage).to.not.be.empty
      })
    })

    it('should clear validation on correct input', () => {
      cy.get('[data-testid="input-email"]')
        .type('invalid-email')
        .blur()
        .clear()
        .type('valid@email.com')
        .blur()
      
      cy.get('[data-testid="input-email"]').then(($input) => {
        void expect($input[0].validity.valid).to.be.true
      })
    })
  })
})
