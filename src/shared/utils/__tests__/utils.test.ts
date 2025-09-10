/**
 * @fileoverview Comprehensive test suite for utility functions
 * @description Tests for core utility functions including class name merging and type safety
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import { describe, it, expect } from '@jest/globals';
import { cn } from '../utils';

/**
 * Test suite for the `cn` utility function
 * Tests class name merging functionality using clsx and tailwind-merge
 */
describe('cn utility function', () => {
  describe('Basic functionality', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4 py-2', 'bg-blue-500', 'text-white');
      expect(result).toBe('px-4 py-2 bg-blue-500 text-white');
    });

    it('should handle empty strings', () => {
      const result = cn('', 'px-4', '');
      expect(result).toBe('px-4');
    });

    it('should handle undefined and null values', () => {
      const result = cn('px-4', undefined, null, 'py-2');
      expect(result).toBe('px-4 py-2');
    });

    it('should handle single class name', () => {
      const result = cn('px-4');
      expect(result).toBe('px-4');
    });

    it('should return empty string when no arguments provided', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });

  describe('Conditional class names', () => {
    it('should handle conditional classes with boolean values', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn('base-class', {
        'active-class': isActive,
        'disabled-class': isDisabled,
      });
      expect(result).toBe('base-class active-class');
    });

    it('should handle complex conditional logic', () => {
      const variant = 'primary' as 'primary' | 'secondary';
      const size = 'large' as 'large' | 'small';
      const isDisabled = false;
      
      const result = cn('btn', {
        'btn-primary': variant === 'primary',
        'btn-secondary': variant === 'secondary',
        'btn-large': size === 'large',
        'btn-small': size === 'small',
        'btn-disabled': isDisabled,
      });
      
      expect(result).toBe('btn btn-primary btn-large');
    });

    it('should handle nested conditional objects', () => {
      const props = {
        variant: 'primary',
        size: 'medium',
        disabled: false,
      };
      
      const result = cn('base', {
        [`variant-${props.variant}`]: true,
        [`size-${props.size}`]: true,
        'disabled': props.disabled,
      });
      
      expect(result).toBe('base variant-primary size-medium');
    });
  });

  describe('Array handling', () => {
    it('should handle array of class names', () => {
      const classes = ['px-4', 'py-2', 'bg-blue-500'];
      const result = cn(classes);
      expect(result).toBe('px-4 py-2 bg-blue-500');
    });

    it('should handle mixed arrays and strings', () => {
      const result = cn(['px-4', 'py-2'], 'bg-blue-500', ['text-white', 'rounded']);
      expect(result).toBe('px-4 py-2 bg-blue-500 text-white rounded');
    });

    it('should handle arrays with conditional values', () => {
      const isActive = true;
      const classes = ['base', isActive && 'active', 'always-present'];
      const result = cn(classes);
      expect(result).toBe('base active always-present');
    });
  });

  describe('Tailwind CSS conflict resolution', () => {
    it('should resolve conflicting Tailwind classes correctly', () => {
      // tailwind-merge should keep the last conflicting class
      const result = cn('px-4 px-6', 'py-2 py-4');
      expect(result).toBe('px-6 py-4');
    });

    it('should handle complex Tailwind conflicts', () => {
      const result = cn(
        'bg-red-500 bg-blue-500',
        'text-sm text-lg text-base',
        'p-4 px-6 py-2'
      );
      expect(result).toBe('bg-blue-500 text-base p-4 px-6 py-2');
    });

    it('should preserve non-conflicting classes', () => {
      const result = cn('bg-blue-500', 'text-white', 'px-4', 'py-2');
      expect(result).toBe('bg-blue-500 text-white px-4 py-2');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle deeply nested objects', () => {
      const result = cn({
        'level1': {
          'level2': {
            'level3': true,
          },
        },
      });
      expect(result).toBe('level1');
    });

    it('should handle functions that return class names', () => {
      const getClass = () => 'dynamic-class';
      const result = cn('static-class', getClass());
      expect(result).toBe('static-class dynamic-class');
    });

    it('should handle very long class name strings', () => {
      const longClass = 'very-long-class-name-that-might-cause-issues '.repeat(10);
      const result = cn(longClass, 'normal-class');
      expect(result).toContain('normal-class');
    });
  });

  describe('Type safety', () => {
    it('should accept ClassValue types correctly', () => {
      // This test ensures TypeScript types are working correctly
      const stringClass: string = 'px-4';
      const booleanClass: boolean = true;
      const objectClass: Record<string, boolean> = { 'active': true };
      const arrayClass: (string | boolean)[] = ['px-4', true];
      
      const result = cn(
        stringClass,
        booleanClass && 'conditional',
        objectClass,
        arrayClass
      );
      
      expect(result).toBe('conditional active px-4');
    });
  });

  describe('Performance considerations', () => {
    it('should handle large number of class names efficiently', () => {
      const manyClasses = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const startTime = performance.now();
      const result = cn(...manyClasses);
      const endTime = performance.now();
      
      expect(result).toContain('class-0');
      expect(result).toContain('class-99');
      expect(endTime - startTime).toBeLessThan(10); // Should complete in less than 10ms
    });

    it('should handle repeated calls efficiently', () => {
      const classes = ['px-4', 'py-2', 'bg-blue-500'];
      const iterations = 1000;
      
      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        cn(...classes);
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('Integration with real-world scenarios', () => {
    it('should work with component prop patterns', () => {
      interface ComponentProps {
        className?: string;
        variant?: 'primary' | 'secondary';
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
      }
      
      const props: ComponentProps = {
        className: 'custom-class',
        variant: 'primary',
        size: 'md',
        disabled: false,
      };
      
      const result = cn(
        'base-component',
        {
          'variant-primary': props.variant === 'primary',
          'variant-secondary': props.variant === 'secondary',
          'size-sm': props.size === 'sm',
          'size-md': props.size === 'md',
          'size-lg': props.size === 'lg',
          'disabled': props.disabled,
        },
        props.className
      );
      
      expect(result).toBe('base-component variant-primary size-md custom-class');
    });

    it('should work with responsive design patterns', () => {
      const result = cn(
        'base',
        'sm:px-4 md:px-6 lg:px-8',
        'sm:py-2 md:py-3 lg:py-4',
        'sm:text-sm md:text-base lg:text-lg'
      );
      
      expect(result).toBe('base sm:px-4 md:px-6 lg:px-8 sm:py-2 md:py-3 lg:py-4 sm:text-sm md:text-base lg:text-lg');
    });

    it('should work with dark mode patterns', () => {
      const result = cn(
        'bg-white dark:bg-gray-900',
        'text-gray-900 dark:text-white',
        'border-gray-200 dark:border-gray-700'
      );
      
      expect(result).toBe('bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700');
    });
  });
});
