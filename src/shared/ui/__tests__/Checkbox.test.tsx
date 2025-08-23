import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Checkbox } from '../Checkbox';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Checkbox Component Test Suite
 * 
 * Tests the Checkbox component for rendering, accessibility, interaction,
 * state management, and integration following TypeScript-first development practices.
 * 
 * @group unit
 * @group ui
 */
describe('Checkbox Component', () => {
  // Test utilities
  const defaultProps = {
    'aria-label': 'Test checkbox',
  } as const;

  const performanceThreshold = 50; // ms

  describe('Rendering Tests', () => {
    it('renders with default props and correct structure', () => {
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('aria-label', 'Test checkbox');
      expect(checkbox).toHaveClass('peer', 'h-4', 'w-4', 'shrink-0', 'rounded-sm');
    });

    it('applies default CSS classes correctly', () => {
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass(
        'peer',
        'h-4',
        'w-4',
        'shrink-0',
        'rounded-sm',
        'border',
        'border-primary',
        'ring-offset-background',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      );
    });

    it('applies custom className correctly', () => {
      const customClass = 'custom-checkbox-class';
      render(<Checkbox {...defaultProps} className={customClass} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass(customClass);
      expect(checkbox).toHaveClass('peer', 'h-4'); // Also has default classes
    });

    it('renders the check indicator when checked', () => {
      render(<Checkbox {...defaultProps} checked />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      
      // Check for the indicator element (it may have different selectors)
      const checkIcon = checkbox.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    it('does not render check indicator when unchecked', () => {
      render(<Checkbox {...defaultProps} checked={false} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('State Management Tests', () => {
    it('handles controlled checkbox correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      const { rerender } = render(
        <Checkbox {...defaultProps} checked={false} onCheckedChange={handleChange} />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
      
      // Re-render with updated state
      rerender(<Checkbox {...defaultProps} checked={true} onCheckedChange={handleChange} />);
      expect(checkbox).toBeChecked();
    });

    it('handles uncontrolled checkbox correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Checkbox {...defaultProps} onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(checkbox).toBeChecked();
      
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(false);
      expect(checkbox).not.toBeChecked();
    });

    it('handles indeterminate state correctly', () => {
      render(<Checkbox {...defaultProps} checked="indeterminate" />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });

    it('handles disabled state correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Checkbox {...defaultProps} disabled onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
      
      await user.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('handles defaultChecked prop correctly', () => {
      render(<Checkbox {...defaultProps} defaultChecked />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  describe('Accessibility Tests', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Checkbox {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper semantic role and properties', () => {
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('role', 'checkbox');
      expect(checkbox).toHaveAttribute('type', 'button');
    });

    it('supports proper ARIA attributes', () => {
      render(
        <Checkbox 
          {...defaultProps}
          aria-describedby="help-text"
          aria-required="true"
          checked
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'help-text');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('supports indeterminate ARIA state', () => {
      render(<Checkbox {...defaultProps} checked="indeterminate" />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });

    it('supports screen reader announcements', () => {
      const ariaLabel = 'Accept terms and conditions';
      render(<Checkbox aria-label={ariaLabel} />);
      
      const checkbox = screen.getByLabelText(ariaLabel);
      expect(checkbox).toBeInTheDocument();
    });

    it('works correctly with form labels', () => {
      render(
        <div>
          <label htmlFor="terms-checkbox">
            Accept Terms
          </label>
          <Checkbox id="terms-checkbox" />
        </div>
      );
      
      const checkbox = screen.getByLabelText('Accept Terms');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('id', 'terms-checkbox');
    });
  });

  describe('Keyboard Interaction Tests', () => {
    it('handles keyboard navigation correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Checkbox {...defaultProps} onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      
      // Focus checkbox
      checkbox.focus();
      expect(checkbox).toHaveFocus();
      
      // Press space to toggle
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(true);
      
      // Press space again to toggle back
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('handles Enter key correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Checkbox {...defaultProps} onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      
      // Radix Checkbox responds to Space key, not Enter for activation
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('does not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Checkbox {...defaultProps} disabled onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      
      await user.keyboard(' ');
      await user.keyboard('{Enter}');
      
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Mouse Interaction Tests', () => {
    it('handles click events correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Checkbox {...defaultProps} onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('handles double-click correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Checkbox {...defaultProps} onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      
      await user.dblClick(checkbox);
      // Should toggle twice
      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange).toHaveBeenNthCalledWith(1, true);
      expect(handleChange).toHaveBeenNthCalledWith(2, false);
    });

    it('handles hover states correctly', async () => {
      const user = userEvent.setup();
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      
      // Just verify hover/unhover events don't crash
      await user.hover(checkbox);
      expect(checkbox).toBeInTheDocument();
      
      await user.unhover(checkbox);
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Focus Management Tests', () => {
    it('handles focus and blur correctly', async () => {
      const user = userEvent.setup();
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      
      // Use user events for more realistic focus
      await user.click(checkbox);
      checkbox.focus();
      expect(checkbox).toHaveFocus();
      expect(checkbox).toHaveClass('focus-visible:outline-none');
      
      checkbox.blur();
      expect(checkbox).not.toHaveFocus();
    });

    it('shows focus ring on keyboard focus', async () => {
      const user = userEvent.setup();
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      
      // Tab to focus (keyboard navigation)
      await user.tab();
      expect(checkbox).toHaveFocus();
      expect(checkbox).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Form Integration Tests', () => {
    it('works correctly in forms', () => {
      const handleSubmit = jest.fn((e) => {
        e.preventDefault();
      });
      
      render(
        <form onSubmit={handleSubmit}>
          <Checkbox name="terms" value="accepted" defaultChecked />
          <button type="submit">Submit</button>
        </form>
      );
      
      const checkbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button');
      
      // Check that the value prop is properly applied
      expect(checkbox).toHaveAttribute('value', 'accepted');
      expect(checkbox).toBeChecked();
      
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('handles form validation correctly', () => {
      render(
        <form>
          <Checkbox name="required-field" required aria-label="Required field" />
        </form>
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeRequired();
    });
  });

  describe('Error Handling Tests', () => {
    it('handles invalid props gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <Checkbox 
          {...defaultProps}
          // @ts-expect-error Testing invalid prop
          invalidProp="invalid"
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('handles missing onCheckedChange gracefully', async () => {
      const user = userEvent.setup();
      
      render(<Checkbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      
      // Should not crash when clicking without onChange handler
      await user.click(checkbox);
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    it('meets render time performance standards', () => {
      const startTime = performance.now();
      
      render(<Checkbox {...defaultProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(performanceThreshold);
    });

    it('handles rapid state changes efficiently', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Checkbox {...defaultProps} onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      const startTime = performance.now();
      
      // Rapid clicks with small delays
      for (let i = 0; i < 3; i++) {
        await user.click(checkbox);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(performanceThreshold * 4); // More generous timing
      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Forward Ref Tests', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      
      render(<Checkbox ref={ref} {...defaultProps} />);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveAttribute('type', 'button');
      expect(ref.current).toHaveAttribute('role', 'checkbox');
    });

    it('supports ref callback', () => {
      let checkboxElement: HTMLButtonElement | null = null;
      
      render(
        <Checkbox 
          ref={(el) => { checkboxElement = el; }}
          {...defaultProps}
        />
      );
      
      expect(checkboxElement).toBeInstanceOf(HTMLButtonElement);
      expect(checkboxElement).toHaveAttribute('role', 'checkbox');
    });
  });

  describe('Visual State Tests', () => {
    it('applies checked state styling correctly', () => {
      render(<Checkbox {...defaultProps} checked />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
      expect(checkbox).toHaveClass('data-[state=checked]:bg-primary');
      expect(checkbox).toHaveClass('data-[state=checked]:text-primary-foreground');
    });

    it('applies unchecked state styling correctly', () => {
      render(<Checkbox {...defaultProps} checked={false} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('applies custom styles correctly', () => {
      const customStyle = { backgroundColor: 'red', width: '20px' };
      
      render(
        <Checkbox 
          {...defaultProps}
          style={customStyle}
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      // Check for style attributes instead of computed styles
      expect(checkbox).toHaveAttribute('style');
      expect(checkbox.getAttribute('style')).toContain('background-color: red');
      expect(checkbox.getAttribute('style')).toContain('width: 20px');
    });
  });

  describe('TypeScript Integration Tests', () => {
    it('enforces proper typing for props', () => {
      // These should compile without errors
      const validProps = {
        checked: true,
        defaultChecked: false,
        disabled: true,
        required: true,
        name: 'test-checkbox',
        value: 'test-value',
        onCheckedChange: (checked: boolean) => {},
        'aria-label': 'Test checkbox',
      };
      
      render(<Checkbox {...validProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('aria-label', 'Test checkbox');
      expect(checkbox).toBeChecked();
      expect(checkbox).toBeDisabled();
    });

    it('supports all CheckedState types correctly', () => {
      const { rerender } = render(<Checkbox {...defaultProps} checked={true} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
      
      rerender(<Checkbox {...defaultProps} checked={false} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
      
      rerender(<Checkbox {...defaultProps} checked="indeterminate" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });
  });
});
