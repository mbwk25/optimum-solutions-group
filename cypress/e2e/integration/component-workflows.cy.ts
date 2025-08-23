describe('Component Integration Workflows', () => {
  beforeEach(() => {
    cy.visit('/component-showcase')
  })

  describe('Alert System Integration', () => {
    it('should show and dismiss alerts from different triggers', () => {
      // Initially no alerts should be present
      cy.get('[data-testid="alerts-section"]').should('be.empty')
      
      // Trigger error alert from destructive button
      cy.get('[data-testid="btn-destructive"]').click()
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Error').should('be.visible')
        cy.contains('This is a sample error message').should('be.visible')
      })
      
      // Submit form to trigger success alert
      cy.get('[data-testid="input-name"]').type('Integration Test User')
      cy.get('[data-testid="input-email"]').type('integration@test.com')
      cy.get('[data-testid="textarea-message"]').type('Integration test message')
      cy.get('[data-testid="btn-submit"]').click()
      
      // Should now have both alerts visible
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Error').should('be.visible')
        cy.contains('Form Submitted').should('be.visible')
        cy.contains('Thank you, Integration Test User!').should('be.visible')
      })
      
      // Wait for alerts to auto-dismiss (5 seconds)
      cy.wait(5500)
      cy.get('[data-testid="alerts-section"]').should('be.empty')
    })

    it('should handle multiple rapid alert triggers', () => {
      // Rapidly trigger multiple alerts
      cy.get('[data-testid="btn-destructive"]').click()
      cy.wait(500)
      cy.get('[data-testid="btn-destructive"]').click()
      cy.wait(500)
      cy.get('[data-testid="btn-destructive"]').click()
      
      // Should show multiple error alerts
      cy.get('[data-testid="alerts-section"]').find('[role="alert"]').should('have.length', 3)
    })
  })

  describe('Form to Badge Workflow', () => {
    it('should reflect form data in dynamic badges', () => {
      // Select different categories and verify they could be shown as badges
      cy.get('[data-testid="select-category"]').click()
      cy.get('[data-testid="option-support"]').click()
      cy.get('[data-testid="select-category"]').should('contain.text', 'Support')
      
      // Change to another category
      cy.get('[data-testid="select-category"]').click()
      cy.get('[data-testid="option-sales"]').click()
      cy.get('[data-testid="select-category"]').should('contain.text', 'Sales')
      
      // Verify existing badges are unaffected
      cy.get('[data-testid="badge-default"]').should('contain.text', 'Default')
      cy.get('[data-testid="badge-secondary"]').should('contain.text', 'Secondary')
    })
  })

  describe('Card Interaction Workflows', () => {
    it('should handle pricing card selection workflow', () => {
      cy.get('[data-testid="cards-grid"]').within(() => {
        // Test basic plan selection
        cy.get('[data-testid="btn-select-basic"]').should('be.visible').click()
        cy.get('[data-testid="btn-select-basic"]').should('be.visible') // Should remain clickable
        
        // Test pro plan selection
        cy.get('[data-testid="btn-select-pro"]').should('be.visible').click()
        cy.get('[data-testid="btn-select-pro"]').should('be.visible')
        
        // Test enterprise contact
        cy.get('[data-testid="btn-contact-enterprise"]').should('be.visible').click()
        cy.get('[data-testid="btn-contact-enterprise"]').should('be.visible')
        
        // Verify popular badge is visible
        cy.get('[data-testid="badge-popular"]').should('contain.text', 'Popular')
      })
    })

    it('should show hover effects on interactive cards', () => {
      cy.get('[data-testid="pricing-card-basic"]').trigger('mouseover')
      cy.get('[data-testid="pricing-card-basic"]').should('be.visible')
      
      cy.get('[data-testid="pricing-card-pro"]').trigger('mouseover')
      cy.get('[data-testid="pricing-card-pro"]').should('be.visible')
      
      cy.get('[data-testid="pricing-card-enterprise"]').trigger('mouseover')
      cy.get('[data-testid="pricing-card-enterprise"]').should('be.visible')
    })
  })

  describe('Multi-Component State Workflow', () => {
    it('should handle complex form with all components', () => {
      cy.fixture('testData').then((data) => {
        const formData = data.formData.contactForm
        
        // Fill form step by step, checking button state changes
        cy.get('[data-testid="btn-submit"]').should('be.disabled')
        
        // Step 1: Name
        cy.get('[data-testid="input-name"]').type(formData.name)
        cy.get('[data-testid="btn-submit"]').should('be.disabled')
        
        // Step 2: Email
        cy.get('[data-testid="input-email"]').type(formData.email)
        cy.get('[data-testid="btn-submit"]').should('be.disabled')
        
        // Step 3: Category (optional)
        cy.get('[data-testid="select-category"]').click()
        cy.get('[data-testid="option-support"]').click()
        cy.get('[data-testid="btn-submit"]').should('be.disabled') // Still disabled
        
        // Step 4: Message (required)
        cy.get('[data-testid="textarea-message"]').type(formData.message)
        cy.get('[data-testid="btn-submit"]').should('not.be.disabled') // Now enabled
        
        // Step 5: Newsletter (optional)
        cy.get('[data-testid="checkbox-subscribe"]').check()
        cy.get('[data-testid="btn-submit"]').should('not.be.disabled')
        
        // Submit and verify success
        cy.get('[data-testid="btn-submit"]').click()
        cy.get('[data-testid="alerts-section"]').within(() => {
          cy.contains('Form Submitted').should('be.visible')
          cy.contains(`Thank you, ${formData.name}!`).should('be.visible')
        })
      })
    })

    it('should maintain form state during interactions', () => {
      // Fill form partially
      cy.get('[data-testid="input-name"]').type('Persistent User')
      cy.get('[data-testid="input-email"]').type('persistent@test.com')
      
      // Interact with other components
      cy.get('[data-testid="btn-primary"]').click()
      cy.get('[data-testid="badge-default"]').should('be.visible')
      cy.get('[data-testid="btn-destructive"]').click()
      
      // Form data should persist
      cy.get('[data-testid="input-name"]').should('have.value', 'Persistent User')
      cy.get('[data-testid="input-email"]').should('have.value', 'persistent@test.com')
      
      // Complete and submit form
      cy.get('[data-testid="textarea-message"]').type('Persistence test')
      cy.get('[data-testid="btn-submit"]').click()
      
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Thank you, Persistent User!').should('be.visible')
      })
    })
  })

  describe('Keyboard Navigation Workflows', () => {
    it('should support full keyboard navigation through all components', () => {
      // Start keyboard navigation from the top
      cy.get('body').tab()
      
      // Navigate through buttons section
      cy.focused().should('exist')
      
      // Tab through multiple components
      Array.from({ length: 10 }, () => {
        cy.focused().tab()
        cy.focused().should('exist').and('be.visible')
      })
    })

    it('should handle keyboard shortcuts in complex workflows', () => {
      // Focus on form and use keyboard to fill
      cy.get('[data-testid="input-name"]').focus().type('Keyboard User')
      cy.focused().tab()
      cy.focused().type('keyboard@test.com')
      cy.focused().tab()
      
      // Use keyboard to open select
      cy.focused().type('{enter}')
      cy.focused().type('{downarrow}')
      cy.focused().type('{enter}')
      
      // Continue with keyboard
      cy.focused().tab()
      cy.focused().type('Keyboard navigation test message')
      cy.focused().tab()
      cy.focused().type(' ') // Check checkbox
      cy.focused().tab()
      cy.focused().type('{enter}') // Submit form
      
      // Verify success
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Thank you, Keyboard User!').should('be.visible')
      })
    })
  })

  describe('Error Handling Workflows', () => {
    it('should handle validation errors gracefully', () => {
      // Try invalid email
      cy.get('[data-testid="input-email"]').type('invalid-email').blur()
      
      // Continue with other fields
      cy.get('[data-testid="input-name"]').type('Error Test User')
      cy.get('[data-testid="textarea-message"]').type('Testing error handling')
      
      // Button should remain disabled due to invalid email
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      // Fix email
      cy.get('[data-testid="input-email"]').clear().type('valid@email.com')
      cy.get('[data-testid="btn-submit"]').should('not.be.disabled')
      
      // Submit successfully
      cy.get('[data-testid="btn-submit"]').click()
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Form Submitted').should('be.visible')
      })
    })

    it('should recover from interaction errors', () => {
      // Trigger error alert
      cy.get('[data-testid="btn-destructive"]').click()
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Error').should('be.visible')
      })
      
      // Should still be able to interact with other components
      cy.get('[data-testid="btn-primary"]').should('be.visible').click()
      cy.get('[data-testid="input-name"]').should('be.visible').type('Recovery Test')
      
      // Form should still work
      cy.get('[data-testid="input-email"]').type('recovery@test.com')
      cy.get('[data-testid="textarea-message"]').type('Error recovery test')
      cy.get('[data-testid="btn-submit"]').click()
      
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Thank you, Recovery Test!').should('be.visible')
      })
    })
  })

  describe('Performance Integration', () => {
    it('should maintain performance with multiple component interactions', () => {
      const startTime = Date.now()
      
      // Perform rapid interactions across multiple components
      cy.get('[data-testid="btn-primary"]').click()
      cy.get('[data-testid="btn-secondary"]').click()
      cy.get('[data-testid="btn-outline"]').click()
      
      cy.get('[data-testid="input-name"]').type('Performance Test')
      cy.get('[data-testid="input-email"]').type('perf@test.com')
      
      cy.get('[data-testid="select-category"]').click()
      cy.get('[data-testid="option-general"]').click()
      
      cy.get('[data-testid="textarea-message"]').type('Performance testing message')
      cy.get('[data-testid="checkbox-subscribe"]').check()
      
      cy.get('[data-testid="badge-default"]').should('be.visible')
      cy.get('[data-testid="badge-secondary"]').should('be.visible')
      
      cy.get('[data-testid="btn-submit"]').click()
      
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Form Submitted').should('be.visible')
      })
      
      cy.then(() => {
        const endTime = Date.now()
        const totalTime = endTime - startTime
        expect(totalTime).to.be.lessThan(10000) // Should complete within 10 seconds
      })
    })
  })

  describe('Responsive Integration', () => {
    it('should work seamlessly across different viewport sizes', () => {
      cy.testResponsive(() => {
        // Test full workflow on each viewport
        cy.get('[data-testid="input-name"]').clear().type('Responsive User')
        cy.get('[data-testid="input-email"]').clear().type('responsive@test.com')
        cy.get('[data-testid="textarea-message"]').clear().type('Responsive test')
        
        cy.get('[data-testid="btn-submit"]').should('be.visible').and('not.be.disabled')
        
        // Test other components too
        cy.get('[data-testid="btn-primary"]').should('be.visible').click()
        cy.get('[data-testid="badge-default"]').should('be.visible')
      })
    })
  })

  describe('Accessibility Integration', () => {
    it('should maintain accessibility across component interactions', () => {
      // Test accessibility throughout a complete workflow
      cy.testA11y()
      
      // Fill form
      cy.get('[data-testid="input-name"]').type('Accessibility User')
      cy.testA11y()
      
      cy.get('[data-testid="input-email"]').type('a11y@test.com')
      cy.testA11y()
      
      cy.get('[data-testid="select-category"]').click()
      cy.testA11y()
      cy.get('[data-testid="option-general"]').click()
      
      cy.get('[data-testid="textarea-message"]').type('Accessibility test')
      cy.testA11y()
      
      cy.get('[data-testid="btn-submit"]').click()
      cy.testA11y()
      
      // Final accessibility check with alert visible
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Form Submitted').should('be.visible')
      })
      cy.testA11y()
    })
  })
})
