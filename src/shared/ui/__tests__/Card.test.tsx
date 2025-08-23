import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '../card'

expect.extend(toHaveNoViolations)

describe('Card Component Family', () => {
  describe('Card Component', () => {
    describe('Rendering Tests', () => {
      test('renders with default props and correct structure', () => {
        render(<Card data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toBeInTheDocument()
        expect(card).toHaveTextContent('Test Card')
        expect(card).toHaveAttribute('role', 'article')
      })

      test('applies default CSS classes correctly', () => {
        render(<Card data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass(
          'rounded-lg',
          'border',
          'bg-card',
          'text-card-foreground',
          'shadow-sm',
          'border-border',
          'p-4'
        )
      })

      test('applies custom className correctly', () => {
        render(<Card className="custom-class" data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('custom-class')
      })

      test('applies custom role correctly', () => {
        render(<Card role="section" data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveAttribute('role', 'section')
      })
    })

    describe('Variant Tests', () => {
      test('renders default variant correctly', () => {
        render(<Card variant="default" data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('bg-card')
        expect(card).not.toHaveClass('bg-background', 'shadow-lg')
      })

      test('renders outline variant correctly', () => {
        render(<Card variant="outline" data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('bg-background')
        expect(card).not.toHaveClass('shadow-lg')
      })

      test('renders elevated variant correctly', () => {
        render(<Card variant="elevated" data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('shadow-lg')
      })
    })

    describe('Size Tests', () => {
      test('renders small size correctly', () => {
        render(<Card size="sm" data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('p-3')
        expect(card).not.toHaveClass('p-4', 'p-6')
      })

      test('renders default size correctly', () => {
        render(<Card size="default" data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('p-4')
        expect(card).not.toHaveClass('p-3', 'p-6')
      })

      test('renders large size correctly', () => {
        render(<Card size="lg" data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('p-6')
        expect(card).not.toHaveClass('p-3', 'p-4')
      })
    })

    describe('Interactive States Tests', () => {
      test('applies hoverable styles when enabled', () => {
        render(<Card hoverable data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('transition-shadow', 'hover:shadow-md')
      })

      test('does not apply hoverable styles when disabled', () => {
        render(<Card hoverable={false} data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).not.toHaveClass('transition-shadow', 'hover:shadow-md')
      })
    })

    describe('Border Tests', () => {
      test('applies border when bordered is true (default)', () => {
        render(<Card data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('border-border')
        expect(card).not.toHaveClass('border-transparent')
      })

      test('removes border when bordered is false', () => {
        render(<Card bordered={false} data-testid="card">Test Card</Card>)
        
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('border-transparent')
        expect(card).not.toHaveClass('border-border')
      })
    })
  })

  describe('CardHeader Component', () => {
    describe('Rendering Tests', () => {
      test('renders with default props correctly', () => {
        render(<CardHeader data-testid="header">Header Content</CardHeader>)
        
        const header = screen.getByTestId('header')
        expect(header).toBeInTheDocument()
        expect(header).toHaveTextContent('Header Content')
      })

      test('applies default CSS classes correctly', () => {
        render(<CardHeader data-testid="header">Header Content</CardHeader>)
        
        const header = screen.getByTestId('header')
        expect(header).toHaveClass(
          'flex',
          'flex-col',
          'space-y-1.5',
          'p-6',
          'justify-start'
        )
      })

      test('applies custom className correctly', () => {
        render(<CardHeader className="custom-header" data-testid="header">Header Content</CardHeader>)
        
        const header = screen.getByTestId('header')
        expect(header).toHaveClass('custom-header')
      })
    })

    describe('Padding Tests', () => {
      test('applies padding when padded is true (default)', () => {
        render(<CardHeader data-testid="header">Header Content</CardHeader>)
        
        const header = screen.getByTestId('header')
        expect(header).toHaveClass('p-6')
      })

      test('removes padding when padded is false', () => {
        render(<CardHeader padded={false} data-testid="header">Header Content</CardHeader>)
        
        const header = screen.getByTestId('header')
        expect(header).not.toHaveClass('p-6')
      })
    })

    describe('Alignment Tests', () => {
      const alignments = [
        { align: 'start', class: 'justify-start' },
        { align: 'center', class: 'justify-center' },
        { align: 'end', class: 'justify-end' },
        { align: 'between', class: 'justify-between' },
        { align: 'around', class: 'justify-around' },
        { align: 'evenly', class: 'justify-evenly' },
      ] as const

      alignments.forEach(({ align, class: expectedClass }) => {
        test(`applies ${align} alignment correctly`, () => {
          render(<CardHeader align={align} data-testid="header">Header Content</CardHeader>)
          
          const header = screen.getByTestId('header')
          expect(header).toHaveClass(expectedClass)
        })
      })
    })
  })

  describe('CardTitle Component', () => {
    describe('Rendering Tests', () => {
      test('renders with default heading level (h3)', () => {
        render(<CardTitle data-testid="title">Test Title</CardTitle>)
        
        const title = screen.getByRole('heading', { level: 3 })
        expect(title).toBeInTheDocument()
        expect(title).toHaveTextContent('Test Title')
      })

      test('applies default CSS classes correctly', () => {
        render(<CardTitle data-testid="title">Test Title</CardTitle>)
        
        const title = screen.getByTestId('title')
        expect(title).toHaveClass(
          'text-2xl',
          'font-semibold',
          'leading-none',
          'tracking-tight'
        )
      })

      test('applies custom className correctly', () => {
        render(<CardTitle className="custom-title" data-testid="title">Test Title</CardTitle>)
        
        const title = screen.getByTestId('title')
        expect(title).toHaveClass('custom-title')
      })
    })

    describe('Heading Level Tests', () => {
      const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

      headingLevels.forEach((level, index) => {
        test(`renders as ${level} when specified`, () => {
          render(<CardTitle as={level}>Test Title</CardTitle>)
          
          const title = screen.getByRole('heading', { level: index + 1 })
          expect(title).toBeInTheDocument()
        })
      })
    })
  })

  describe('CardDescription Component', () => {
    describe('Rendering Tests', () => {
      test('renders with default props correctly', () => {
        render(<CardDescription data-testid="description">Test Description</CardDescription>)
        
        const description = screen.getByTestId('description')
        expect(description).toBeInTheDocument()
        expect(description).toHaveTextContent('Test Description')
      })

      test('applies default CSS classes correctly', () => {
        render(<CardDescription data-testid="description">Test Description</CardDescription>)
        
        const description = screen.getByTestId('description')
        expect(description).toHaveClass(
          'text-sm',
          'text-muted-foreground'
        )
      })

      test('applies custom className correctly', () => {
        render(<CardDescription className="custom-desc" data-testid="description">Test Description</CardDescription>)
        
        const description = screen.getByTestId('description')
        expect(description).toHaveClass('custom-desc')
      })
    })

    describe('Size Tests', () => {
      test('renders small size correctly', () => {
        render(<CardDescription size="sm" data-testid="description">Test Description</CardDescription>)
        
        const description = screen.getByTestId('description')
        expect(description).toHaveClass('text-xs')
        expect(description).not.toHaveClass('text-sm', 'text-base')
      })

      test('renders default size correctly', () => {
        render(<CardDescription size="default" data-testid="description">Test Description</CardDescription>)
        
        const description = screen.getByTestId('description')
        expect(description).toHaveClass('text-sm')
        expect(description).not.toHaveClass('text-xs', 'text-base')
      })

      test('renders large size correctly', () => {
        render(<CardDescription size="lg" data-testid="description">Test Description</CardDescription>)
        
        const description = screen.getByTestId('description')
        expect(description).toHaveClass('text-base')
        expect(description).not.toHaveClass('text-xs', 'text-sm')
      })
    })
  })

  describe('CardContent Component', () => {
    describe('Rendering Tests', () => {
      test('renders with default props correctly', () => {
        render(<CardContent data-testid="content">Test Content</CardContent>)
        
        const content = screen.getByTestId('content')
        expect(content).toBeInTheDocument()
        expect(content).toHaveTextContent('Test Content')
      })

      test('applies default CSS classes correctly', () => {
        render(<CardContent data-testid="content">Test Content</CardContent>)
        
        const content = screen.getByTestId('content')
        expect(content).toHaveClass('p-6', 'pt-0')
      })

      test('applies custom className correctly', () => {
        render(<CardContent className="custom-content" data-testid="content">Test Content</CardContent>)
        
        const content = screen.getByTestId('content')
        expect(content).toHaveClass('custom-content')
      })
    })

    describe('Padding Tests', () => {
      test('applies padding when padded is true (default)', () => {
        render(<CardContent data-testid="content">Test Content</CardContent>)
        
        const content = screen.getByTestId('content')
        expect(content).toHaveClass('p-6', 'pt-0')
      })

      test('removes padding when padded is false', () => {
        render(<CardContent padded={false} data-testid="content">Test Content</CardContent>)
        
        const content = screen.getByTestId('content')
        expect(content).not.toHaveClass('p-6', 'pt-0')
      })
    })
  })

  describe('CardFooter Component', () => {
    describe('Rendering Tests', () => {
      test('renders with default props correctly', () => {
        render(<CardFooter data-testid="footer">Footer Content</CardFooter>)
        
        const footer = screen.getByTestId('footer')
        expect(footer).toBeInTheDocument()
        expect(footer).toHaveTextContent('Footer Content')
      })

      test('applies default CSS classes correctly', () => {
        render(<CardFooter data-testid="footer">Footer Content</CardFooter>)
        
        const footer = screen.getByTestId('footer')
        expect(footer).toHaveClass(
          'flex',
          'items-center',
          'p-6',
          'pt-0',
          'justify-end'
        )
      })

      test('applies custom className correctly', () => {
        render(<CardFooter className="custom-footer" data-testid="footer">Footer Content</CardFooter>)
        
        const footer = screen.getByTestId('footer')
        expect(footer).toHaveClass('custom-footer')
      })
    })

    describe('Padding Tests', () => {
      test('applies padding when padded is true (default)', () => {
        render(<CardFooter data-testid="footer">Footer Content</CardFooter>)
        
        const footer = screen.getByTestId('footer')
        expect(footer).toHaveClass('p-6', 'pt-0')
      })

      test('removes padding when padded is false', () => {
        render(<CardFooter padded={false} data-testid="footer">Footer Content</CardFooter>)
        
        const footer = screen.getByTestId('footer')
        expect(footer).not.toHaveClass('p-6', 'pt-0')
      })
    })

    describe('Alignment Tests', () => {
      const alignments = [
        { align: 'start', class: 'justify-start' },
        { align: 'center', class: 'justify-center' },
        { align: 'end', class: 'justify-end' },
        { align: 'between', class: 'justify-between' },
        { align: 'around', class: 'justify-around' },
        { align: 'evenly', class: 'justify-evenly' },
      ] as const

      alignments.forEach(({ align, class: expectedClass }) => {
        test(`applies ${align} alignment correctly`, () => {
          render(<CardFooter align={align} data-testid="footer">Footer Content</CardFooter>)
          
          const footer = screen.getByTestId('footer')
          expect(footer).toHaveClass(expectedClass)
        })
      })
    })
  })

  describe('Integration Tests', () => {
    test('renders complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Card Title</CardTitle>
            <CardDescription data-testid="description">Card description text</CardDescription>
          </CardHeader>
          <CardContent data-testid="content">
            Card content goes here
          </CardContent>
          <CardFooter data-testid="footer">
            <button>Action</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('title')).toBeInTheDocument()
      expect(screen.getByTestId('description')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    test('maintains proper semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle as="h2">Main Title</CardTitle>
            <CardDescription>Supporting description</CardDescription>
          </CardHeader>
          <CardContent>
            Main content area
          </CardContent>
          <CardFooter>
            Footer actions
          </CardFooter>
        </Card>
      )

      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveTextContent('Main Title')
      
      const card = screen.getByRole('article')
      expect(card).toBeInTheDocument()
    })

    test('handles complex layout compositions', () => {
      render(
        <Card variant="elevated" size="lg" hoverable>
          <CardHeader align="center" padded={false}>
            <CardTitle as="h1">Large Elevated Card</CardTitle>
            <CardDescription size="lg">Large description text</CardDescription>
          </CardHeader>
          <CardContent padded={false}>
            <div>Custom content without padding</div>
          </CardContent>
          <CardFooter align="between" padded={false}>
            <button>Cancel</button>
            <button>Save</button>
          </CardFooter>
        </Card>
      )

      const card = screen.getByRole('article')
      expect(card).toHaveClass('shadow-lg', 'p-6', 'transition-shadow', 'hover:shadow-md')
      
      const header = card.querySelector('[class*="justify-center"]')
      expect(header).toBeInTheDocument()
      
      const footer = card.querySelector('[class*="justify-between"]')
      expect(footer).toBeInTheDocument()
    })
  })

  describe('Forward Ref Tests', () => {
    test('forwards ref correctly on Card', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Test Card</Card>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Test Card')
    })

    test('forwards ref correctly on CardHeader', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardHeader ref={ref}>Test Header</CardHeader>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Test Header')
    })

    test('forwards ref correctly on CardTitle', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<CardTitle ref={ref}>Test Title</CardTitle>)
      
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
      expect(ref.current).toHaveTextContent('Test Title')
    })

    test('forwards ref correctly on CardDescription', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<CardDescription ref={ref}>Test Description</CardDescription>)
      
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
      expect(ref.current).toHaveTextContent('Test Description')
    })

    test('forwards ref correctly on CardContent', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardContent ref={ref}>Test Content</CardContent>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Test Content')
    })

    test('forwards ref correctly on CardFooter', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardFooter ref={ref}>Test Footer</CardFooter>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Test Footer')
    })
  })

  describe('Accessibility Tests', () => {
    test('has no accessibility violations with default props', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Title</CardTitle>
            <CardDescription>Accessible description</CardDescription>
          </CardHeader>
          <CardContent>
            Accessible content
          </CardContent>
          <CardFooter>
            <button>Accessible Action</button>
          </CardFooter>
        </Card>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('maintains proper semantic roles', () => {
      render(
        <Card role="region" aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Card with region role</CardTitle>
            <CardDescription>This card has proper ARIA labeling</CardDescription>
          </CardHeader>
          <CardContent>
            Content with proper accessibility
          </CardContent>
        </Card>
      )

      const card = screen.getByRole('region')
      expect(card).toHaveAttribute('aria-labelledby', 'card-title')
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'card-title')
    })

    test('supports proper heading hierarchy', () => {
      render(
        <div>
          <Card>
            <CardHeader>
              <CardTitle as="h1">Main Title</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle as="h2">Section Title</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle as="h3">Subsection Title</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title')
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section Title')
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection Title')
    })
  })

  describe('Error Handling Tests', () => {
    test('handles missing children gracefully', () => {
      render(<Card data-testid="empty-card" />)
      
      const card = screen.getByTestId('empty-card')
      expect(card).toBeInTheDocument()
      expect(card).toBeEmptyDOMElement()
    })

    test('handles invalid props gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        // @ts-expect-error - Testing invalid props
        <Card variant="invalid" size="invalid" data-testid="card">
          Test Card
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })

    test('handles deeply nested content', () => {
      const NestedContent = () => (
        <div>
          <div>
            <div>
              <span>Deeply nested content</span>
            </div>
          </div>
        </div>
      )

      render(
        <Card>
          <CardContent>
            <NestedContent />
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Deeply nested content')).toBeInTheDocument()
    })
  })

  describe('Performance Tests', () => {
    test('meets render time performance standards', () => {
      const startTime = performance.now()
      
      render(
        <Card>
          <CardHeader>
            <CardTitle>Performance Test</CardTitle>
            <CardDescription>Testing render performance</CardDescription>
          </CardHeader>
          <CardContent>
            Performance test content
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(50) // Should render in less than 50ms
    })

    test('handles multiple cards efficiently', () => {
      const startTime = performance.now()
      
      const cards = Array.from({ length: 100 }, (_, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>Card {index + 1}</CardTitle>
            <CardDescription>Description {index + 1}</CardDescription>
          </CardHeader>
          <CardContent>Content {index + 1}</CardContent>
        </Card>
      ))
      
      render(<div>{cards}</div>)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(500) // Should render 100 cards in less than 500ms
    })
  })

  describe('TypeScript Integration Tests', () => {
    test('enforces proper typing for props', () => {
      // These should compile without TypeScript errors
      render(<Card variant="default" size="sm" hoverable bordered role="region" />)
      render(<CardHeader align="center" padded={false} />)
      render(<CardTitle as="h2" />)
      render(<CardDescription size="lg" />)
      render(<CardContent padded={false} />)
      render(<CardFooter align="between" padded={false} />)
      
      expect(true).toBe(true) // Test passes if it compiles
    })

    test('supports all component variations with proper types', () => {
      const TestComponent = () => (
        <Card variant="elevated" size="lg" hoverable bordered={false} role="section">
          <CardHeader align="center" padded={false}>
            <CardTitle as="h1">Title</CardTitle>
            <CardDescription size="lg">Description</CardDescription>
          </CardHeader>
          <CardContent padded={false}>
            Content
          </CardContent>
          <CardFooter align="between" padded={false}>
            Footer
          </CardFooter>
        </Card>
      )
      
      render(<TestComponent />)
      expect(screen.getByRole('section')).toBeInTheDocument()
    })
  })
})
