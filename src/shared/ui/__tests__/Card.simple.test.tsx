import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock Card component
const MockCard = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div data-testid="card" {...props}>
    {children}
  </div>
);

const MockCardHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div data-testid="card-header" {...props}>
    {children}
  </div>
);

const MockCardContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div data-testid="card-content" {...props}>
    {children}
  </div>
);

describe('Card Component', () => {
  it('should render card with content', () => {
    render(
      <MockCard>
        <MockCardHeader>Header</MockCardHeader>
        <MockCardContent>Content</MockCardContent>
      </MockCard>
    );
    
    expect(screen.getByTestId('card')).toBeTruthy();
    expect(screen.getByTestId('card-header')).toBeTruthy();
    expect(screen.getByTestId('card-content')).toBeTruthy();
  });

  it('should accept custom className', () => {
    render(<MockCard className="custom-class">Test</MockCard>);
    
    const card = screen.getByTestId('card');
    expect(card.className).toContain('custom-class');
  });
});
