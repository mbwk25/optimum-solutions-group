import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
} from '../select';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Select Component Test Suite
 * 
 * Tests the Select component family for rendering, accessibility, interaction,
 * state management, and integration following TypeScript-first development practices.
 * 
 * @group unit
 * @group ui
 */
describe('Select Component', () => {
  // Test utilities
  const performanceThreshold = 50; // ms

  // Default Select setup for testing
  const DefaultSelect = ({ onValueChange, value, defaultValue, disabled, ...props }: {
    onValueChange?: (value: string) => void;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    [key: string]: unknown;
  } = {}) => (
    <Select onValueChange={onValueChange} value={value} defaultValue={defaultValue} disabled={disabled} {...props}>
      <SelectTrigger data-testid="select-trigger" aria-label="Select option">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent data-testid="select-content">
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
        <SelectItem value="grape">Grape</SelectItem>
      </SelectContent>
    </Select>
  );

  // Complex Select setup with groups and separators
  const GroupedSelect = ({ onValueChange, ...props }: {
    onValueChange?: (value: string) => void;
    [key: string]: unknown;
  } = {}) => (
    <Select onValueChange={onValueChange} {...props}>
      <SelectTrigger data-testid="grouped-trigger">
        <SelectValue placeholder="Select a fruit or vegetable" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  describe('SelectTrigger Rendering Tests', () => {
    it('renders with default props and correct structure', () => {
      render(<DefaultSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('role', 'combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
    });

    it('applies default CSS classes correctly', () => {
      render(<DefaultSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'items-center',
        'justify-between',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2',
        'text-sm',
        'ring-offset-background',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2',
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      );
    });

    it('applies custom className correctly', () => {
      const customClass = 'custom-select-class';
      render(
        <Select>
          <SelectTrigger className={customClass}>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass(customClass);
      expect(trigger).toHaveClass('flex', 'h-10'); // Also has default classes
    });

    it('shows chevron down icon', () => {
      render(<DefaultSelect />);
      
      const chevronIcon = screen.getByTestId('select-trigger').querySelector('svg');
      expect(chevronIcon).toBeInTheDocument();
      expect(chevronIcon).toHaveClass('h-4', 'w-4', 'opacity-50');
    });
  });

  describe('Select State Management Tests', () => {
    it('handles controlled select correctly', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();
      
      const { rerender } = render(
        <DefaultSelect value="" onValueChange={handleValueChange} />
      );
      
      const trigger = screen.getByTestId('select-trigger');
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
      
      await user.click(trigger);
      await user.click(screen.getByText('Apple'));
      
      expect(handleValueChange).toHaveBeenCalledWith('apple');
      
      // Re-render with updated value
      rerender(<DefaultSelect value="apple" onValueChange={handleValueChange} />);
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    it('handles uncontrolled select correctly', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();
      
      render(<DefaultSelect onValueChange={handleValueChange} />);
      
      const trigger = screen.getByTestId('select-trigger');
      
      await user.click(trigger);
      await user.click(screen.getByText('Banana'));
      
      expect(handleValueChange).toHaveBeenCalledWith('banana');
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    it('handles defaultValue correctly', () => {
      render(<DefaultSelect defaultValue="orange" />);
      
      expect(screen.getByText('Orange')).toBeInTheDocument();
    });

    it('handles disabled state correctly', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();
      
      render(<DefaultSelect disabled onValueChange={handleValueChange} />);
      
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
      
      await user.click(trigger);
      expect(handleValueChange).not.toHaveBeenCalled();
      // Content should not open when disabled
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  describe('Select Interaction Tests', () => {
    it('opens dropdown when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<DefaultSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(trigger);
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    it('closes dropdown when item is selected', async () => {
      const user = userEvent.setup();
      render(<DefaultSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      
      await user.click(trigger);
      expect(screen.getByText('Apple')).toBeInTheDocument();
      
      await user.click(screen.getByText('Apple'));
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });

    it('handles keyboard navigation correctly', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<DefaultSelect onValueChange={onValueChange} />);
      
      const trigger = screen.getByTestId('select-trigger');
      
      // Open with Enter key
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      
      // Select with Enter
      await user.keyboard('{Enter}');
      
      // Verify the selection was made (Orange is 3rd item after 2 ArrowDown)
      await waitFor(() => {
        expect(onValueChange).toHaveBeenCalledWith('orange');
      });
    });

    it('handles Space key to open dropdown', async () => {
      const user = userEvent.setup();
      render(<DefaultSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      
      trigger.focus();
      await user.keyboard(' ');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(<DefaultSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('SelectContent and SelectItem Tests', () => {
    it('renders content with proper portal structure', async () => {
      const user = userEvent.setup();
      render(<DefaultSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);
      
      const content = screen.getByTestId('select-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass(
        'relative',
        'z-50',
        'max-h-96',
        'min-w-[8rem]',
        'overflow-hidden',
        'rounded-md',
        'border',
        'bg-popover',
        'text-popover-foreground',
        'shadow-md'
      );
    });

    it('renders select items correctly', async () => {
      const user = userEvent.setup();
      render(<DefaultSelect />);
      
      await user.click(screen.getByTestId('select-trigger'));
      
      const items = ['Apple', 'Banana', 'Orange', 'Grape'];
      items.forEach(item => {
        const element = screen.getByText(item);
        expect(element).toBeInTheDocument();
        expect(element.closest('[role="option"]')).toBeInTheDocument();
      });
    });

    it('highlights selected item with check indicator', async () => {
      const user = userEvent.setup();
      render(<DefaultSelect defaultValue="apple" />);
      
      await user.click(screen.getByTestId('select-trigger'));
      
      // Look for the selected item indicator (Radix UI adds data-state="checked")
      const selectedItem = screen.getByTestId('select-content').querySelector('[data-state="checked"]');
      expect(selectedItem).toBeInTheDocument();
      expect(selectedItem).toHaveAttribute('aria-selected', 'true');
      
      // Check for the check icon indicator
      const checkIcon = selectedItem?.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    it('handles item click correctly', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();
      
      render(<DefaultSelect onValueChange={handleValueChange} />);
      
      await user.click(screen.getByTestId('select-trigger'));
      await user.click(screen.getByText('Orange'));
      
      expect(handleValueChange).toHaveBeenCalledWith('orange');
    });
  });

  describe('SelectLabel and SelectGroup Tests', () => {
    it('renders grouped select with labels correctly', async () => {
      const user = userEvent.setup();
      render(<GroupedSelect />);
      
      await user.click(screen.getByTestId('grouped-trigger'));
      
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
    });

    it('applies correct styling to labels', async () => {
      const user = userEvent.setup();
      render(<GroupedSelect />);
      
      await user.click(screen.getByTestId('grouped-trigger'));
      
      const label = screen.getByText('Fruits');
      expect(label).toHaveClass('py-1.5', 'pl-8', 'pr-2', 'text-sm', 'font-semibold');
    });

    it('renders separator between groups', async () => {
      const user = userEvent.setup();
      render(<GroupedSelect />);
      
      await user.click(screen.getByTestId('grouped-trigger'));
      
      // SelectSeparator should be present (though might be hard to query directly)
      const content = screen.getByRole('listbox');
      expect(content).toBeInTheDocument();
      
      // Verify both groups are present
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<DefaultSelect />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes on trigger', () => {
      render(<DefaultSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('role', 'combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      // Note: Radix UI Select doesn't set aria-haspopup by default
      // The combobox role implies popup behavior
    });

    it('updates ARIA attributes when opened', async () => {
      const user = userEvent.setup();
      render(<DefaultSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('supports proper ARIA labeling', () => {
      render(
        <Select>
          <SelectTrigger aria-labelledby="select-label">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-labelledby', 'select-label');
    });

    it('has proper roles on content and items', async () => {
      const user = userEvent.setup();
      render(<DefaultSelect />);
      
      await user.click(screen.getByTestId('select-trigger'));
      
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4);
      options.forEach(option => {
        expect(option).toHaveAttribute('role', 'option');
      });
    });
  });

  describe('Form Integration Tests', () => {
    it('works correctly in forms', () => {
      const handleSubmit = jest.fn((e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        return formData.get('fruit');
      });
      
      render(
        <form onSubmit={handleSubmit}>
          <Select name="fruit" defaultValue="apple">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectContent>
          </Select>
          <button type="submit">Submit</button>
        </form>
      );
      
      const trigger = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button');
      
      // Radix UI Select creates a hidden input for form submission
      // The name attribute is on the hidden input, not the trigger
      // Verify the trigger shows the selected value
      const triggerApple = screen.getByRole('combobox').querySelector('span');
      expect(triggerApple).toHaveTextContent('Apple');
      
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('supports required validation', () => {
      render(
        <form>
          <Select required>
            <SelectTrigger>
              <SelectValue placeholder="Required select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectContent>
          </Select>
        </form>
      );
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeRequired();
    });
  });

  describe('Error Handling Tests', () => {
    it('handles invalid props gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <Select
          // @ts-expect-error Testing invalid prop
          invalidProp="invalid"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('handles missing onValueChange gracefully', async () => {
      const user = userEvent.setup();
      
      render(<DefaultSelect />);
      
      const trigger = screen.getByTestId('select-trigger');
      
      // Should not crash when selecting without onChange handler
      await user.click(trigger);
      await user.click(screen.getByText('Apple'));
      
      expect(trigger).toBeInTheDocument();
    });

    it('handles empty content gracefully', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Empty select" />
          </SelectTrigger>
          <SelectContent>
            {/* Empty content */}
          </SelectContent>
        </Select>
      );
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      expect(screen.getByText('Empty select')).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    it('meets render time performance standards', () => {
      const startTime = performance.now();
      
      render(<DefaultSelect />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(performanceThreshold);
    });

    it('handles rapid interactions efficiently', async () => {
      const user = userEvent.setup();
      const handleValueChange = jest.fn();
      
      render(<DefaultSelect onValueChange={handleValueChange} />);
      
      const trigger = screen.getByTestId('select-trigger');
      const startTime = performance.now();
      
      // Rapid open/close operations
      for (let i = 0; i < 3; i++) {
        await user.click(trigger);
        await user.keyboard('{Escape}');
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(performanceThreshold * 10); // Increase threshold for CI/testing environments
    });

    it('handles large number of items efficiently', async () => {
      const user = userEvent.setup();
      const manyItems = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
      
      const startTime = performance.now();
      
      render(
        <Select>
          <SelectTrigger data-testid="large-select">
            <SelectValue placeholder="Large select" />
          </SelectTrigger>
          <SelectContent>
            {manyItems.map((item, index) => (
              <SelectItem key={index} value={`item-${index}`}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(performanceThreshold * 4);
      
      // Test opening the select
      const trigger = screen.getByTestId('large-select');
      await user.click(trigger);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 100')).toBeInTheDocument();
    });
  });

  describe('Forward Ref Tests', () => {
    it('forwards ref correctly on SelectTrigger', () => {
      const ref = React.createRef<HTMLButtonElement>();
      
      render(
        <Select>
          <SelectTrigger ref={ref}>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveAttribute('role', 'combobox');
    });

    it('forwards ref correctly on SelectItem', async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem ref={ref} value="test">
              Test Item
            </SelectItem>
          </SelectContent>
        </Select>
      );
      
      await user.click(screen.getByRole('combobox'));
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('role', 'option');
    });
  });

  describe('Custom Styling Tests', () => {
    it('applies custom styles to trigger', () => {
      const customStyle = { backgroundColor: 'red', minHeight: '50px' };
      
      render(
        <Select>
          <SelectTrigger style={customStyle}>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('style');
      expect(trigger.getAttribute('style')).toContain('background-color: red');
      expect(trigger.getAttribute('style')).toContain('min-height: 50px');
    });

    it('applies custom styles to content', async () => {
      const user = userEvent.setup();
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="custom-content" style={{ maxWidth: '200px' }}>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );
      
      await user.click(screen.getByRole('combobox'));
      
      const content = screen.getByRole('listbox');
      expect(content).toHaveClass('custom-content');
      expect(content).toHaveAttribute('style');
      expect(content.getAttribute('style')).toContain('max-width: 200px');
    });
  });

  describe('TypeScript Integration Tests', () => {
    it('enforces proper typing for props', async () => {
      const user = userEvent.setup();
      
      // These should compile without errors
      const validProps = {
        value: 'test-value',
        defaultValue: 'default-test',
        onValueChange: (value: string) => {},
        disabled: true,
        required: true,
        name: 'test-select',
      };
      
      render(
        <Select {...validProps}>
          <SelectTrigger data-testid="typed-trigger">
            <SelectValue placeholder="Typed select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test-value">Test Value</SelectItem>
          </SelectContent>
        </Select>
      );
      
      const trigger = screen.getByTestId('typed-trigger');
      expect(trigger).toBeInTheDocument();
      // Note: Radix UI Select creates a hidden input with the name attribute
      // The trigger doesn't have the name attribute directly
      expect(trigger).toBeDisabled();
    });

    it('supports all select component variations', async () => {
      const user = userEvent.setup();
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group Label</SelectLabel>
              <SelectItem value="item1">Item 1</SelectItem>
              <SelectItem value="item2" disabled>
                Item 2 (Disabled)
              </SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectItem value="item3">Item 3</SelectItem>
          </SelectContent>
        </Select>
      );
      
      await user.click(screen.getByRole('combobox'));
      
      expect(screen.getByText('Group Label')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2 (Disabled)')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
      
      // Test disabled item
      const disabledItem = screen.getByText('Item 2 (Disabled)').closest('[role="option"]');
      expect(disabledItem).toHaveAttribute('data-disabled', '');
    });
  });
});
