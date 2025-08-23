import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Badge, badgeVariants } from '../badge'

expect.extend(toHaveNoViolations)

describe('Badge Component', () => {
  describe('Rendering Tests', () => {
    test('renders with default props and correct structure', () => {
      render(<Badge data-testid="badge">Test Badge</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Test Badge')
      expect(badge.tagName).toBe('DIV')
    })

    test('applies default CSS classes correctly', () => {
      render(<Badge data-testid="badge">Test Badge</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'border',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-semibold',
        'transition-colors',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2'
      )
    })

    test('applies custom className correctly', () => {
      render(<Badge className="custom-class" data-testid="badge">Test Badge</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('custom-class')
    })

    test('renders with custom children', () => {
      render(
        <Badge data-testid="badge">
          <span>Custom</span> Content
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('Custom Content')
      expect(badge.querySelector('span')).toHaveTextContent('Custom')
    })

    test('renders empty badge gracefully', () => {
      render(<Badge data-testid="badge" />)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toBeEmptyDOMElement()
    })
  })

  describe('Variant Tests', () => {
    test('renders default variant correctly', () => {
      render(<Badge variant="default" data-testid="badge">Default</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-primary',
        'text-primary-foreground',
        'hover:bg-primary/80'
      )
    })

    test('renders secondary variant correctly', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-secondary',
        'text-secondary-foreground',
        'hover:bg-secondary/80'
      )
    })

    test('renders destructive variant correctly', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-destructive',
        'text-destructive-foreground',
        'hover:bg-destructive/80'
      )
    })

    test('renders outline variant correctly', () => {
      render(<Badge variant="outline" data-testid="badge">Outline</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('text-foreground')
      // Outline variant should not have background or hover background classes
      expect(badge).not.toHaveClass(
        'bg-primary',
        'bg-secondary',
        'bg-destructive',
        'hover:bg-primary/80',
        'hover:bg-secondary/80',
        'hover:bg-destructive/80'
      )
    })

    test('applies default variant when no variant is specified', () => {
      render(<Badge data-testid="badge">No Variant</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-primary',
        'text-primary-foreground',
        'hover:bg-primary/80'
      )
    })
  })

  describe('Interaction Tests', () => {
    test('handles click events correctly', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Badge data-testid="badge" onClick={handleClick}>
          Clickable Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      await user.click(badge)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('handles keyboard events correctly', async () => {
      const handleKeyDown = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Badge data-testid="badge" onKeyDown={handleKeyDown} tabIndex={0}>
          Keyboard Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      badge.focus()
      await user.keyboard('{Enter}')
      
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Enter' })
      )
    })

    test('supports focus and blur events', async () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Badge 
          data-testid="badge" 
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0}
        >
          Focusable Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      await user.click(badge)
      expect(handleFocus).toHaveBeenCalledTimes(1)
      
      await user.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    test('applies focus ring styles when focused', () => {
      render(
        <Badge data-testid="badge" tabIndex={0}>
          Focusable Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      badge.focus()
      
      expect(badge).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2'
      )
    })
  })

  describe('HTML Attributes Tests', () => {
    test('passes through HTML div attributes correctly', () => {
      render(
        <Badge
          data-testid="badge"
          id="test-badge"
          title="Badge Title"
          role="status"
          aria-label="Custom Badge"
          tabIndex={0}
        >
          Attributed Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('id', 'test-badge')
      expect(badge).toHaveAttribute('title', 'Badge Title')
      expect(badge).toHaveAttribute('role', 'status')
      expect(badge).toHaveAttribute('aria-label', 'Custom Badge')
      expect(badge).toHaveAttribute('tabIndex', '0')
    })

    test('supports data attributes', () => {
      render(
        <Badge
          data-testid="badge"
          data-category="notification"
          data-count={5}
          data-visible={true}
        >
          Data Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('data-category', 'notification')
      expect(badge).toHaveAttribute('data-count', '5')
      expect(badge).toHaveAttribute('data-visible', 'true')
    })

    test('supports custom styles', () => {
      render(
        <Badge
          data-testid="badge"
          style={{ backgroundColor: 'red', color: 'white' }}
        >
          Styled Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('style')
      expect(badge.style.backgroundColor).toBe('red')
      expect(badge.style.color).toBe('white')
    })
  })

  describe('Badge Variants Utility Tests', () => {
    test('badgeVariants function returns correct classes for default variant', () => {
      const classes = badgeVariants({ variant: 'default' })
      expect(classes).toContain('border-transparent')
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('text-primary-foreground')
      expect(classes).toContain('hover:bg-primary/80')
    })

    test('badgeVariants function returns correct classes for secondary variant', () => {
      const classes = badgeVariants({ variant: 'secondary' })
      expect(classes).toContain('border-transparent')
      expect(classes).toContain('bg-secondary')
      expect(classes).toContain('text-secondary-foreground')
      expect(classes).toContain('hover:bg-secondary/80')
    })

    test('badgeVariants function returns correct classes for destructive variant', () => {
      const classes = badgeVariants({ variant: 'destructive' })
      expect(classes).toContain('border-transparent')
      expect(classes).toContain('bg-destructive')
      expect(classes).toContain('text-destructive-foreground')
      expect(classes).toContain('hover:bg-destructive/80')
    })

    test('badgeVariants function returns correct classes for outline variant', () => {
      const classes = badgeVariants({ variant: 'outline' })
      expect(classes).toContain('text-foreground')
    })

    test('badgeVariants function uses default variant when no variant specified', () => {
      const classes = badgeVariants()
      const defaultClasses = badgeVariants({ variant: 'default' })
      expect(classes).toBe(defaultClasses)
    })
  })

  describe('Common Use Cases Tests', () => {
    test('renders status badges correctly', () => {
      const { rerender } = render(
        <Badge variant="default" data-testid="badge">
          Active
        </Badge>
      )
      
      expect(screen.getByTestId('badge')).toHaveTextContent('Active')
      
      rerender(
        <Badge variant="secondary" data-testid="badge">
          Pending
        </Badge>
      )
      
      expect(screen.getByTestId('badge')).toHaveTextContent('Pending')
      
      rerender(
        <Badge variant="destructive" data-testid="badge">
          Error
        </Badge>
      )
      
      expect(screen.getByTestId('badge')).toHaveTextContent('Error')
    })

    test('renders notification badges with count', () => {
      render(
        <Badge variant="destructive" data-testid="badge">
          3
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('3')
      expect(badge).toHaveClass('bg-destructive')
    })

    test('renders category badges', () => {
      render(
        <div>
          <Badge variant="outline" data-testid="tag1">React</Badge>
          <Badge variant="secondary" data-testid="tag2">TypeScript</Badge>
          <Badge variant="default" data-testid="tag3">UI</Badge>
        </div>
      )
      
      expect(screen.getByTestId('tag1')).toHaveTextContent('React')
      expect(screen.getByTestId('tag2')).toHaveTextContent('TypeScript')
      expect(screen.getByTestId('tag3')).toHaveTextContent('UI')
    })

    test('renders badges with icons', () => {
      const TestIcon = () => <span data-testid="icon">★</span>
      
      render(
        <Badge data-testid="badge">
          <TestIcon />
          Featured
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('★Featured')
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    test('renders dismissible badges', async () => {
      const handleDismiss = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Badge data-testid="badge">
          Tag
          <button 
            data-testid="dismiss"
            onClick={handleDismiss}
            aria-label="Remove tag"
          >
            ×
          </button>
        </Badge>
      )
      
      const dismissButton = screen.getByTestId('dismiss')
      await user.click(dismissButton)
      
      expect(handleDismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility Tests', () => {
    test('has no accessibility violations with default props', async () => {
      const { container } = render(
        <Badge>Accessible Badge</Badge>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('supports proper ARIA attributes for status badges', async () => {
      const { container } = render(
        <Badge role="status" aria-live="polite">
          Status Update
        </Badge>
      )
      
      const badge = screen.getByRole('status')
      expect(badge).toHaveAttribute('aria-live', 'polite')
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('supports proper ARIA attributes for notification badges', async () => {
      const { container } = render(
        <Badge role="status" aria-label="3 unread messages">
          3
        </Badge>
      )
      
      const badge = screen.getByRole('status')
      expect(badge).toHaveAttribute('aria-label', '3 unread messages')
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('supports keyboard navigation when focusable', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Badge 
          data-testid="badge"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick()
            }
          }}
        >
          Focusable Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      badge.focus()
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })

    test('maintains proper color contrast', () => {
      // Test that all variants have appropriate contrast classes
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const
      
      variants.forEach((variant) => {
        render(
          <Badge variant={variant} data-testid={`badge-${variant}`}>
            Test
          </Badge>
        )
        
        const badge = screen.getByTestId(`badge-${variant}`)
        expect(badge).toBeInTheDocument()
        
        // All variants should have text color classes that provide good contrast
        const classList = Array.from(badge.classList)
        const hasTextColorClass = classList.some(className => 
          className.includes('text-') && 
          (className.includes('-foreground') || className === 'text-foreground')
        )
        expect(hasTextColorClass).toBe(true)
      })
    })
  })

  describe('Error Handling Tests', () => {
    test('handles undefined variant gracefully', () => {
      // @ts-expect-error - Testing undefined variant
      render(<Badge variant={undefined} data-testid="badge">Test</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toBeInTheDocument()
      // Should fallback to default variant
      expect(badge).toHaveClass('bg-primary')
    })

    test('handles null children gracefully', () => {
      render(<Badge data-testid="badge">{null}</Badge>)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toBeEmptyDOMElement()
    })

    test('handles complex nested content', () => {
      const ComplexContent = () => (
        <div>
          <span>Nested</span>
          <div>
            <strong>Complex</strong>
            <em>Content</em>
          </div>
        </div>
      )
      
      render(
        <Badge data-testid="badge">
          <ComplexContent />
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('NestedComplexContent')
      expect(badge.querySelector('strong')).toHaveTextContent('Complex')
      expect(badge.querySelector('em')).toHaveTextContent('Content')
    })

    test('handles invalid props gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        // @ts-expect-error - Testing invalid props
        <Badge variant="invalid" size="large" data-testid="badge">
          Invalid Props
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Invalid Props')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Performance Tests', () => {
    test('meets render time performance standards', () => {
      const startTime = performance.now()
      
      render(<Badge>Performance Test</Badge>)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(10) // Should render very quickly
    })

    test('handles rapid variant changes efficiently', () => {
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const
      const startTime = performance.now()
      
      const { rerender } = render(
        <Badge variant="default">Test</Badge>
      )
      
      // Rapidly change variants multiple times
      for (let i = 0; i < 100; i++) {
        const variant = variants[i % variants.length]
        rerender(<Badge variant={variant}>Test {i}</Badge>)
      }
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // Should handle rapid changes efficiently
    })

    test('handles multiple badges efficiently', () => {
      const startTime = performance.now()
      
      const badges = Array.from({ length: 1000 }, (_, index) => (
        <Badge key={index} variant={index % 2 === 0 ? 'default' : 'secondary'}>
          Badge {index}
        </Badge>
      ))
      
      render(<div>{badges}</div>)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(200) // Should render many badges efficiently
    })
  })

  describe('TypeScript Integration Tests', () => {
    test('enforces proper typing for variant prop', () => {
      // These should compile without TypeScript errors
      render(<Badge variant="default">Default</Badge>)
      render(<Badge variant="secondary">Secondary</Badge>)
      render(<Badge variant="destructive">Destructive</Badge>)
      render(<Badge variant="outline">Outline</Badge>)
      
      expect(true).toBe(true) // Test passes if it compiles
    })

    test('supports all HTML div props with proper types', () => {
      const TestComponent = () => (
        <Badge
          variant="default"
          className="custom-class"
          id="test-id"
          onClick={() => {}}
          onKeyDown={() => {}}
          tabIndex={0}
          role="status"
          aria-label="Test badge"
          data-testid="typed-badge"
        >
          Typed Badge
        </Badge>
      )
      
      render(<TestComponent />)
      expect(screen.getByTestId('typed-badge')).toBeInTheDocument()
    })

    test('properly types the badgeVariants function', () => {
      // These should compile and work correctly
      const defaultVariant = badgeVariants({ variant: 'default' })
      const secondaryVariant = badgeVariants({ variant: 'secondary' })
      const destructiveVariant = badgeVariants({ variant: 'destructive' })
      const outlineVariant = badgeVariants({ variant: 'outline' })
      const noVariant = badgeVariants()
      
      expect(typeof defaultVariant).toBe('string')
      expect(typeof secondaryVariant).toBe('string')
      expect(typeof destructiveVariant).toBe('string')
      expect(typeof outlineVariant).toBe('string')
      expect(typeof noVariant).toBe('string')
    })

    test('supports proper children typing', () => {
      const TestComponent = () => (
        <div>
          <Badge>String children</Badge>
          <Badge>{42}</Badge>
          <Badge>{'Conditional'}</Badge>
          <Badge>
            <span>JSX children</span>
          </Badge>
          <Badge>
            {['Array', 'of', 'strings'].map((item, index) => (
              <span key={index}>{item} </span>
            ))}
          </Badge>
        </div>
      )
      
      render(<TestComponent />)
      expect(screen.getByText('String children')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('Conditional')).toBeInTheDocument()
      expect(screen.getByText('JSX children')).toBeInTheDocument()
      // Check for individual parts of the array since they're in separate spans
      expect(screen.getByText('Array')).toBeInTheDocument()
      expect(screen.getByText('of')).toBeInTheDocument()
      expect(screen.getByText('strings')).toBeInTheDocument()
    })
  })
})
