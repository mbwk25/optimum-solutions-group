import React from 'react'
import { Button } from '../../src/components/ui/button'

describe('Button Component', () => {
  it('should render primary button', () => {
    cy.mount(<Button variant="default">Click me</Button>)
    cy.get('button').should('be.visible')
    cy.get('button').should('contain.text', 'Click me')
  })

  it('should handle click events', () => {
    const onClick = cy.stub()
    cy.mount(<Button onClick={onClick}>Click me</Button>)
    cy.get('button').click()
    cy.then(() => {
      expect(onClick).to.have.been.called
    })
  })

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<Button disabled>Disabled</Button>)
    cy.get('button').should('be.disabled')
  })

  it('should have correct variant classes', () => {
    cy.mount(<Button variant="destructive">Delete</Button>)
    cy.get('button').should('have.class', 'bg-destructive')
  })

  it('should be accessible', () => {
    cy.mount(<Button>Accessible Button</Button>)
    cy.testA11y()
  })
})
