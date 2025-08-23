describe('Complete User Journey Tests', () => {
  beforeEach(() => {
    cy.visit('/component-showcase')
  })

  describe('New User Onboarding Journey', () => {
    it('should complete the full contact form journey', () => {
      cy.fixture('testData').then((data) => {
        const user = data.users.user
        const formData = data.formData.contactForm
        
        // Step 1: User arrives and sees the showcase
        cy.get('[data-testid="page-title"]')
          .should('be.visible')
          .and('contain.text', 'UI Components Showcase')
        
        // Step 2: User scrolls to explore components
        cy.get('[data-testid="buttons-card"]').scrollIntoView()
        cy.get('[data-testid="btn-primary"]').should('be.visible')
        
        // Step 3: User tries different buttons to explore
        cy.get('[data-testid="btn-primary"]').click()
        cy.get('[data-testid="btn-secondary"]').click()
        cy.get('[data-testid="btn-outline"]').click()
        
        // Step 4: User encounters error button and learns about alerts
        cy.get('[data-testid="btn-destructive"]').click()
        cy.get('[data-testid="alerts-section"]').within(() => {
          cy.contains('Error').should('be.visible')
        })
        
        // Step 5: User scrolls to form section
        cy.get('[data-testid="form-card"]').scrollIntoView()
        
        // Step 6: User starts filling out the contact form
        cy.get('[data-testid="input-name"]')
          .should('be.visible')
          .type(formData.name)
        
        // Step 7: User fills email and sees validation
        cy.get('[data-testid="input-email"]')
          .type('invalid-email')
          .blur()
          
        // User realizes email is invalid and corrects it
        cy.get('[data-testid="input-email"]')
          .clear()
          .type(formData.email)
        
        // Step 8: User selects a category
        cy.get('[data-testid="select-category"]').click()
        cy.get('[data-testid="option-support"]').click()
        
        // Step 9: User writes a message
        cy.get('[data-testid="textarea-message"]').type(formData.message)
        
        // Step 10: User decides to subscribe to newsletter
        cy.get('[data-testid="checkbox-subscribe"]').check()
        
        // Step 11: User submits the form
        cy.get('[data-testid="btn-submit"]').click()
        
        // Step 12: User sees success confirmation
        cy.get('[data-testid="alerts-section"]').within(() => {
          cy.contains('Form Submitted').should('be.visible')
          cy.contains(`Thank you, ${formData.name}!`).should('be.visible')
        })
        
        // Step 13: User explores other sections after successful submission
        cy.get('[data-testid="badges-card"]').scrollIntoView()
        cy.get('[data-testid="badge-default"]').should('be.visible')
      })
    })

    it('should handle frustrated user who makes multiple mistakes', () => {
      // Simulate a user who makes common mistakes
      
      // Step 1: User rushes and tries to submit empty form
      cy.get('[data-testid="form-card"]').scrollIntoView()
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      // Step 2: User fills name but makes email mistake
      cy.get('[data-testid="input-name"]').type('Frustrated User')
      cy.get('[data-testid="input-email"]').type('not-an-email')
      cy.get('[data-testid="textarea-message"]').type('I need help!')
      
      // Step 3: User tries to submit with invalid email
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      // Step 4: User gets frustrated and triggers error alert
      cy.get('[data-testid="btn-destructive"]').click()
      
      // Step 5: User sees multiple error states
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Error').should('be.visible')
      })
      
      // Step 6: User fixes email and successfully submits
      cy.get('[data-testid="input-email"]')
        .clear()
        .type('frustrated@user.com')
      
      cy.get('[data-testid="btn-submit"]').should('not.be.disabled').click()
      
      // Step 7: User finally sees success
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Thank you, Frustrated User!').should('be.visible')
      })
    })
  })

  describe('Accessibility-First User Journey', () => {
    it('should complete entire journey using only keyboard', () => {
      cy.fixture('testData').then((data) => {
        const formData = data.formData.contactForm
        
        // Step 1: User navigates page with keyboard only
        cy.get('body').tab()
        
        // Step 2: User tabs through various components
        for (let i = 0; i < 10; i++) {
          cy.focused()
            .should('exist')
            .should('be.visible')
          cy.focused().tab()
        }
        
        // Step 3: User navigates to form using keyboard
        cy.get('[data-testid="input-name"]').focus()
        
        // Step 4: User fills form entirely with keyboard
        cy.focused().type(`${formData.name}{tab}`)
        cy.focused().type(`${formData.email}{tab}`)
        
        // Step 5: User uses keyboard to select category
        cy.focused().type('{enter}') // Open dropdown
        cy.focused().type('{downarrow}{downarrow}{enter}') // Select option
        
        // Step 6: User continues with keyboard
        cy.focused().tab()
        cy.focused().type(`${formData.message}{tab}`)
        
        // Step 7: User toggles checkbox with space
        cy.focused().type(' {tab}')
        
        // Step 8: User submits with Enter
        cy.focused().type('{enter}')
        
        // Step 9: Success message is announced
        cy.get('[data-testid="alerts-section"]').within(() => {
          cy.get('[role="alert"]')
            .should('be.visible')
            .and('contain.text', `Thank you, ${formData.name}!`)
        })
      })
    })

    it('should work for screen reader user simulation', () => {
      // Test that all content is accessible via screen reader patterns
      
      // Step 1: Check page has proper heading structure
      cy.get('h1').should('exist').and('be.visible')
      
      // Step 2: Check form has proper labels
      cy.get('form').within(() => {
        cy.get('label').should('have.length.at.least', 4)
        cy.get('input[aria-labelledby], input[aria-label]').should('exist')
      })
      
      // Step 3: Navigate through form with screen reader patterns
      cy.get('[data-testid="input-name"]')
        .should('have.attr', 'required')
        .type('Screen Reader User')
      
      cy.get('[data-testid="input-email"]')
        .should('have.attr', 'type', 'email')
        .type('screenreader@test.com')
      
      // Step 4: Test select accessibility
      cy.get('[data-testid="select-category"]')
        .click()
        .then(() => {
          cy.get('[role="listbox"], [role="menu"]').should('exist')
        })
      cy.get('[data-testid="option-general"]').click()
      
      // Step 5: Complete form
      cy.get('[data-testid="textarea-message"]')
        .type('Testing screen reader accessibility')
      
      cy.get('[data-testid="checkbox-subscribe"]')
        .should('have.attr', 'aria-checked', 'false')
        .click()
        .should('have.attr', 'aria-checked', 'true')
      
      // Step 6: Submit and verify alert is properly announced
      cy.get('[data-testid="btn-submit"]').click()
      
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.get('[role="alert"]')
          .should('be.visible')
          .and('contain.text', 'Thank you, Screen Reader User!')
      })
    })
  })

  describe('Mobile User Journey', () => {
    it('should work perfectly on mobile devices', () => {
      cy.setViewportPreset('mobile')
      
      cy.fixture('testData').then((data) => {
        const formData = data.formData.contactForm
        
        // Step 1: Mobile user arrives at page
        cy.get('[data-testid="page-title"]').should('be.visible')
        
        // Step 2: User scrolls through components on mobile
        cy.get('[data-testid="buttons-card"]').scrollIntoView()
        
        // Step 3: User taps buttons (touch events)
        cy.get('[data-testid="btn-primary"]')
          .should('be.visible')
          .trigger('touchstart')
          .trigger('touchend')
        
        // Step 4: User navigates to form
        cy.get('[data-testid="form-card"]').scrollIntoView()
        
        // Step 5: User fills form on mobile
        cy.get('[data-testid="input-name"]')
          .should('be.visible')
          .type(formData.name)
        
        // Step 6: Mobile keyboard should work properly
        cy.get('[data-testid="input-email"]')
          .should('have.attr', 'type', 'email') // Should trigger email keyboard
          .type(formData.email)
        
        // Step 7: Select should work on mobile
        cy.get('[data-testid="select-category"]').click()
        cy.get('[data-testid="option-support"]')
          .should('be.visible')
          .click()
        
        // Step 8: Textarea should be scrollable on mobile
        cy.get('[data-testid="textarea-message"]')
          .type(formData.message)
          .should('have.value', formData.message)
        
        // Step 9: Checkbox should have adequate touch target
        cy.get('[data-testid="checkbox-subscribe"]')
          .should('be.visible')
          .click({ force: true }) // Ensure it works even with small targets
        
        // Step 10: Submit button should be easily tappable
        cy.get('[data-testid="btn-submit"]')
          .should('be.visible')
          .should($btn => {
            const rect = $btn[0].getBoundingClientRect()
            expect(rect.height).to.be.at.least(44) // Adequate touch target
          })
          .click()
        
        // Step 11: Success alert should be visible on mobile
        cy.get('[data-testid="alerts-section"]').within(() => {
          cy.contains(`Thank you, ${formData.name}!`).should('be.visible')
        })
        
        // Step 12: User explores pricing cards on mobile
        cy.get('[data-testid="cards-grid"]').scrollIntoView()
        cy.get('[data-testid="pricing-card-basic"]').should('be.visible')
        cy.get('[data-testid="btn-select-basic"]').click()
      })
    })

    it('should handle orientation changes gracefully', () => {
      // Start in portrait
      cy.viewport(375, 667)
      cy.get('[data-testid="input-name"]').type('Orientation Test')
      
      // Change to landscape
      cy.viewport(667, 375)
      cy.get('[data-testid="input-name"]').should('have.value', 'Orientation Test')
      
      // Continue filling form in landscape
      cy.get('[data-testid="input-email"]').type('orientation@test.com')
      
      // Back to portrait
      cy.viewport(375, 667)
      cy.get('[data-testid="input-name"]').should('have.value', 'Orientation Test')
      cy.get('[data-testid="input-email"]').should('have.value', 'orientation@test.com')
      
      // Complete form
      cy.get('[data-testid="textarea-message"]').type('Testing orientation changes')
      cy.get('[data-testid="btn-submit"]').click()
      
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Thank you, Orientation Test!').should('be.visible')
      })
    })
  })

  describe('Power User Journey', () => {
    it('should handle rapid interactions and complex workflows', () => {
      cy.fixture('testData').then((data) => {
        const forms = [
          { name: 'Speed User 1', email: 'speed1@test.com', message: 'First rapid submission' },
          { name: 'Speed User 2', email: 'speed2@test.com', message: 'Second rapid submission' },
          { name: 'Speed User 3', email: 'speed3@test.com', message: 'Third rapid submission' }
        ]
        
        // Step 1: Power user rapidly submits multiple forms
        forms.forEach((formData, index) => {
          cy.log(`Submitting form ${index + 1}`)
          
          // Clear previous data
          if (index > 0) {
            cy.get('[data-testid="input-name"]').clear()
            cy.get('[data-testid="input-email"]').clear()
            cy.get('[data-testid="textarea-message"]').clear()
          }
          
          // Rapid form filling
          cy.get('[data-testid="input-name"]').type(formData.name)
          cy.get('[data-testid="input-email"]').type(formData.email)
          cy.get('[data-testid="select-category"]').click()
          cy.get('[data-testid="option-general"]').click()
          cy.get('[data-testid="textarea-message"]').type(formData.message)
          
          if (index % 2 === 0) {
            cy.get('[data-testid="checkbox-subscribe"]').check()
          }
          
          cy.get('[data-testid="btn-submit"]').click()
          
          // Verify success
          cy.get('[data-testid="alerts-section"]').within(() => {
            cy.contains(`Thank you, ${formData.name}!`).should('be.visible')
          })
          
          // Wait briefly before next submission
          cy.wait(1000)
        })
        
        // Step 2: Power user explores all interactive elements rapidly
        cy.get('[data-testid="btn-primary"]').click()
        cy.get('[data-testid="btn-secondary"]').click()
        cy.get('[data-testid="btn-outline"]').click()
        cy.get('[data-testid="btn-ghost"]').click()
        cy.get('[data-testid="btn-link"]').click()
        
        // Step 3: Power user tests pricing cards
        cy.get('[data-testid="btn-select-basic"]').click()
        cy.get('[data-testid="btn-select-pro"]').click()
        cy.get('[data-testid="btn-contact-enterprise"]').click()
        
        // Step 4: Final verification that everything still works
        cy.get('[data-testid="page-title"]').should('be.visible')
        cy.get('[data-testid="btn-primary"]').should('be.visible').click()
      })
    })

    it('should handle error recovery workflows', () => {
      // Step 1: User triggers multiple error states
      cy.get('[data-testid="btn-destructive"]').click()
      cy.get('[data-testid="btn-destructive"]').click()
      cy.get('[data-testid="btn-destructive"]').click()
      
      // Multiple error alerts should be present
      cy.get('[data-testid="alerts-section"]')
        .find('[role="alert"]')
        .should('have.length', 3)
      
      // Step 2: User tries to submit invalid form multiple times
      cy.get('[data-testid="input-name"]').type('Error Recovery User')
      cy.get('[data-testid="input-email"]').type('invalid-email-format')
      cy.get('[data-testid="textarea-message"]').type('Testing error recovery')
      
      // Button should be disabled due to invalid email
      cy.get('[data-testid="btn-submit"]').should('be.disabled')
      
      // Step 3: User corrects errors and recovers
      cy.get('[data-testid="input-email"]')
        .clear()
        .type('recovery@test.com')
      
      // Step 4: User successfully submits after recovery
      cy.get('[data-testid="btn-submit"]').should('not.be.disabled').click()
      
      // Step 5: Success alert appears alongside error alerts
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Thank you, Error Recovery User!').should('be.visible')
      })
      
      // Step 6: Wait for all alerts to auto-dismiss
      cy.wait(6000)
      cy.get('[data-testid="alerts-section"]').should('be.empty')
      
      // Step 7: Verify system is fully recovered
      cy.get('[data-testid="btn-primary"]').should('be.visible').click()
    })
  })

  describe('Cross-Browser Compatibility Journey', () => {
    it('should work consistently across different environments', () => {
      // This test simulates different browser behaviors
      cy.fixture('testData').then((data) => {
        const formData = data.formData.contactForm
        
        // Step 1: Test form with different input methods
        cy.get('[data-testid="input-name"]')
          .type(formData.name)
          .should('have.value', formData.name)
        
        // Step 2: Test copy-paste functionality
        cy.get('[data-testid="input-email"]')
          .type(formData.email)
          .then($input => {
            // Simulate copy-paste
            $input.select()
            cy.wrap($input).type('{ctrl+c}')
          })
        
        // Step 3: Test form validation across browsers
        cy.get('[data-testid="input-email"]')
          .clear()
          .type('test@')
          .blur()
          .then($input => {
            // Should trigger browser validation
            void expect($input[0].validity.valid).to.be.false
          })
        
        // Step 4: Fix validation and complete form
        cy.get('[data-testid="input-email"]')
          .clear()
          .type(formData.email)
        
        cy.get('[data-testid="textarea-message"]').type(formData.message)
        cy.get('[data-testid="btn-submit"]').click()
        
        // Step 5: Verify success works across environments
        cy.get('[data-testid="alerts-section"]').within(() => {
          cy.contains(`Thank you, ${formData.name}!`).should('be.visible')
        })
      })
    })
  })

  describe('Performance Under Load Journey', () => {
    it('should maintain responsiveness with heavy usage', () => {
      const startTime = Date.now()
      
      // Simulate heavy usage patterns
      for (let i = 0; i < 5; i++) {
        // Rapid button clicks
        cy.get('[data-testid="btn-primary"]').click()
        cy.get('[data-testid="btn-secondary"]').click()
        cy.get('[data-testid="btn-outline"]').click()
        
        // Form interactions
        cy.get('[data-testid="input-name"]').clear().type(`Load Test ${i}`)
        cy.get('[data-testid="select-category"]').click()
        cy.get('[data-testid="option-support"]').click()
        
        // Alert triggers
        cy.get('[data-testid="btn-destructive"]').click()
        
        cy.wait(200) // Small delay between iterations
      }
      
      // Final form submission to test everything still works
      cy.get('[data-testid="input-name"]').clear().type('Performance Test User')
      cy.get('[data-testid="input-email"]').clear().type('performance@test.com')
      cy.get('[data-testid="textarea-message"]').clear().type('Testing under load')
      cy.get('[data-testid="btn-submit"]').click()
      
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Thank you, Performance Test User!').should('be.visible')
      })
      
      cy.then(() => {
        const endTime = Date.now()
        const totalTime = endTime - startTime
        expect(totalTime).to.be.lessThan(30000) // Should complete within 30 seconds
      })
    })
  })
})
