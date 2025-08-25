import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Alert, AlertTitle, AlertDescription } from '../alert'

expect.extend(toHaveNoViolations)

// Mock icon component for testing
const TestIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className}
    data-testid="alert-icon" 
    width="16" 
    height="16" 
    viewBox="0 0 16 16"
    fill="currentColor"
  >
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 4zM8 10a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1z"/>
  </svg>
)

describe('Alert Component Family', () => {
  describe('Alert Component', () => {
    describe('Rendering Tests', () => {
      test('renders with default props and correct structure', () => {
        render(<Alert data-testid="alert">Test Alert</Alert>)
        
        const alert = screen.getByTestId('alert')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveTextContent('Test Alert')
        expect(alert).toHaveAttribute('role', 'alert')
        expect(alert.tagName).toBe('DIV')
      })

      test('applies default CSS classes correctly', () => {
        render(<Alert data-testid="alert">Test Alert</Alert>)
        
        const alert = screen.getByTestId('alert')
        expect(alert).toHaveClass(
          'relative',
          'w-full',
          'rounded-lg',
          'border',
          'p-4',
          'bg-background',
          'text-foreground'
        )
      })

      test('applies custom className correctly', () => {
        render(<Alert className="custom-class" data-testid="alert">Test Alert</Alert>)
        
        const alert = screen.getByTestId('alert')
        expect(alert).toHaveClass('custom-class')
      })

      test('renders with custom children', () => {
        render(
          <Alert data-testid="alert">
            <span>Custom</span> Alert Content
          </Alert>
        )
        
        const alert = screen.getByTestId('alert')
        expect(alert).toHaveTextContent('Custom Alert Content')
        expect(alert.querySelector('span')).toHaveTextContent('Custom')
      })

      test('renders empty alert gracefully', () => {
        render(<Alert data-testid="alert" />)
        
        const alert = screen.getByTestId('alert')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveAttribute('role', 'alert')
        expect(alert).toBeEmptyDOMElement()
      })
    })

    describe('Variant Tests', () => {
      test('renders default variant correctly', () => {
        render(<Alert variant="default" data-testid="alert">Default Alert</Alert>)
        
        const alert = screen.getByTestId('alert')
        expect(alert).toHaveClass('bg-background', 'text-foreground')
        expect(alert).not.toHaveClass('border-destructive/50', 'text-destructive')
      })

      test('renders destructive variant correctly', () => {
        render(<Alert variant="destructive" data-testid="alert">Error Alert</Alert>)
        
        const alert = screen.getByTestId('alert')
        expect(alert).toHaveClass(
          'border-destructive/50',
          'text-destructive'
        )
        expect(alert).not.toHaveClass('bg-background')
      })

      test('applies default variant when no variant is specified', () => {
        render(<Alert data-testid="alert">No Variant</Alert>)
        
        const alert = screen.getByTestId('alert')
        expect(alert).toHaveClass('bg-background', 'text-foreground')
      })
    })

    describe('Icon Integration Tests', () => {
      test('renders with icon correctly', () => {
        render(
          <Alert data-testid="alert">
            <TestIcon />
            Alert with icon
          </Alert>
        )
        
        const alert = screen.getByTestId('alert')
        const icon = screen.getByTestId('alert-icon')
        
        expect(alert).toHaveTextContent('Alert with icon')
        expect(icon).toBeInTheDocument()
      })

      test('applies icon-specific styles correctly', () => {
        render(<Alert data-testid="alert">Test Alert</Alert>)
        
        const alert = screen.getByTestId('alert')
        // Check for icon-specific CSS classes
        expect(alert).toHaveClass('[&>svg~*]:pl-7')
        expect(alert).toHaveClass('[&>svg+div]:translate-y-[-3px]')
        expect(alert).toHaveClass('[&>svg]:absolute')
        expect(alert).toHaveClass('[&>svg]:left-4')
        expect(alert).toHaveClass('[&>svg]:top-4')
        expect(alert).toHaveClass('[&>svg]:text-foreground')
      })

      test('applies destructive icon styles correctly', () => {
        render(
          <Alert variant="destructive" data-testid="alert">
            <TestIcon />
            Destructive alert with icon
          </Alert>
        )
        
        const alert = screen.getByTestId('alert')
        expect(alert).toHaveClass('[&>svg]:text-destructive')
      })
    })

    describe('Forward Ref Tests', () => {
      test('forwards ref correctly', () => {
        const ref = React.createRef<HTMLDivElement>()
        render(<Alert ref={ref}>Test Alert</Alert>)
        
        expect(ref.current).toBeInstanceOf(HTMLDivElement)
        expect(ref.current).toHaveTextContent('Test Alert')
        expect(ref.current).toHaveAttribute('role', 'alert')
      })
    })
  })

  describe('AlertTitle Component', () => {
    describe('Rendering Tests', () => {
      test('renders with default props correctly', () => {
        render(<AlertTitle data-testid="title">Alert Title</AlertTitle>)
        
        const title = screen.getByTestId('title')
        expect(title).toBeInTheDocument()
        expect(title).toHaveTextContent('Alert Title')
        expect(title.tagName).toBe('H5')
      })

      test('applies default CSS classes correctly', () => {
        render(<AlertTitle data-testid="title">Alert Title</AlertTitle>)
        
        const title = screen.getByTestId('title')
        expect(title).toHaveClass(
          'mb-1',
          'font-medium',
          'leading-none',
          'tracking-tight'
        )
      })

      test('applies custom className correctly', () => {
        render(<AlertTitle className="custom-title" data-testid="title">Alert Title</AlertTitle>)
        
        const title = screen.getByTestId('title')
        expect(title).toHaveClass('custom-title')
      })

      test('renders as heading element', () => {
        render(<AlertTitle>Title Text</AlertTitle>)
        
        const heading = screen.getByRole('heading', { level: 5 })
        expect(heading).toHaveTextContent('Title Text')
      })

      test('handles empty title gracefully', () => {
        render(<AlertTitle data-testid="title" />)
        
        const title = screen.getByTestId('title')
        expect(title).toBeInTheDocument()
        expect(title).toBeEmptyDOMElement()
      })
    })

    describe('Forward Ref Tests', () => {
      test('forwards ref correctly', () => {
        const ref = React.createRef<HTMLParagraphElement>()
        render(<AlertTitle ref={ref}>Test Title</AlertTitle>)
        
        expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
        expect(ref.current).toHaveTextContent('Test Title')
      })
    })
  })

  describe('AlertDescription Component', () => {
    describe('Rendering Tests', () => {
      test('renders with default props correctly', () => {
        render(<AlertDescription data-testid="description">Alert Description</AlertDescription>)
        
        const description = screen.getByTestId('description')
        expect(description).toBeInTheDocument()
        expect(description).toHaveTextContent('Alert Description')
        expect(description.tagName).toBe('DIV')
      })

      test('applies default CSS classes correctly', () => {
        render(<AlertDescription data-testid="description">Alert Description</AlertDescription>)
        
        const description = screen.getByTestId('description')
        expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed')
      })

      test('applies custom className correctly', () => {
        render(<AlertDescription className="custom-desc" data-testid="description">Alert Description</AlertDescription>)
        
        const description = screen.getByTestId('description')
        expect(description).toHaveClass('custom-desc')
      })

      test('handles paragraph content correctly', () => {
        render(
          <AlertDescription data-testid="description">
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </AlertDescription>
        )
        
        const description = screen.getByTestId('description')
        expect(description.querySelector('p')).toHaveTextContent('First paragraph')
        expect(description).toHaveClass('[&_p]:leading-relaxed')
      })

      test('handles empty description gracefully', () => {
        render(<AlertDescription data-testid="description" />)
        
        const description = screen.getByTestId('description')
        expect(description).toBeInTheDocument()
        expect(description).toBeEmptyDOMElement()
      })
    })

    describe('Forward Ref Tests', () => {
      test('forwards ref correctly', () => {
        const ref = React.createRef<HTMLParagraphElement>()
        render(<AlertDescription ref={ref}>Test Description</AlertDescription>)
        
        expect(ref.current).toBeInstanceOf(HTMLDivElement)
        expect(ref.current).toHaveTextContent('Test Description')
      })
    })
  })

  describe('Integration Tests', () => {
    test('renders complete alert with all components', () => {
      render(
        <Alert data-testid="complete-alert">
          <TestIcon />
          <AlertTitle data-testid="title">Alert Title</AlertTitle>
          <AlertDescription data-testid="description">
            This is the alert description with more details.
          </AlertDescription>
        </Alert>
      )

      expect(screen.getByTestId('complete-alert')).toBeInTheDocument()
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
      expect(screen.getByTestId('title')).toBeInTheDocument()
      expect(screen.getByTestId('description')).toBeInTheDocument()
      
      // Check content
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Alert Title')
      expect(screen.getByTestId('description')).toHaveTextContent('This is the alert description with more details.')
    })

    test('renders informational alert correctly', () => {
      render(
        <Alert variant="default">
          <TestIcon />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            This is an informational message.
          </AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-background', 'text-foreground')
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Information')
    })

    test('renders error alert correctly', () => {
      render(
        <Alert variant="destructive">
          <TestIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Something went wrong. Please try again.
          </AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive')
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Error')
    })

    test('maintains proper semantic structure', () => {
      render(
        <Alert>
          <AlertTitle>Main Alert Title</AlertTitle>
          <AlertDescription>
            Supporting description text that provides more context.
          </AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      const heading = screen.getByRole('heading', { level: 5 })
      
      expect(alert).toBeInTheDocument()
      expect(heading).toHaveTextContent('Main Alert Title')
      expect(alert).toContainElement(heading)
    })

    test('handles complex nested content', () => {
      render(
        <Alert>
          <TestIcon />
          <AlertTitle>Complex Alert</AlertTitle>
          <AlertDescription>
            <p>First paragraph with <strong>bold text</strong>.</p>
            <p>Second paragraph with <em>italic text</em>.</p>
            <div>
              <span>Nested content in a div.</span>
            </div>
          </AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent(/First paragraph with bold text/)
      expect(alert).toHaveTextContent(/Second paragraph with italic text/)
      expect(alert).toHaveTextContent(/Nested content in a div/)
      
      expect(alert.querySelector('strong')).toHaveTextContent('bold text')
      expect(alert.querySelector('em')).toHaveTextContent('italic text')
    })
  })

  describe('HTML Attributes Tests', () => {
    test('passes through HTML attributes correctly on Alert', () => {
      render(
        <Alert
          data-testid="alert"
          id="test-alert"
          aria-labelledby="alert-title"
          data-severity="high"
        >
          Test Alert
        </Alert>
      )
      
      const alert = screen.getByTestId('alert')
      expect(alert).toHaveAttribute('id', 'test-alert')
      expect(alert).toHaveAttribute('aria-labelledby', 'alert-title')
      expect(alert).toHaveAttribute('data-severity', 'high')
      expect(alert).toHaveAttribute('role', 'alert') // Should maintain role="alert"
    })

    test('passes through HTML attributes correctly on AlertTitle', () => {
      render(
        <AlertTitle
          data-testid="title"
          id="alert-title"
          className="custom-title"
        >
          Title Text
        </AlertTitle>
      )
      
      const title = screen.getByTestId('title')
      expect(title).toHaveAttribute('id', 'alert-title')
      expect(title).toHaveClass('custom-title')
    })

    test('passes through HTML attributes correctly on AlertDescription', () => {
      render(
        <AlertDescription
          data-testid="description"
          id="alert-desc"
          data-content-type="markdown"
        >
          Description Text
        </AlertDescription>
      )
      
      const description = screen.getByTestId('description')
      expect(description).toHaveAttribute('id', 'alert-desc')
      expect(description).toHaveAttribute('data-content-type', 'markdown')
    })
  })

  describe('Accessibility Tests', () => {
    test('has no accessibility violations with default alert', async () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Accessible Alert</AlertTitle>
          <AlertDescription>This alert is accessible.</AlertDescription>
        </Alert>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('has no accessibility violations with destructive alert', async () => {
      const { container } = render(
        <Alert variant="destructive">
          <TestIcon />
          <AlertTitle>Error Alert</AlertTitle>
          <AlertDescription>This is an error message.</AlertDescription>
        </Alert>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('maintains proper role attribute', () => {
      render(<Alert data-testid="alert">Test Alert</Alert>)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toHaveAttribute('role', 'alert')
    })

    test('supports proper ARIA labeling', () => {
      render(
        <Alert aria-labelledby="alert-title" data-testid="alert">
          <AlertTitle id="alert-title">Important Alert</AlertTitle>
          <AlertDescription>This alert has proper ARIA labeling.</AlertDescription>
        </Alert>
      )

      const alert = screen.getByTestId('alert')
      const title = screen.getByRole('heading', { level: 5 })
      
      expect(alert).toHaveAttribute('aria-labelledby', 'alert-title')
      expect(title).toHaveAttribute('id', 'alert-title')
    })

    test('maintains proper heading hierarchy', () => {
      render(
        <div>
          <h1>Page Title</h1>
          <Alert>
            <AlertTitle>Section Alert</AlertTitle>
            <AlertDescription>Alert in a section context.</AlertDescription>
          </Alert>
        </div>
      )

      const pageTitle = screen.getByRole('heading', { level: 1 })
      const alertTitle = screen.getByRole('heading', { level: 5 })
      
      expect(pageTitle).toHaveTextContent('Page Title')
      expect(alertTitle).toHaveTextContent('Section Alert')
    })

    test('supports screen reader announcements', () => {
      render(
        <Alert aria-live="assertive" data-testid="alert">
          <AlertTitle>Urgent Alert</AlertTitle>
          <AlertDescription>This requires immediate attention.</AlertDescription>
        </Alert>
      )

      const alert = screen.getByTestId('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
      expect(alert).toHaveAttribute('role', 'alert')
    })
  })

  describe('Common Use Cases Tests', () => {
    test('renders success alert', () => {
      render(
        <Alert variant="default" className="border-green-500 bg-green-50 text-green-700">
          <TestIcon />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed successfully!</AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-green-500', 'bg-green-50', 'text-green-700')
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Success')
    })

    test('renders warning alert', () => {
      render(
        <Alert variant="default" className="border-yellow-500 bg-yellow-50 text-yellow-700">
          <TestIcon />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please review your input before proceeding.</AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-yellow-500', 'bg-yellow-50', 'text-yellow-700')
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Warning')
    })

    test('renders info alert without icon', () => {
      render(
        <Alert>
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Here's some helpful information for you.</AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      expect(alert).not.toContainElement(screen.queryByTestId('alert-icon'))
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Information')
    })

    test('renders simple text-only alert', () => {
      render(<Alert>Simple alert message without title or icon.</Alert>)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Simple alert message without title or icon.')
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    test('renders alert with action buttons', () => {
      render(
        <Alert>
          <TestIcon />
          <AlertTitle>Confirmation Required</AlertTitle>
          <AlertDescription>
            Are you sure you want to delete this item?
            <div className="mt-2 space-x-2">
              <button className="btn-primary">Confirm</button>
              <button className="btn-secondary">Cancel</button>
            </div>
          </AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Confirmation Required')
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })

  describe('Error Handling Tests', () => {
    test('handles undefined variant gracefully', () => {
      // @ts-expect-error - Testing undefined variant
      render(<Alert variant={undefined} data-testid="alert">Test</Alert>)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('role', 'alert')
      // Should fallback to default variant
      expect(alert).toHaveClass('bg-background')
    })

    test('handles null children gracefully', () => {
      render(<Alert data-testid="alert">{null}</Alert>)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('role', 'alert')
      expect(alert).toBeEmptyDOMElement()
    })

    test('handles missing title gracefully', () => {
      render(
        <Alert data-testid="alert">
          <AlertDescription>Description without title</AlertDescription>
        </Alert>
      )

      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Description without title')
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    test('handles missing description gracefully', () => {
      render(
        <Alert data-testid="alert">
          <AlertTitle>Title without description</AlertTitle>
        </Alert>
      )

      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Title without description')
    })

    test('handles invalid props gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        // @ts-expect-error - Testing invalid props
        <Alert variant="invalid" size="large" data-testid="alert">
          Invalid Props Alert
        </Alert>
      )
      
      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Invalid Props Alert')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Performance Tests', () => {
    test('meets render time performance standards', () => {
      const startTime = performance.now()
      
      render(
        <Alert>
          <TestIcon />
          <AlertTitle>Performance Test</AlertTitle>
          <AlertDescription>Testing render performance</AlertDescription>
        </Alert>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // Adjusted for testing environments
    })

    test('handles multiple alerts efficiently', () => {
      const startTime = performance.now()
      
      const alerts = Array.from({ length: 100 }, (_, index) => (
        <Alert key={index} variant={index % 2 === 0 ? 'default' : 'destructive'}>
          <TestIcon />
          <AlertTitle>Alert {index + 1}</AlertTitle>
          <AlertDescription>Description {index + 1}</AlertDescription>
        </Alert>
      ))
      
      render(<div>{alerts}</div>)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(200) // Should render many alerts efficiently
    })
  })

  describe('TypeScript Integration Tests', () => {
    test('enforces proper typing for variant prop', () => {
      // These should compile without TypeScript errors
      render(<Alert variant="default">Default</Alert>)
      render(<Alert variant="destructive">Destructive</Alert>)
      
      expect(true).toBe(true) // Test passes if it compiles
    })

    test('supports all HTML div props with proper types', () => {
      const TestComponent = () => (
        <Alert
          variant="default"
          className="custom-class"
          id="test-id"
          role="alert" // Should be allowed but maintain default
          aria-labelledby="title-id"
          data-testid="typed-alert"
        >
          <AlertTitle id="title-id">Typed Alert</AlertTitle>
          <AlertDescription>This alert has proper typing.</AlertDescription>
        </Alert>
      )
      
      render(<TestComponent />)
      expect(screen.getByTestId('typed-alert')).toBeInTheDocument()
    })

    test('supports proper ref typing for all components', () => {
      const alertRef = React.createRef<HTMLDivElement>()
      const titleRef = React.createRef<HTMLParagraphElement>()
      const descRef = React.createRef<HTMLParagraphElement>()
      
      render(
        <Alert ref={alertRef}>
          <AlertTitle ref={titleRef}>Title</AlertTitle>
          <AlertDescription ref={descRef}>Description</AlertDescription>
        </Alert>
      )
      
      expect(alertRef.current).toBeInstanceOf(HTMLDivElement)
      expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement)
      expect(descRef.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})
