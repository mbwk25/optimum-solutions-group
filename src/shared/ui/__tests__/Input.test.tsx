/**
 * Input Component Test Suite
 * 
 * Following the coding standards for comprehensive component testing:
 * - TypeScript strict mode compliance
 * - Accessibility testing with axe-core
 * - Performance benchmarking
 * - User interaction testing
 * - Error handling
 * - Form validation states
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';

import { Input, type InputProps } from '../input';
import { testAccessibility, benchmarkComponent } from '@/__tests__/utils/testUtils';
import { createMockApiResponse } from '@/__tests__/utils/testDataFactories';

describe('Input Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering Tests', () => {
    it('renders with default props and correct structure', () => {
      render(<Input data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toBeEnabled();
      expect(input).not.toBeRequired();
    });

    it('renders with different input types', () => {
      const types: InputProps['type'][] = ['text', 'email', 'password', 'number', 'tel', 'url'];
      
      types.forEach(type => {
        const { unmount } = render(<Input type={type} data-testid={`test-${type}`} />);
        const input = screen.getByTestId(`test-${type}`);
        
        expect(input).toHaveAttribute('type', type);
        unmount();
      });
    });

    it('applies custom className correctly', () => {
      const customClass = 'custom-input-class';
      render(<Input className={customClass} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      
      expect(input).toHaveClass(customClass);
    });

    it('applies wrapper className correctly', () => {
      const wrapperClass = 'custom-wrapper-class';
      render(<Input wrapperClassName={wrapperClass} data-testid="test-input" />);
      const wrapper = screen.getByTestId('test-input').parentElement;
      
      expect(wrapper).toHaveClass(wrapperClass);
    });

    it('handles placeholder text correctly', () => {
      const placeholder = 'Enter your email';
      render(<Input placeholder={placeholder} data-testid="test-input" />);
      const input = screen.getByTestId('test-input');
      
      expect(input).toHaveAttribute('placeholder', placeholder);
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });

    it('handles default value correctly', () => {
      const defaultValue = 'initial value';
      render(<Input defaultValue={defaultValue} data-testid="test-input" />);
      const input = screen.getByTestId('test-input') as HTMLInputElement;
      
      expect(input.value).toBe(defaultValue);
    });
  });

  describe('State Management Tests', () => {
    it('handles controlled input correctly', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-input"
          />
        );
      };

      render(<TestComponent />);
      const input = screen.getByTestId('controlled-input') as HTMLInputElement;
      const user = userEvent.setup();

      expect(input.value).toBe('');

      await user.type(input, 'test value');
      expect(input.value).toBe('test value');
    });

    it('handles disabled state correctly', () => {
      render(<Input disabled data-testid="disabled-input" />);
      const input = screen.getByTestId('disabled-input');
      
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('aria-disabled', 'true');
    });

    it('handles readonly state correctly', () => {
      render(<Input readOnly data-testid="readonly-input" />);
      const input = screen.getByTestId('readonly-input');
      
      expect(input).toHaveAttribute('readonly');
    });

    it('handles loading state correctly', () => {
      render(<Input isLoading data-testid="loading-input" />);
      const input = screen.getByTestId('loading-input');
      const loadingIndicator = screen.getByText('Loading...');
      
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('aria-busy', 'true');
      expect(loadingIndicator).toBeInTheDocument();
    });

    it('handles required state correctly', () => {
      render(<Input required data-testid="required-input" />);
      const input = screen.getByTestId('required-input');
      
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Accessibility Tests', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <div>
          <label htmlFor="accessible-input">Email Address</label>
          <Input id="accessible-input" type="email" />
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports proper ARIA attributes', () => {
      const ariaLabel = 'Email input field';
      const ariaDescribedBy = 'email-help';
      
      render(
        <>
          <Input 
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            data-testid="aria-input"
          />
          <div id={ariaDescribedBy}>Enter your email address</div>
        </>
      );
      
      const input = screen.getByTestId('aria-input');
      
      expect(input).toHaveAttribute('aria-label', ariaLabel);
      expect(input).toHaveAttribute('aria-describedby', ariaDescribedBy);
    });

    it('handles invalid state with proper ARIA attributes', () => {
      const errorMessage = 'email-error';
      
      render(
        <>
          <Input 
            aria-invalid
            aria-errormessage={errorMessage}
            data-testid="invalid-input"
          />
          <div id={errorMessage}>Invalid email format</div>
        </>
      );
      
      const input = screen.getByTestId('invalid-input');
      
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-errormessage', errorMessage);
    });

    it('supports screen reader announcements for errors', () => {
      render(
        <Input 
          aria-invalid
          aria-errormessage="error-msg"
          data-testid="error-input"
        />
      );
      
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
    });
  });

  describe('Interaction Tests', () => {
    it('handles onChange events correctly', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} data-testid="change-input" />);
      const input = screen.getByTestId('change-input');

      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalledTimes(4); // One for each character
      expect(handleChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'test'
          })
        })
      );
    });

    it('handles onBlur events correctly', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onBlur={handleBlur} data-testid="blur-input" />);
      const input = screen.getByTestId('blur-input');

      await user.click(input);
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation correctly', async () => {
      const handleKeyDown = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onKeyDown={handleKeyDown} data-testid="keyboard-input" />);
      const input = screen.getByTestId('keyboard-input');

      await user.type(input, 'test');
      await user.keyboard('{Enter}');
      
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'Enter'
        })
      );
    });

    it('clears input on Escape key press', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('initial value');
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            data-testid="escape-input"
          />
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);
      const input = screen.getByTestId('escape-input') as HTMLInputElement;

      expect(input.value).toBe('initial value');
      
      await user.click(input);
      await user.keyboard('{Escape}');
      
      expect(input.value).toBe('');
    });

    it('does not clear input on Escape when disabled', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('initial value');
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            disabled
            data-testid="disabled-escape-input"
          />
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);
      const input = screen.getByTestId('disabled-escape-input') as HTMLInputElement;

      expect(input.value).toBe('initial value');
      
      await user.keyboard('{Escape}');
      
      expect(input.value).toBe('initial value'); // Should remain unchanged
    });
  });

  describe('Addon and Enhancement Tests', () => {
    it('renders addon before correctly', () => {
      const AddonBefore = <span data-testid="addon-before">$</span>;
      
      render(
        <Input addonBefore={AddonBefore} data-testid="addon-before-input" />
      );
      
      const addon = screen.getByTestId('addon-before');
      const input = screen.getByTestId('addon-before-input');
      
      expect(addon).toBeInTheDocument();
      expect(input).toHaveClass('pl-10'); // Should have left padding for addon
    });

    it('renders addon after correctly', () => {
      const AddonAfter = <span data-testid="addon-after">@example.com</span>;
      
      render(
        <Input addonAfter={AddonAfter} data-testid="addon-after-input" />
      );
      
      const addon = screen.getByTestId('addon-after');
      const input = screen.getByTestId('addon-after-input');
      
      expect(addon).toBeInTheDocument();
      expect(input).toHaveClass('pr-10'); // Should have right padding for addon
    });

    it('prioritizes loading indicator over addon after', () => {
      const AddonAfter = <span data-testid="addon-after">Icon</span>;
      
      render(
        <Input 
          addonAfter={AddonAfter} 
          isLoading 
          data-testid="loading-addon-input" 
        />
      );
      
      const loadingIndicator = screen.getByText('Loading...');
      const addon = screen.queryByTestId('addon-after');
      
      expect(loadingIndicator).toBeInTheDocument();
      expect(addon).not.toBeInTheDocument(); // Should be hidden when loading
    });
  });

  describe('Error Handling Tests', () => {
    it('handles invalid props gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        render(
          <Input 
            // @ts-expect-error Testing invalid prop
            invalidProp="should not crash"
            data-testid="invalid-prop-input"
          />
        );
      }).not.toThrow();
      
      const input = screen.getByTestId('invalid-prop-input');
      expect(input).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('handles missing onChange in controlled mode gracefully', () => {
      expect(() => {
        render(<Input value="controlled value" data-testid="no-onchange-input" />);
      }).not.toThrow();
      
      const input = screen.getByTestId('no-onchange-input') as HTMLInputElement;
      expect(input.value).toBe('controlled value');
    });
  });

  describe('Performance Tests', () => {
    it('meets render time performance standards', async () => {
      const { passed, metrics } = await benchmarkComponent(
        () => render(<Input placeholder="Performance test" />),
        16 // 60fps target
      );
      
      expect(passed).toBe(true);
      expect(metrics.renderTime).toBeLessThan(16);
    });

    it('memoizes event handlers correctly', () => {
      const handleChange = jest.fn();
      
      const TestComponent = () => {
        const [, forceUpdate] = React.useReducer(x => x + 1, 0);
        
        return (
          <>
            <Input onChange={handleChange} data-testid="memo-input" />
            <button onClick={forceUpdate} data-testid="rerender-button">
              Rerender
            </button>
          </>
        );
      };

      render(<TestComponent />);
      const input = screen.getByTestId('memo-input');
      const button = screen.getByTestId('rerender-button');
      
      // Get initial handler reference
      const initialOnChange = (input as any).onChange;
      
      // Force rerender
      fireEvent.click(button);
      
      // Handler should be memoized (same reference)
      expect((input as any).onChange).toBe(initialOnChange);
    });
  });

  describe('Integration Tests', () => {
    it('works in form context', async () => {
      const handleSubmit = jest.fn();
      const user = userEvent.setup();
      
      render(
        <form onSubmit={handleSubmit}>
          <label htmlFor="form-input">Name</label>
          <Input id="form-input" name="name" required data-testid="form-input" />
          <button type="submit" data-testid="submit-button">Submit</button>
        </form>
      );
      
      const input = screen.getByTestId('form-input');
      const button = screen.getByTestId('submit-button');
      
      await user.type(input, 'John Doe');
      await user.click(button);
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('integrates with error validation', async () => {
      const validateEmail = (value: string) => {
        if (!value.includes('@')) {
          return 'Please enter a valid email address';
        }
        return null;
      };

      const TestForm = () => {
        const [value, setValue] = React.useState('');
        const [error, setError] = React.useState<string | null>(null);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = e.target.value;
          setValue(newValue);
          setError(validateEmail(newValue));
        };

        return (
          <>
            <Input
              type="email"
              value={value}
              onChange={handleChange}
              aria-invalid={!!error}
              aria-errormessage={error ? 'email-error' : undefined}
              data-testid="email-input"
            />
            {error && (
              <div id="email-error" role="alert" data-testid="error-message">
                {error}
              </div>
            )}
          </>
        );
      };

      const user = userEvent.setup();
      render(<TestForm />);
      
      const input = screen.getByTestId('email-input');
      
      await user.type(input, 'invalid-email');
      
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'true');
      
      await user.clear(input);
      await user.type(input, 'valid@email.com');
      
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Forward Ref Tests', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      
      render(<Input ref={ref} data-testid="ref-input" />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toBe(screen.getByTestId('ref-input'));
    });

    it('supports wrapper ref', () => {
      const wrapperRef = React.createRef<HTMLDivElement>();
      
      render(<Input wrapperRef={wrapperRef} data-testid="wrapper-ref-input" />);
      
      expect(wrapperRef.current).toBeInstanceOf(HTMLDivElement);
      expect(wrapperRef.current).toContainElement(screen.getByTestId('wrapper-ref-input'));
    });
  });
});
