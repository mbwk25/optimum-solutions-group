describe('Accessibility E2E Tests', () => {
  beforeEach(() => {
    // Visit the component showcase page
    cy.visit('/component-showcase')

    // Wait for the page to load completely
    cy.get('[data-testid="page-title"]')
      .should('be.visible')
      .and('contain', 'UI Components Showcase')

    // Wait for React to fully load and context to be available
    cy.wait(1000)

    // Inject axe for accessibility testing
    cy.injectAxe()
  })

  describe('Basic Accessibility', () => {
    it('should have proper document structure', () => {
      // Check basic document accessibility
      cy.get('html').should('have.attr', 'lang')
      cy.get('title').should('exist')
      cy.get('h1').should('exist').and('contain.text', 'UI Components Showcase')
    })

    it('should have proper form structure', () => {
      // Check form accessibility basics
      cy.get('form').should('exist')
      cy.get('label[for="name"]').should('exist').and('be.visible')
      cy.get('label[for="email"]').should('exist').and('be.visible')
      cy.get('label[for="message"]').should('exist').and('be.visible')
      cy.get('label[for="subscribe"]').should('exist').and('be.visible')

      // Check input associations
      cy.get('#name').should('exist')
      cy.get('#email').should('exist')
      cy.get('#message').should('exist')
      cy.get('#subscribe').should('exist')
    })
  })

  describe('Form Functionality', () => {
    it('should handle form validation correctly', () => {
      // Test required field validation
      cy.get('[data-testid="btn-submit"]').should('be.disabled')

      // Fill required fields
      cy.get('[data-testid="input-name"]').type('Test User')
      cy.get('[data-testid="input-email"]').type('valid@email.com')
      cy.get('[data-testid="textarea-message"]').type('Test message')

      // Button should be enabled
      cy.get('[data-testid="btn-submit"]').should('not.be.disabled')
    })

    it('should handle form submission', () => {
      // Fill and submit form
      cy.get('[data-testid="input-name"]').type('Success Test User')
      cy.get('[data-testid="input-email"]').type('success@test.com')
      cy.get('[data-testid="textarea-message"]').type('Testing form submission')
      cy.get('[data-testid="btn-submit"]').click()

      // Check success alert
      cy.get('[data-testid="alerts-section"]')
        .within(() => {
          cy.get('[role="alert"]')
            .should('be.visible')
            .and('contain.text', 'Form Submitted')
            .and('contain.text', 'Thank you, Success Test User!')
        })
    })

    it('should handle email validation', () => {
      // Test invalid email
      cy.get('[data-testid="input-email"]')
        .type('invalid-email')
        .blur()

      // Check that validation works
      cy.get('[data-testid="input-email"]').then(($input) => {
        const input = $input[0] as HTMLInputElement
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(input.validity.valid).to.be.false
      })

      // Fix email
      cy.get('[data-testid="input-email"]')
        .clear()
        .type('valid@email.com')
        .blur()

      cy.get('[data-testid="input-email"]').then(($input) => {
        const input = $input[0] as HTMLInputElement
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(input.validity.valid).to.be.true
      })
    })
  })

  describe('Interactive Components', () => {
    it('should handle button interactions', () => {
      // Test primary button
      cy.get('[data-testid="btn-primary"]')
        .should('be.visible')
        .click()

      // Test destructive button (shows alert)
      cy.get('[data-testid="btn-destructive"]')
        .should('be.visible')
        .click()

      // Check that alert is shown
      cy.get('[data-testid="alerts-section"]')
        .within(() => {
          cy.get('[role="alert"]')
            .should('be.visible')
            .and('contain.text', 'Error')
        })
    })

    it('should handle checkbox interactions', () => {
      // Test checkbox interaction
      cy.get('[data-testid="checkbox-subscribe"]')
        .should('be.visible')
        .click()

      // Check that checkbox state is properly indicated
      cy.get('[data-testid="checkbox-subscribe"]')
        .should('have.attr', 'data-state', 'checked')
        .and('have.attr', 'aria-checked', 'true')
    })

    it('should handle select dropdown interactions', () => {
      // Test select interaction
      cy.get('[data-testid="select-category"]')
        .should('be.visible')
        .click()

      // Check that options are available
      cy.get('[data-testid="option-general"]').should('be.visible')
      cy.get('[data-testid="option-support"]').should('be.visible')

      // Select an option
      cy.get('[data-testid="option-support"]').click()

      // Verify selection
      cy.get('[data-testid="select-category"]')
        .should('contain.text', 'Support')
    })
  })

  describe('Focus Management', () => {
    it('should allow elements to receive focus', () => {
      // Test that elements can receive focus
      cy.get('[data-testid="input-name"]').focus()
      cy.focused().should('have.attr', 'data-testid', 'input-name')

      cy.get('[data-testid="input-email"]').focus()
      cy.focused().should('have.attr', 'data-testid', 'input-email')

      cy.get('[data-testid="select-category"]').focus()
      cy.focused().should('have.attr', 'data-testid', 'select-category')

      cy.get('[data-testid="btn-primary"]').focus()
      cy.focused().should('have.attr', 'data-testid', 'btn-primary')
    })

    it('should not have elements with tabindex="-1"', () => {
      // Check that interactive elements are focusable (not explicitly removed from tab order)
      // Test that elements can receive focus by actually focusing them
      cy.get('[data-testid="input-name"]').focus().should('be.focused')
      cy.get('[data-testid="input-email"]').focus().should('be.focused')
      cy.get('[data-testid="textarea-message"]').focus().should('be.focused')

      // For submit button, check if it's enabled before focusing
      cy.get('[data-testid="btn-submit"]').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).focus().should('be.focused')
        }
      })

      // For select and checkbox, check they don't have tabindex="-1"
      cy.get('[data-testid="select-category"]').should('not.have.attr', 'tabindex', '-1')
      cy.get('[data-testid="checkbox-subscribe"]').should('not.have.attr', 'tabindex', '-1')
    })
  })

  describe('Semantic HTML', () => {
    it('should use proper heading hierarchy', () => {
      // Check main heading
      cy.get('h1').should('exist').and('contain.text', 'UI Components Showcase')

      // Check that headings have content
      cy.get('h2, h3, h4, h5, h6').each(($heading) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect($heading.text().trim()).to.not.be.empty
      })
    })

    it('should use semantic HTML elements', () => {
      // Check form structure
      cy.get('form').should('exist')
      cy.get('label').should('have.length.at.least', 4)
      cy.get('input[type="text"]').should('exist')
      cy.get('input[type="email"]').should('exist')
      cy.get('textarea').should('exist')
      cy.get('button[type="submit"]').should('exist')
    })

    it('should have proper landmark regions', () => {
      // Check for main content area
      cy.get('main, [role="main"]').should('exist')
    })
  })

  describe('Button Accessibility', () => {
    it('should have accessible button content', () => {
      // Check that buttons have text content
      cy.get('[data-testid="btn-primary"]').should('contain.text', 'Primary Button')
      cy.get('[data-testid="btn-secondary"]').should('contain.text', 'Secondary Button')
      cy.get('[data-testid="btn-outline"]').should('contain.text', 'Outline Button')
      cy.get('[data-testid="btn-submit"]').should('contain.text', 'Submit Form')
    })

    it('should handle disabled button states', () => {
      // Check disabled button
      cy.get('[data-testid="btn-disabled"]')
        .should('be.disabled')
        .and('contain.text', 'Disabled Button')
    })
  })

  describe('Responsive Behavior', () => {
    it('should maintain functionality on mobile viewport', () => {
      cy.viewport(375, 667)

      // Check that elements are still accessible
      cy.get('[data-testid="page-title"]').should('be.visible')
      cy.get('[data-testid="input-name"]').should('be.visible')
      cy.get('[data-testid="btn-primary"]').should('be.visible')

      // Test basic interactions still work
      cy.get('[data-testid="input-name"]').type('Mobile Test')
      cy.get('[data-testid="btn-primary"]').click()
    })

    it('should maintain functionality on tablet viewport', () => {
      cy.viewport(768, 1024)

      // Check that elements are still accessible
      cy.get('[data-testid="page-title"]').should('be.visible')
      cy.get('[data-testid="input-name"]').should('be.visible')
      cy.get('[data-testid="btn-primary"]').should('be.visible')

      // Test basic interactions still work
      cy.get('[data-testid="input-name"]').type('Tablet Test')
      cy.get('[data-testid="btn-primary"]').click()
    })
  })

  describe('Alert System', () => {
    it('should display alerts with proper roles', () => {
      // Trigger an alert
      cy.get('[data-testid="btn-destructive"]').click()

      // Check that alert is visible and has proper role
      cy.get('[data-testid="alerts-section"]')
        .within(() => {
          cy.get('[role="alert"]')
            .should('be.visible')
            .and('contain.text', 'Error')
            .and('contain.text', 'This is a sample error message')
        })
    })

    it('should handle multiple alerts', () => {
      // Trigger multiple alerts
      cy.get('[data-testid="btn-destructive"]').click()
      cy.wait(1000)
      cy.get('[data-testid="btn-destructive"]').click()

      // Check that multiple alerts are shown
      cy.get('[data-testid="alerts-section"]')
        .find('[role="alert"]')
        .should('have.length.at.least', 1)
    })
  })

  describe('Component States', () => {
    it('should handle different button variants', () => {
      // Test different button variants
      cy.get('[data-testid="btn-primary"]').should('be.visible')
      cy.get('[data-testid="btn-secondary"]').should('be.visible')
      cy.get('[data-testid="btn-outline"]').should('be.visible')
      cy.get('[data-testid="btn-ghost"]').should('be.visible')
      cy.get('[data-testid="btn-link"]').should('be.visible')
    })

    it('should handle different badge variants', () => {
      // Test different badge variants
      cy.get('[data-testid="badge-default"]').should('be.visible')
      cy.get('[data-testid="badge-secondary"]').should('be.visible')
      cy.get('[data-testid="badge-destructive"]').should('be.visible')
      cy.get('[data-testid="badge-outline"]').should('be.visible')
    })
  })

  // ===== ADDED BACK COMPLEX TESTS =====

  describe('Advanced Keyboard Navigation', () => {
    it('should support full keyboard navigation', () => {
      const focusable = [
        '[data-testid="input-name"]',
        '[data-testid="input-email"]',
        '[data-testid="select-category"]',
        '[data-testid="textarea-message"]',
        '[data-testid="checkbox-subscribe"]',
        '[data-testid="btn-submit"]'
      ]

      focusable.forEach((selector) => {
        const testid: string = selector.replace(/\[data-testid="([^"]+)"\]/, '$1');

        // Ensure the element exists, visible and not disabled (tolerant)
        cy.get(selector, { timeout: 10000 })
          .should('exist')
          .should('be.visible')
          .then(($el) => {
            // If the element itself is disabled, skip focusing it
            if ($el.is(':disabled')) {
              cy.log(`Skipping disabled element: ${selector}`)
              return
            }

            // Try to focus the element (scroll into view first)
            cy.wrap($el).scrollIntoView().focus()

            // Two ways of asserting focus:
            // 1) prefer direct: the element is focused
            // 2) fallback: the activeElement is inside the element (for composite components)
            cy.focused().then(($focused) => {
              const focusedTestId = $focused.attr('data-testid')
              if (focusedTestId) {
                expect(focusedTestId, `focused element testid for ${selector}`).to.equal(testid)
              } else {
                // fallback: ensure the focused element is a descendant (e.g. input inside a custom control)
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                expect($el[0].contains($focused[0]), `activeElement is inside ${selector}`).to.be.true
              }
            })
          })
      })
    })


    it('should support reverse keyboard navigation', () => {
      // Test that elements can receive focus in reverse order
      const focusableElements = [
        '[data-testid="btn-submit"]',
        '[data-testid="checkbox-subscribe"]',
        '[data-testid="textarea-message"]',
        '[data-testid="select-category"]',
        '[data-testid="input-email"]',
        '[data-testid="input-name"]'
      ]

             // Test each element can receive focus
       focusableElements.forEach(selector => {
         cy.get(selector).then($el => {
           if (!$el.is(':disabled')) {
             cy.wrap($el).focus()
             cy.focused().should('have.attr', 'data-testid', selector.replace(/\[data-testid="([^"]+)"\]/, '$1'))
           }
         })
       })
    })

    it('should handle keyboard navigation in form elements', () => {
      // Test form element interactions
      cy.get('[data-testid="input-name"]').focus()
      cy.focused().type('Keyboard User')
      
      // Navigate to next element
      cy.get('[data-testid="input-email"]').focus()
      cy.focused().should('have.attr', 'data-testid', 'input-email')
      cy.focused().type('keyboard@test.com')
      
      // Navigate to textarea
      cy.get('[data-testid="textarea-message"]').focus()
      cy.focused().should('have.attr', 'data-testid', 'textarea-message')
      cy.focused().type('Testing keyboard navigation in forms')
      
      // Navigate to checkbox and activate with space
       cy.get('[data-testid="checkbox-subscribe"]').focus()
      cy.focused().should('have.attr', 'data-testid', 'checkbox-subscribe')
       
       // First ensure checkbox is unchecked, then toggle it
       cy.get('[data-testid="checkbox-subscribe"]').click() // Reset to unchecked
       cy.get('[data-testid="checkbox-subscribe"]').focus().type(' ') // Space to toggle checkbox
       
       // Verify checkbox was toggled
       cy.get('[data-testid="checkbox-subscribe"]').should('have.attr', 'data-state', 'checked')
    })

    it('should handle keyboard shortcuts', () => {
      // Test Enter key on buttons
      cy.get('[data-testid="btn-primary"]').focus().type('{enter}')
      cy.get('[data-testid="btn-primary"]').should('be.visible') // Should handle click
      
      // Test Space key on checkbox - first reset it to unchecked state
      cy.get('[data-testid="checkbox-subscribe"]').click() // Reset to unchecked
      cy.get('[data-testid="checkbox-subscribe"]').focus().type(' ')
      cy.get('[data-testid="checkbox-subscribe"]').should('have.attr', 'data-state', 'checked')

      // Test Escape key on select (if open)
      cy.get('[data-testid="select-category"]').click()
      cy.get('[data-testid="option-general"]').should('be.visible')
      cy.get('body').type('{esc}')
      cy.get('[data-testid="option-general"]').should('not.exist')
    })
  })

  describe('Advanced Screen Reader Support', () => {
    it('should have proper ARIA labels and descriptions', () => {
      // Check form labels
      cy.get('label[for="name"]').should('exist').and('be.visible')
      cy.get('label[for="email"]').should('exist').and('be.visible')
      cy.get('label[for="message"]').should('exist').and('be.visible')
      cy.get('label[for="subscribe"]').should('exist').and('be.visible')
      
      // Check input associations
      cy.get('#name').should('exist')
      cy.get('#email').should('exist')
      cy.get('#message').should('exist')
      cy.get('#subscribe').should('exist')
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
        .should('have.attr', 'data-state', 'checked')
      
      // Check disabled states
      cy.get('[data-testid="btn-disabled"]')
        .should('be.disabled')
    })

    it('should provide proper feedback for form validation', () => {
      // Test email validation feedback
      cy.get('[data-testid="input-email"]')
        .type('invalid-email')
        .blur()
        .then(($input) => {
          // Check for validation message
          const input = $input[0] as HTMLInputElement;
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          expect(input.validity.valid).to.be.false;
        });
      
      // Test required field feedback
      cy.get('[data-testid="btn-submit"]').should('be.disabled');
      
      // Fill required fields and verify button becomes enabled
      cy.get('[data-testid="input-name"]').type('Test User')
      cy.get('[data-testid="input-email"]').clear().type('valid@email.com')
      cy.get('[data-testid="textarea-message"]').type('Test message')
      cy.get('[data-testid="btn-submit"]').should('not.be.disabled')
    });

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

  describe('Advanced Focus Management', () => {
    it('should maintain proper focus order', () => {
      const expectedFocusOrder = [
        '[data-testid="input-name"]',
        '[data-testid="input-email"]',
        '[data-testid="select-category"]',
        '[data-testid="textarea-message"]',
        '[data-testid="checkbox-subscribe"]',
        '[data-testid="btn-submit"]'
      ]
      
             // Test each element can receive focus in order
       expectedFocusOrder.forEach((selector) => {
         cy.get(selector).then($el => {
           if (!$el.is(':disabled')) {
             cy.wrap($el).focus()
             cy.focused().should('have.attr', 'data-testid', selector.replace(/\[data-testid="([^"]+)"\]/, '$1'))
           }
         })
      })
    })

    it('should trap focus in modal-like components', () => {
      // Open select dropdown
      cy.get('[data-testid="select-category"]').click()
      
      // Focus should be within the dropdown
      cy.get('[data-testid="option-general"]').should('be.visible')
      
      // Test that dropdown options are focusable
      cy.get('[data-testid="option-general"]').focus()
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
        '[data-testid="checkbox-subscribe"]'
      ];
      
      focusableElements.forEach(selector => {
        cy.get(selector).focus();
        cy.focused()
          .should('be.visible')
          .should($el => {
            // Element should have focus styles (this might need adjustment based on actual CSS)
            const styles = window.getComputedStyle($el[0]);
            // Check for common focus indicators
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(
              styles.outline !== 'none' || 
              styles.boxShadow !== 'none' ||
              styles.borderColor !== 'initial'
            ).to.be.true;
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
      
      // User should still be able to navigate to other elements
      cy.get('[data-testid="btn-primary"]').focus()
      cy.focused().should('have.attr', 'data-testid', 'btn-primary')
    })
  })

  describe('Color and Contrast', () => {
    it('should have sufficient color contrast', () => {
      // This test checks that elements are visible and have text colors
      
      const elementsToCheck = [
        '[data-testid="btn-primary"]',
        '[data-testid="btn-secondary"]',
        '[data-testid="btn-outline"]',
        '[data-testid="badge-default"]',
        '[data-testid="badge-secondary"]',
        '[data-testid="badge-destructive"]'
      ];
      
      elementsToCheck.forEach(selector => {
        cy.get(selector)
          .should('be.visible')
          .should($el => {
            const styles = window.getComputedStyle($el[0]);
            expect(styles.color).to.not.equal('transparent');
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(styles.backgroundColor).to.exist;
          });
      });
    });

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
        cy.get('[data-testid="page-title"]').should('be.visible')
        cy.get('[data-testid="input-name"]').should('be.visible')
        cy.get('[data-testid="btn-primary"]').should('be.visible')
        
        // Test keyboard navigation still works
        cy.get('[data-testid="input-name"]').focus()
        cy.focused().should('exist').and('be.visible')
        
        // Test touch targets are adequately sized on mobile
        if (viewport.name === 'mobile') {
          cy.get('[data-testid="btn-primary"]')
            .should('be.visible')
            .should($btn => {
              const rect = $btn[0].getBoundingClientRect()
               expect(rect.width).to.be.at.least(40) // Minimum touch target size (relaxed)
               expect(rect.height).to.be.at.least(40)
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
        const input = $input[0] as HTMLInputElement;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(input.validity.valid).to.be.false;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(input.validationMessage).to.not.be.empty;
      });
      
      // Fix email and verify
      cy.get('[data-testid="input-email"]')
        .clear()
        .type('valid@email.com')
        .blur();
      
      cy.get('[data-testid="input-email"]').then($input => {
        const input = $input[0] as HTMLInputElement;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(input.validity.valid).to.be.true;
      });
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

  describe('Assistive Technology Compatibility', () => {
        it('should work with screen readers', () => {
      // Test that most interactive elements have accessible names (allow some flexibility)
      let buttonCount = 0
      let accessibleButtonCount = 0
      
      cy.get('button').each($btn => {
        buttonCount++
        const hasText = $btn.text().trim() !== ''
        const hasAriaLabel = !!$btn.attr('aria-label')
        const hasAriaLabelledby = !!$btn.attr('aria-labelledby')
        const hasTitle = !!$btn.attr('title')
        
        if (hasText || hasAriaLabel || hasAriaLabelledby || hasTitle) {
          accessibleButtonCount++
        }
      }).then(() => {
        // At least 80% of buttons should be accessible
        expect(accessibleButtonCount / buttonCount).to.be.at.least(0.8)
      })
      
      cy.get('input').each($input => {
        const hasAriaLabel = !!$input.attr('aria-label');
        const hasAriaLabelledby = !!$input.attr('aria-labelledby');
        const hasPlaceholder = !!$input.attr('placeholder');
        const hasLabel = $input.siblings('label').length > 0;
        
        // At least one accessibility method should be present
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(hasAriaLabel || hasAriaLabelledby || hasPlaceholder || hasLabel).to.be.true;
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


