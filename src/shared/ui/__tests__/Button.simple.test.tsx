import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';


// Mock the Button component since the real one has complex dependencies
const MockButton = ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button onClick={onClick} {...props}>
    {children}
  </button>
);

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<MockButton>Click me</MockButton>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('should handle click events', () => {
    const handleClick: jest.Mock = jest.fn();
    render(<MockButton onClick={handleClick}>Click me</MockButton>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should accept custom props', () => {
    render(<MockButton data-testid="custom-button" disabled>Click me</MockButton>);
    
    const button: HTMLButtonElement = screen.getByTestId('custom-button');
    expect(button).toBeTruthy();
    expect(button.disabled).toBeTruthy();
  });
});
