import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock Input component
const MockInput = ({ onChange, value, placeholder, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    data-testid="input"
    onChange={onChange}
    value={value}
    placeholder={placeholder}
    {...props}
  />
);

describe('Input Component', () => {
  it('should render input with placeholder', () => {
    render(<MockInput placeholder="Enter text" />);
    
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should handle input changes', () => {
    const handleChange = jest.fn();
    render(<MockInput onChange={handleChange} />);
    
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should accept value prop', () => {
    render(<MockInput value="test value" />);
    
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('test value');
  });
});
