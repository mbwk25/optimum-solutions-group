/**
 * @fileoverview Basic test suite for LazyImage component
 * @description Simple tests that work with the actual component behavior
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import '@testing-library/jest-dom';

import LazyImage from '../LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver: jest.Mock = jest.fn();
const mockObserve: jest.Mock = jest.fn();
const mockUnobserve: jest.Mock = jest.fn();
const mockDisconnect: jest.Mock = jest.fn();

beforeEach(() => {
  mockIntersectionObserver.mockReturnValue({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  });
  window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('LazyImage Component - Basic', () => {
  describe('Basic rendering', () => {
    it('should render with required props', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img).toBeTruthy();
      expect(img.getAttribute('alt')).toBe('Test image');
    });

    it('should render with custom className', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          className="custom-class" 
        />
      );
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.classList.contains('custom-class')).toBe(true);
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
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.getAttribute('width')).toBe('100');
      expect(img.getAttribute('height')).toBe('100');
    });

    it('should render with loading="eager"', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          loading="eager" 
        />
      );
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.getAttribute('loading')).toBe('eager');
    });

    it('should render with loading="lazy" by default', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.getAttribute('loading')).toBe('lazy');
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
      
      const skeleton: HTMLDivElement | null = document.querySelector('.animate-pulse');
      expect(skeleton).toBeTruthy();
    });

    it('should show blur effect with blurDataURL', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          blurDataURL="data:image/jpeg;base64,blur" 
        />
      );
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.classList.contains('blur-sm')).toBe(true);
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
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.getAttribute('fetchpriority')).toBe('high');
    });

    it('should not set fetchpriority when auto', () => {
      render(
        <LazyImage 
          src="test.jpg" 
          alt="Test image" 
          fetchPriority="auto" 
        />
      );
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.getAttribute('fetchpriority')).toBeNull();
    });

    it('should set decoding="async"', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.getAttribute('decoding')).toBe('async');
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.getAttribute('alt')).toBe('Test image');
    });

    it('should handle empty alt text', () => {
      render(<LazyImage src="test.jpg" alt="" />);
      
      const img: HTMLImageElement = screen.getByAltText('');
      expect(img.getAttribute('alt')).toBe('');
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
      
      const img: HTMLImageElement = screen.getByTestId('lazy-image');
      expect(img.getAttribute('id')).toBe('test-id');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined src', () => {
      render(<LazyImage src={undefined as unknown as string} alt="Test image" />);
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.getAttribute('src')).toBeTruthy();
    });

    it('should handle empty src', () => {
      render(<LazyImage src="" alt="Test image" />);
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.getAttribute('src')).toBeTruthy();
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
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img.getAttribute('width')).toBe('2000');
      expect(img.getAttribute('height')).toBe('2000');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup intersection observer on unmount', () => {
      const { unmount }: { unmount: () => void } = render(
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
      
      const container: HTMLDivElement | null = document.querySelector('.relative.overflow-hidden');
      expect(container).toBeTruthy();
      
      const img: HTMLImageElement = screen.getByAltText('Test image');
      expect(img).toBeTruthy();
    });

    it('should render with loading skeleton', () => {
      render(<LazyImage src="test.jpg" alt="Test image" />);
      
      const skeleton: HTMLDivElement | null = document.querySelector('.absolute.inset-0.bg-muted.animate-pulse.rounded');
      expect(skeleton).toBeTruthy();
    });
  });
});
