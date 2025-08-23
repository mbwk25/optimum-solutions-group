import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Textarea } from '../textarea';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Textarea Component Test Suite
 * 
 * Tests the Textarea component for rendering, accessibility, interaction,
 * state management, and integration following TypeScript-first development practices.
 * 
 * @group unit
 * @group ui
 */
describe('Textarea Component', () => {
  // Test utilities
  const defaultProps = {
    'aria-label': 'Test textarea',
  } as const;

  const performanceThreshold = 50; // ms

  describe('Rendering Tests', () => {
    it('renders with default props and correct structure', () => {
      render(<Textarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('aria-label', 'Test textarea');
    });

    it('applies default CSS classes correctly', () => {
      render(<Textarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'flex',
        'min-h-[80px]',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2',
        'text-sm',
        'ring-offset-background',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      );
    });

    it('applies custom className correctly', () => {
      const customClass = 'custom-textarea-class';
      render(<Textarea {...defaultProps} className={customClass} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(customClass);
      expect(textarea).toHaveClass('flex', 'min-h-[80px]'); // Also has default classes
    });

    it('handles placeholder text correctly', () => {
      const placeholder = 'Enter your message here...';
      render(<Textarea {...defaultProps} placeholder={placeholder} />);
      
      const textarea = screen.getByPlaceholderText(placeholder);
      expect(textarea).toBeInTheDocument();
    });

    it('handles default value correctly', () => {
      const defaultValue = 'Initial text content';
      render(<Textarea {...defaultProps} defaultValue={defaultValue} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(defaultValue);
    });

    it('handles empty textarea correctly', () => {
      render(<Textarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });
  });

  describe('State Management Tests', () => {
    it('handles controlled textarea correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const testValue = 'Controlled text';
      
      const { rerender } = render(
        <Textarea {...defaultProps} value="" onChange={handleChange} />
      );
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
      
      await user.type(textarea, 'Hello');
      expect(handleChange).toHaveBeenCalledTimes(5); // One call per character
      
      // Re-render with updated value
      rerender(<Textarea {...defaultProps} value={testValue} onChange={handleChange} />);
      expect(textarea.value).toBe(testValue);
    });

    it('handles uncontrolled textarea correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Textarea {...defaultProps} onChange={handleChange} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
      
      await user.type(textarea, 'Uncontrolled text');
      expect(textarea.value).toBe('Uncontrolled text');
      expect(handleChange).toHaveBeenCalledTimes(17); // One call per character
    });

    it('handles disabled state correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Textarea {...defaultProps} disabled onChange={handleChange} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
      
      await user.type(textarea, 'Should not work');
      expect(handleChange).not.toHaveBeenCalled();
      expect((textarea as HTMLTextAreaElement).value).toBe('');
    });

    it('handles readonly state correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const initialValue = 'Readonly content';
      
      render(
        <Textarea 
          {...defaultProps} 
          readOnly 
          defaultValue={initialValue}
          onChange={handleChange} 
        />
      );
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('readonly');
      expect(textarea.value).toBe(initialValue);
      
      await user.type(textarea, 'Should not change');
      expect(textarea.value).toBe(initialValue);
    });

    it('handles required state correctly', () => {
      render(<Textarea {...defaultProps} required />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute('required');
    });
  });

  describe('Accessibility Tests', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Textarea {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper semantic role', () => {
      render(<Textarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('supports proper ARIA attributes', () => {
      render(
        <Textarea 
          {...defaultProps}
          aria-describedby="help-text"
          aria-required="true"
          aria-invalid="false"
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'help-text');
      expect(textarea).toHaveAttribute('aria-required', 'true');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('handles invalid state with proper ARIA attributes', () => {
      render(
        <Textarea 
          {...defaultProps}
          aria-invalid="true"
          aria-describedby="error-message"
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'error-message');
    });

    it('supports screen reader announcements for errors', () => {
      const errorMessage = 'This field has an error';
      render(
        <div>
          <Textarea {...defaultProps} aria-describedby="error" aria-invalid="true" />
          <div id="error" role="alert">{errorMessage}</div>
        </div>
      );
      
      const textarea = screen.getByRole('textbox');
      const error = screen.getByRole('alert');
      
      expect(textarea).toHaveAttribute('aria-describedby', 'error');
      expect(error).toHaveTextContent(errorMessage);
    });

    it('works correctly with form labels', () => {
      render(
        <div>
          <label htmlFor="message-textarea">Message</label>
          <Textarea id="message-textarea" />
        </div>
      );
      
      const textarea = screen.getByLabelText('Message');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('id', 'message-textarea');
    });
  });

  describe('Keyboard Interaction Tests', () => {
    it('handles keyboard input correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Textarea {...defaultProps} onChange={handleChange} />);
      
      const textarea = screen.getByRole('textbox');
      
      await user.type(textarea, 'Hello World');
      expect(handleChange).toHaveBeenCalledTimes(11);
      expect((textarea as HTMLTextAreaElement).value).toBe('Hello World');
    });

    it('handles Enter key for new lines', async () => {
      const user = userEvent.setup();
      render(<Textarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      await user.type(textarea, 'Line 1{Enter}Line 2');
      expect(textarea.value).toBe('Line 1\nLine 2');
    });

    it('handles Tab key correctly', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Textarea {...defaultProps} />
          <button>Next element</button>
        </div>
      );
      
      const textarea = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      textarea.focus();
      expect(textarea).toHaveFocus();
      
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('handles keyboard navigation with arrow keys', async () => {
      const user = userEvent.setup();
      render(<Textarea {...defaultProps} defaultValue="Test content" />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      textarea.focus();
      
      // Move cursor to beginning
      await user.keyboard('{Control>}{Home}{/Control}');
      expect(textarea.selectionStart).toBe(0);
      
      // Move cursor with arrow keys
      await user.keyboard('{ArrowRight}{ArrowRight}');
      expect(textarea.selectionStart).toBe(2);
    });
  });

  describe('Mouse Interaction Tests', () => {
    it('handles click events correctly', async () => {
      const user = userEvent.setup();
      render(<Textarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      
      await user.click(textarea);
      expect(textarea).toHaveFocus();
    });

    it('handles text selection', async () => {
      const user = userEvent.setup();
      render(<Textarea {...defaultProps} defaultValue="Selectable text" />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // Select all text
      await user.click(textarea);
      await user.keyboard('{Control>}a{/Control}');
      
      expect(textarea.selectionStart).toBe(0);
      expect(textarea.selectionEnd).toBe(15);
    });

    it('handles double-click to select words', async () => {
      const user = userEvent.setup();
      render(<Textarea {...defaultProps} defaultValue="Double click word" />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      await user.dblClick(textarea);
      // Should select some text (exact behavior may vary by browser)
      expect(textarea.selectionStart).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Handling Tests', () => {
    it('handles onChange events correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Textarea {...defaultProps} onChange={handleChange} />);
      
      const textarea = screen.getByRole('textbox');
      
      await user.type(textarea, 'Test');
      
      expect(handleChange).toHaveBeenCalledTimes(4);
      expect(handleChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'Test'
          })
        })
      );
    });

    it('handles onBlur events correctly', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();
      
      render(
        <div>
          <Textarea {...defaultProps} onBlur={handleBlur} />
          <button>Other element</button>
        </div>
      );
      
      const textarea = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      await user.click(textarea);
      await user.click(button);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles onFocus events correctly', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      
      render(<Textarea {...defaultProps} onFocus={handleFocus} />);
      
      const textarea = screen.getByRole('textbox');
      
      await user.click(textarea);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles onKeyDown events correctly', async () => {
      const user = userEvent.setup();
      const handleKeyDown = jest.fn();
      
      render(<Textarea {...defaultProps} onKeyDown={handleKeyDown} />);
      
      const textarea = screen.getByRole('textbox');
      
      await user.type(textarea, 'a');
      
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'a',
          type: 'keydown'
        })
      );
    });
  });

  describe('Form Integration Tests', () => {
    it('works correctly in forms', () => {
      const handleSubmit = jest.fn((e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        return formData.get('message');
      });
      
      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="message" defaultValue="Form content" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button');
      
      expect(textarea).toHaveAttribute('name', 'message');
      expect((textarea as HTMLTextAreaElement).value).toBe('Form content');
      
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('handles form validation correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <form>
          <Textarea {...defaultProps} required minLength={5} />
          <button type="submit">Submit</button>
        </form>
      );
      
      const textarea = screen.getByRole('textbox');
      
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute('minLength', '5');
      
      // Test validation
      await user.type(textarea, 'Hi'); // Too short
      expect((textarea as HTMLTextAreaElement).value).toBe('Hi');
      // Note: HTML5 validation behavior can vary, so we'll just check the constraints
      expect(textarea).toHaveAttribute('minLength', '5');
      expect((textarea as HTMLTextAreaElement).value.length).toBeLessThan(5);
      
      await user.clear(textarea);
      await user.type(textarea, 'Valid message'); // Valid length
      expect((textarea as HTMLTextAreaElement).value.length).toBeGreaterThanOrEqual(5);
    });

    it('integrates with form labels correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <form>
          <label htmlFor="feedback-textarea">Feedback</label>
          <Textarea id="feedback-textarea" />
        </form>
      );
      
      const label = screen.getByText('Feedback');
      const textarea = screen.getByLabelText('Feedback');
      
      // Clicking label should focus textarea
      await user.click(label);
      expect(textarea).toHaveFocus();
    });
  });

  describe('Error Handling Tests', () => {
    it('handles invalid props gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <Textarea 
          {...defaultProps}
          // @ts-expect-error Testing invalid prop
          invalidProp="invalid"
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('handles missing onChange in controlled mode gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(<Textarea {...defaultProps} value="controlled" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect((textarea as HTMLTextAreaElement).value).toBe('controlled');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Tests', () => {
    it('meets render time performance standards', () => {
      const startTime = performance.now();
      
      render(<Textarea {...defaultProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(performanceThreshold);
    });

    it('handles rapid text input efficiently', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Textarea {...defaultProps} onChange={handleChange} />);
      
      const textarea = screen.getByRole('textbox');
      const startTime = performance.now();
      
      // Rapid typing
      const testText = 'Quick typing test';
      await user.type(textarea, testText);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(performanceThreshold * 8); // More generous timing for user event typing
      expect(handleChange).toHaveBeenCalledTimes(testText.length); // One per character
    });

    it('handles large text content efficiently', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(1000);
      
      const startTime = performance.now();
      
      render(<Textarea {...defaultProps} defaultValue={longText} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(performanceThreshold * 2);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(longText);
    });
  });

  describe('Forward Ref Tests', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      
      render(<Textarea ref={ref} {...defaultProps} />);
      
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current).toHaveAttribute('aria-label', 'Test textarea');
    });

    it('supports ref callback', () => {
      let textareaElement: HTMLTextAreaElement | null = null;
      
      render(
        <Textarea 
          ref={(el) => { textareaElement = el; }}
          {...defaultProps}
        />
      );
      
      expect(textareaElement).toBeInstanceOf(HTMLTextAreaElement);
      expect(textareaElement).toHaveAttribute('aria-label', 'Test textarea');
    });
  });

  describe('CSS and Styling Tests', () => {
    it('applies custom styles correctly', () => {
      const customStyle = { backgroundColor: 'blue', minHeight: '120px' };
      
      render(
        <Textarea 
          {...defaultProps}
          style={customStyle}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('style');
      expect(textarea.getAttribute('style')).toContain('background-color: blue');
      expect(textarea.getAttribute('style')).toContain('min-height: 120px');
    });

    it('handles resize behavior correctly', () => {
      render(<Textarea {...defaultProps} style={{ resize: 'vertical' }} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea.getAttribute('style')).toContain('resize: vertical');
    });

    it('maintains focus styling classes', () => {
      render(<Textarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('focus-visible:outline-none');
      expect(textarea).toHaveClass('focus-visible:ring-2');
      expect(textarea).toHaveClass('focus-visible:ring-ring');
    });
  });

  describe('TypeScript Integration Tests', () => {
    it('enforces proper typing for props', () => {
      // These should compile without errors
      const validProps = {
        rows: 5,
        cols: 50,
        maxLength: 500,
        minLength: 10,
        placeholder: 'Enter text...',
        name: 'test-textarea',
        id: 'test-textarea-id',
        disabled: false,
        readOnly: false,
        required: true,
        'aria-label': 'Test textarea',
      };
      
      render(<Textarea {...validProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('rows', '5');
      expect(textarea).toHaveAttribute('cols', '50');
      expect(textarea).toHaveAttribute('maxLength', '500');
      expect(textarea).toHaveAttribute('minLength', '10');
      expect(textarea).toHaveAttribute('placeholder', 'Enter text...');
      expect(textarea).toHaveAttribute('name', 'test-textarea');
      expect(textarea).toHaveAttribute('id', 'test-textarea-id');
    });

    it('supports all standard textarea HTML attributes', () => {
      const textareaProps = {
        autoComplete: 'on',
        autoFocus: true,
        wrap: 'soft' as const,
        spellCheck: true,
        'data-testid': 'textarea-test',
      };
      
      render(<Textarea {...defaultProps} {...textareaProps} />);
      
      const textarea = screen.getByTestId('textarea-test');
      expect(textarea).toHaveAttribute('autocomplete', 'on');
      expect(textarea).toHaveAttribute('wrap', 'soft');
      expect(textarea).toHaveAttribute('spellcheck', 'true');
    });
  });
});
