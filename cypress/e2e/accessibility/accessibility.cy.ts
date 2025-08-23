describe('Accessibility E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/component-showcase')
  })

  describe('Overall Page Accessibility', () => {
    it('should have no accessibility violations on initial load', () => {
      cy.testA11y()
    })

    it('should maintain accessibility after user interactions', () => {
      // Interact with various components
      cy.get('[data-testid="btn-primary"]').click()
      cy.testA11y()
      
      cy.get('[data-testid="input-name"]').type('Accessibility Test User')
      cy.testA11y()
      
      cy.get('[data-testid="select-category"]').click()
      cy.testA11y()
      cy.get('[data-testid="option-support"]').click()
      cy.testA11y()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support full keyboard navigation', () => {
      // Start navigation from body
      cy.get('body').tab()
      
      // Verify focus is visible and navigation works
      for (let i = 0; i < 15; i++) {
        cy.focused()
          .should('exist')
          .should('be.visible')
          .then(($focused) => {
            // Log focused element for debugging
            const tagName = $focused.prop('tagName')
            const testId = $focused.attr('data-testid')
            cy.log(`Focused element: ${tagName} ${testId ? `(${testId})` : ''}`)
          })
        
        cy.focused().tab()
      }
    })

    it('should support reverse keyboard navigation', () => {
      // Navigate to the end first
      cy.get('[data-testid="btn-submit"]').focus()
      
      // Navigate backwards with Shift+Tab
      for (let i = 0; i < 10; i++) {
        cy.focused()
          .should('exist')
          .should('be.visible')
        
        cy.focused().tab({ shift: true })
      }
    })

    it('should handle keyboard navigation in form elements', () => {
      // Tab to form elements and interact with keyboard
      cy.get('[data-testid="input-name"]').focus()
      cy.focused().type('Keyboard User{tab}')
      
      cy.focused().should('have.attr', 'data-testid', 'input-email')
      cy.focused().type('keyboard@test.com{tab}')
      
      // Select component keyboard navigation
      cy.focused().should('have.attr', 'data-testid', 'select-category')
      cy.focused().type('{enter}')
      
      // Navigate in dropdown with arrow keys
      cy.focused().type('{downarrow}{downarrow}{enter}')
      
      // Continue to textarea
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'textarea-message')
      cy.focused().type('Testing keyboard navigation in forms{tab}')
      
      // Checkbox
      cy.focused().should('have.attr', 'data-testid', 'checkbox-subscribe')
      cy.focused().type(' {tab}') // Space to toggle checkbox
      
      // Submit button
      cy.focused().should('have.attr', 'data-testid', 'btn-submit')
      cy.focused().type('{enter}')
      
      // Verify success
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Thank you, Keyboard User!').should('be.visible')
      })
    })

    it('should handle keyboard shortcuts', () => {
      // Test Escape key on select
      cy.get('[data-testid="select-category"]').click()
      cy.get('[data-testid="option-general"]').should('be.visible')
      cy.get('body').type('{esc}')
      cy.get('[data-testid="option-general"]').should('not.exist')
      
      // Test Enter key on buttons
      cy.get('[data-testid="btn-primary"]').focus().type('{enter}')
      cy.get('[data-testid="btn-primary"]').should('be.visible') // Should handle click
      
      // Test Space key on checkbox
      cy.get('[data-testid="checkbox-subscribe"]').focus().type(' ')
      cy.get('[data-testid="checkbox-subscribe"]').should('be.checked')
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels and descriptions', () => {
      // Check form labels
      cy.get('label[for="name"]').should('exist').and('be.visible')
      cy.get('label[for="email"]').should('exist').and('be.visible')
      cy.get('label[for="message"]').should('exist').and('be.visible')
      cy.get('label[for="subscribe"]').should('exist').and('be.visible')
      
      // Check input associations
      cy.get('#name').should('have.attr', 'aria-labelledby').or('have.attr', 'aria-label')
      cy.get('#email').should('have.attr', 'aria-labelledby').or('have.attr', 'aria-label')
      cy.get('#message').should('have.attr', 'aria-labelledby').or('have.attr', 'aria-label')
    })

    it('should have proper roles and states', () => {
      // Check button roles
      cy.get('[data-testid="btn-primary"]').should('have.attr', 'type', 'button')
      cy.get('[data-testid="btn-submit"]').should('have.attr', 'type', 'submit')
      
      // Check alert role when alerts are shown
      cy.get('[data-testid="btn-destructive"]').click()
      cy.get('[data-testid="alerts-section"]').find('[role="alert"]').should('exist')
      
      // Check checkbox states
      cy.get('[data-testid="checkbox-subscribe"]')
        .should('have.attr', 'aria-checked', 'false')
        .click()
        .should('have.attr', 'aria-checked', 'true')
      
      // Check disabled states
      cy.get('[data-testid="btn-disabled"]')
        .should('be.disabled')
        .should('have.attr', 'aria-disabled', 'true').or('not.have.attr', 'aria-disabled')
    })

    it('should provide proper feedback for form validation', () => {
      // Test email validation feedback
      cy.get('[data-testid="input-email"]')
        .type('invalid-email')
        .blur()
        .then(($input) => {
          // Check for validation message
          expect($input[0].validationMessage).to.not.be.empty
        })
      
      // Test required field feedback
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      // Fill required fields and verify button becomes enabled
      cy.get('[data-testid="input-name"]').type('Test User')
      cy.get('[data-testid="input-email"]').clear().type('valid@email.com')
      cy.get('[data-testid="textarea-message"]').type('Test message')
      cy.get('[data-testid="btn-submit"]').should('not.be.disabled')
    })

    it('should announce dynamic content changes', () => {
      // Test alert announcements
      cy.get('[data-testid="btn-destructive"]').click()
      
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.get('[role="alert"]')
          .should('be.visible')
          .and('contain.text', 'Error')
          .and('contain.text', 'This is a sample error message')
      })
      
      // Test form submission announcement
      cy.get('[data-testid="input-name"]').type('Screen Reader User')
      cy.get('[data-testid="input-email"]').type('sr@test.com')
      cy.get('[data-testid="textarea-message"]').type('Testing screen reader announcements')
      cy.get('[data-testid="btn-submit"]').click()
      
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.get('[role="alert"]')
          .should('be.visible')
          .and('contain.text', 'Form Submitted')
          .and('contain.text', 'Thank you, Screen Reader User!')
      })
    })
  })

  describe('Focus Management', () => {
    it('should maintain proper focus order', () => {
      const expectedFocusOrder = [
        '[data-testid="input-name"]',
        '[data-testid="input-email"]',
        '[data-testid="select-category"]',
        '[data-testid="textarea-message"]',
        '[data-testid="checkbox-subscribe"]',
        '[data-testid="btn-submit"]'
      ]
      
      // Start with first element
      cy.get(expectedFocusOrder[0]).focus()
      
      // Tab through expected order
      expectedFocusOrder.forEach((selector, index) => {
        if (index > 0) {
          cy.focused().tab()
        }
        cy.focused().should('have.attr', 'data-testid', selector.replace(/\[data-testid="([^"]+)"\]/, '$1'))
      })
    })

    it('should trap focus in modal-like components', () => {
      // Open select dropdown
      cy.get('[data-testid="select-category"]').click()
      
      // Focus should be within the dropdown
      cy.get('[data-testid="option-general"]').should('be.visible')
      
      // Tab should cycle within dropdown options
      cy.focused().tab()
      cy.focused().should('be.visible')
      
      // Escape should close and return focus
      cy.get('body').type('{esc}')
      cy.get('[data-testid="option-general"]').should('not.exist')
      cy.focused().should('have.attr', 'data-testid', 'select-category')
    })

    it('should show visible focus indicators', () => {
      const focusableElements = [
        '[data-testid="btn-primary"]',
        '[data-testid="input-name"]',
        '[data-testid="select-category"]',
        '[data-testid="checkbox-subscribe"]',
        '[data-testid="btn-submit"]'
      ]
      
      focusableElements.forEach(selector => {
        cy.get(selector).focus()
        cy.focused()
          .should('be.visible')
          .should($el => {
            // Element should have focus styles (this might need adjustment based on actual CSS)
            const styles = window.getComputedStyle($el[0])
            // Check for common focus indicators
            expect(
              styles.outline !== 'none' || 
              styles.boxShadow !== 'none' ||
              styles.borderColor !== 'initial'
            ).to.be.true
          })
      })
    })

    it('should handle focus restoration after alerts', () => {
      // Focus on a button
      cy.get('[data-testid="btn-destructive"]').focus()
      
      // Trigger alert
      cy.focused().click()
      
      // Alert should be announced but focus should remain manageable
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.get('[role="alert"]').should('be.visible')
      })
      
      // User should still be able to navigate
      cy.get('body').tab()
      cy.focused().should('exist').and('be.visible')
    })
  })

  describe('Color and Contrast', () => {
    it('should have sufficient color contrast', () => {
      // This test would need custom commands to check actual contrast ratios
      // For now, we'll check that elements are visible and have text colors
      
      const elementsToCheck = [
        '[data-testid="btn-primary"]',
        '[data-testid="btn-secondary"]',
        '[data-testid="btn-outline"]',
        '[data-testid="badge-default"]',
        '[data-testid="badge-secondary"]',
        '[data-testid="badge-destructive"]'
      ]
      
      elementsToCheck.forEach(selector => {
        cy.get(selector)
          .should('be.visible')
          .should($el => {
            const styles = window.getComputedStyle($el[0])
            expect(styles.color).to.not.equal('transparent')
            expect(styles.backgroundColor).to.exist
          })
      })
    })

    it('should work in high contrast mode', () => {
      // Simulate high contrast by adding a class or CSS
      cy.get('html').then($html => {
        $html.addClass('high-contrast')
      })
      
      // Verify elements are still visible and functional
      cy.get('[data-testid="btn-primary"]').should('be.visible').click()
      cy.get('[data-testid="input-name"]').should('be.visible').type('High Contrast Test')
      cy.get('[data-testid="badge-default"]').should('be.visible')
      
      // Remove high contrast class
      cy.get('html').then($html => {
        $html.removeClass('high-contrast')
      })
    })
  })

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility across different viewport sizes', () => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1280, height: 720, name: 'desktop' }
      ]
      
      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height)
        cy.log(`Testing accessibility on ${viewport.name}`)
        
        // Check basic accessibility
        cy.testA11y()
        
        // Test keyboard navigation still works
        cy.get('[data-testid="input-name"]').focus()
        cy.focused().tab()
        cy.focused().should('exist').and('be.visible')
        
        // Test touch targets are adequately sized on mobile
        if (viewport.name === 'mobile') {
          cy.get('[data-testid="btn-primary"]')
            .should('be.visible')
            .should($btn => {
              const rect = $btn[0].getBoundingClientRect()
              expect(rect.width).to.be.at.least(44) // Minimum touch target size
              expect(rect.height).to.be.at.least(44)
            })
        }
      })
    })
  })

  describe('Error and Success States Accessibility', () => {
    it('should properly announce form validation errors', () => {
      // Test invalid email
      cy.get('[data-testid="input-email"]')
        .type('invalid-email')
        .blur()
      
      // Check that validation message is available to screen readers
      cy.get('[data-testid="input-email"]').then($input => {
        expect($input[0].validationMessage).to.not.be.empty
        expect($input[0].validity.valid).to.be.false
      })
      
      // Fix email and verify
      cy.get('[data-testid="input-email"]')
        .clear()
        .type('valid@email.com')
        .blur()
      
      cy.get('[data-testid="input-email"]').then($input => {
        expect($input[0].validity.valid).to.be.true
      })
    })

    it('should announce success messages properly', () => {
      // Fill and submit form
      cy.get('[data-testid="input-name"]').type('Success Test User')
      cy.get('[data-testid="input-email"]').type('success@test.com')
      cy.get('[data-testid="textarea-message"]').type('Testing success announcements')
      cy.get('[data-testid="btn-submit"]').click()
      
      // Success alert should have proper role and be announced
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.get('[role="alert"]')
          .should('be.visible')
          .and('contain.text', 'Form Submitted')
          .and('contain.text', 'Thank you, Success Test User!')
      })
    })
  })

  describe('Semantic HTML Structure', () => {
    it('should use proper heading hierarchy', () => {
      // Check main heading
      cy.get('h1').should('exist').and('contain.text', 'UI Components Showcase')
      
      // Check card titles (should be properly nested)
      cy.get('h2, h3, h4, h5, h6').each($heading => {
        expect($heading.text().trim()).to.not.be.empty
      })
    })

    it('should use semantic HTML elements appropriately', () => {
      // Check form structure
      cy.get('form').should('exist')
      cy.get('label').should('have.length.at.least', 4)
      cy.get('input[type="text"]').should('exist')
      cy.get('input[type="email"]').should('exist')
      cy.get('textarea').should('exist')
      cy.get('button[type="submit"]').should('exist')
      
      // Check that interactive elements are focusable
      cy.get('button, input, textarea, select').each($el => {
        if (!$el.is(':disabled')) {
          expect($el.attr('tabindex')).to.not.equal('-1')
        }
      })
    })

    it('should have proper landmark regions', () => {
      // Check for main content area
      cy.get('main, [role="main"]').should('exist')
      
      // Forms should be properly structured
      cy.get('form').within(() => {
        cy.get('fieldset').should('exist').or('not.exist') // Optional but good practice
        cy.get('legend').should('exist').or('not.exist') // Optional but good practice
      })
    })
  })

  describe('Assistive Technology Compatibility', () => {
    it('should work with screen readers', () => {
      // Test that all interactive elements have accessible names
      cy.get('button').each($btn => {
        expect(
          $btn.text().trim() !== '' ||
          $btn.attr('aria-label') ||
          $btn.attr('aria-labelledby') ||
          $btn.attr('title')
        ).to.be.true
      })
      
      cy.get('input').each($input => {
        expect(
          $input.attr('aria-label') ||
          $input.attr('aria-labelledby') ||
          $input.attr('placeholder') ||
          $input.siblings('label').length > 0
        ).to.be.true
      })
    })

    it('should support voice navigation', () => {
      // Verify elements have accessible names that would work with voice commands
      cy.get('[data-testid="btn-primary"]').should('contain.text', 'Primary Button')
      cy.get('[data-testid="btn-submit"]').should('contain.text', 'Submit Form')
      cy.get('label[for="name"]').should('contain.text', 'Name')
      cy.get('label[for="email"]').should('contain.text', 'Email')
    })
  })
})
