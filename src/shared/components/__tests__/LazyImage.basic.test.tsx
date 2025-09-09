/**
 * @fileoverview Basic test suite for LazyImage component
 * @description Simple tests that work with the actual component behavior
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import '@testing-library/jest-dom';
import LazyImage from '../LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

beforeEach(() => {
  mockIntersectionObserver.mockReturnValue({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('LazyImage Component - Basic', () => {
  describe('Basic rendering', () => {
    it('should render with required props', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const img = screen.getByAltText('Test image');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('should render with custom className', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          className="custom-class" 
        />
      );
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveClass('custom-class');
    });

    it('should render with width and height', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          width={100} 
          height={100} 
        />
      );
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('width', '100');
      expect(img).toHaveAttribute('height', '100');
    });

    it('should render with loading="eager"', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          loading="eager" 
        />
      );
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('should render with loading="lazy" by default', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Lazy loading setup', () => {
    it('should set up intersection observer for lazy loading', () => {
      render(<LazyImage src="test.jpg" alt="Test image" loading="lazy" />);
      
      expect(mockIntersectionObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();
    });

    it('should not set up intersection observer for eager loading', () => {
      render(<LazyImage src="test.jpg" alt="Test image" loading="eager" />);
      
      expect(mockObserve).not.toHaveBeenCalled();
    });
  });

  describe('Loading states', () => {
    it('should show loading skeleton while loading', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should show blur effect with blurDataURL', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          blurDataURL="data:image/jpeg;base64,blur" 
        />
      );
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveClass('blur-sm');
    });
  });

  describe('Performance optimizations', () => {
    it('should set fetchpriority attribute when specified', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          fetchPriority="high" 
        />
      );
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('fetchpriority', 'high');
    });

    it('should not set fetchpriority when auto', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          fetchPriority="auto" 
        />
      );
      
      const img = screen.getByAltText('Test image');
      expect(img).not.toHaveAttribute('fetchpriority');
    });

    it('should set decoding="async"', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('decoding', 'async');
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('should handle empty alt text', () => {
      render(<LazyImage src="test.jpg" alt="" />);
      
      const img = screen.getByAltText('');
      expect(img).toHaveAttribute('alt', '');
    });

    it('should pass through other HTML attributes', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          data-testid="lazy-image"
          id="test-id"
        />
      );
      
      const img = screen.getByTestId('lazy-image');
      expect(img).toHaveAttribute('id', 'test-id');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined src', () => {
      render(<LazyImage src={undefined as string} alt="Test image" />);
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('src');
    });

    it('should handle empty src', () => {
      render(<LazyImage src="" alt="Test image" />);
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('src');
    });

    it('should handle very large images', () => {
      render(
        <LazyImage 
          src="large.jpg" 
          alt="Test image" 
          width={2000} 
          height={2000} 
        />
      );
      
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('width', '2000');
      expect(img).toHaveAttribute('height', '2000');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup intersection observer on unmount', () => {
      const { unmount } = render(
        <LazyImage src="test.jpg" alt="Test image" loading="lazy" />
      );
      
      unmount();
      
      expect(mockUnobserve).toHaveBeenCalled();
    });
  });

  describe('Display name', () => {
    it('should have correct display name for debugging', () => {
      expect(LazyImage.displayName).toBe('LazyImage');
    });
  });

  describe('Component structure', () => {
    it('should render with proper container structure', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const container = document.querySelector('.relative.overflow-hidden');
      expect(container).toBeInTheDocument();
      
      const img = screen.getByAltText('Test image');
      expect(img).toBeInTheDocument();
    });

    it('should render with loading skeleton', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const skeleton = document.querySelector('.absolute.inset-0.bg-muted.animate-pulse.rounded');
      expect(skeleton).toBeInTheDocument();
    });
  });
});
