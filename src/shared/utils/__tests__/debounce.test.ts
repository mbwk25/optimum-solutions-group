/**
 * @fileoverview Comprehensive test suite for debounce and throttle utility functions
 * @description Tests for timing control functions with edge cases and performance considerations
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { debounce, throttle } from '../debounce';

describe('Debounce and Throttle utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('debounce function', () => {
    describe('Basic functionality', () => {
      it('should delay function execution by specified wait time', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn();
        expect(mockFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should reset timer on subsequent calls', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn();
        jest.advanceTimersByTime(50);
        debouncedFn();
        jest.advanceTimersByTime(50);
        expect(mockFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(50);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should pass arguments correctly to debounced function', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn('arg1', 'arg2', 123);
        jest.advanceTimersByTime(100);

        expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
      });

      it('should handle multiple calls with different arguments', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn('first');
        jest.advanceTimersByTime(50);
        debouncedFn('second');
        jest.advanceTimersByTime(50);
        debouncedFn('third');
        jest.advanceTimersByTime(100);

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('third');
      });
    });

    describe('Immediate execution', () => {
      it('should execute immediately when immediate is true', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100, true);

        debouncedFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should not execute again after immediate call', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100, true);

        debouncedFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        debouncedFn();
        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should execute again after timeout when immediate is true', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100, true);

        debouncedFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(100);
        debouncedFn();
        expect(mockFn).toHaveBeenCalledTimes(2);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero wait time', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 0);

        debouncedFn();
        jest.advanceTimersByTime(0);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should handle very large wait times', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 1000000);

        debouncedFn();
        jest.advanceTimersByTime(1000000);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should handle function that returns values', () => {
        const mockFn = jest.fn(() => 'return value');
        const debouncedFn = debounce(mockFn, 100);

        const result = debouncedFn();
        expect(result).toBeUndefined(); // Debounced function doesn't return value

        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should handle function that throws errors', () => {
        const mockFn = jest.fn(() => {
          throw new Error('Test error');
        });
        const debouncedFn = debounce(mockFn, 100);

        expect(() => {
          debouncedFn();
          jest.advanceTimersByTime(100);
        }).toThrow('Test error');
      });
    });

    describe('Type safety', () => {
      it('should preserve function parameter types', () => {
        const typedFn = (...args: unknown[]) => `${args[0]}-${args[1]}-${args[2]}`;
        const debouncedFn = debounce(typedFn, 100);

        // This should compile without TypeScript errors
        debouncedFn('test', 123, true);
        jest.advanceTimersByTime(100);
      });

      it('should work with async functions', async () => {
        const asyncFn = jest.fn(async (...args: unknown[]) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return `processed: ${args[0]}`;
        });
        const debouncedFn = debounce(asyncFn, 100);

        debouncedFn('test');
        jest.advanceTimersByTime(100);
        await jest.runAllTimersAsync();

        expect(asyncFn).toHaveBeenCalledWith('test');
      });
    });

    describe('Performance and memory', () => {
      it('should not leak memory with many rapid calls', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);

        // Simulate rapid calls
        for (let i = 0; i < 1000; i++) {
          debouncedFn();
        }

        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should handle rapid calls efficiently', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);

        const startTime = performance.now();
        for (let i = 0; i < 100; i++) {
          debouncedFn();
        }
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(10); // Should complete quickly
      });
    });
  });

  describe('throttle function', () => {
    describe('Basic functionality', () => {
      it('should limit function execution to once per time period', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        throttledFn();
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(100);
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(2);
      });

      it('should pass arguments correctly to throttled function', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn('arg1', 'arg2');
        expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      });

      it('should handle multiple calls with different arguments', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn('first');
        throttledFn('second');
        throttledFn('third');

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('first');
      });
    });

    describe('Timing behavior', () => {
      it('should execute immediately on first call', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should execute again after throttle period', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(100);
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(2);
      });

      it('should not execute during throttle period', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        // Multiple calls during throttle period
        for (let i = 0; i < 10; i++) {
          throttledFn();
        }
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero throttle time', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 0);

        throttledFn();
        // With zero throttle time, subsequent calls should be throttled
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should handle very large throttle times', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 1000000);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should handle function that throws errors', () => {
        const mockFn = jest.fn(() => {
          throw new Error('Test error');
        });
        const throttledFn = throttle(mockFn, 100);

        expect(() => throttledFn()).toThrow('Test error');
      });
    });

    describe('Type safety', () => {
      it('should preserve function parameter types', () => {
        const typedFn = (...args: unknown[]) => `${args[0]}-${args[1]}`;
        const throttledFn = throttle(typedFn, 100);

        // This should compile without TypeScript errors
        throttledFn('test', 123);
      });

      it('should work with async functions', async () => {
        const asyncFn = jest.fn(async (...args: unknown[]) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return `processed: ${args[0]}`;
        });
        const throttledFn = throttle(asyncFn, 100);

        await throttledFn('test');
        expect(asyncFn).toHaveBeenCalledWith('test');
      });
    });

    describe('Performance considerations', () => {
      it('should handle rapid calls efficiently', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        const startTime = performance.now();
        for (let i = 0; i < 1000; i++) {
          throttledFn();
        }
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(10);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should not create memory leaks with many calls', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        // Simulate many rapid calls
        for (let i = 0; i < 10000; i++) {
          throttledFn();
        }

        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Real-world usage patterns', () => {
    it('should work with event handlers', () => {
      const mockHandler = jest.fn();
      const debouncedHandler = debounce(mockHandler, 100);
      const throttledHandler = throttle(mockHandler, 100);

      // Simulate scroll events
      for (let i = 0; i < 10; i++) {
        debouncedHandler({ type: 'scroll', target: window });
        throttledHandler({ type: 'scroll', target: window });
      }

      expect(mockHandler).toHaveBeenCalledTimes(1); // Only throttled call

      jest.advanceTimersByTime(100);
      expect(mockHandler).toHaveBeenCalledTimes(2); // Now debounced call
    });

    it('should work with API calls', () => {
      const mockApiCall = jest.fn();
      const debouncedApiCall = debounce(mockApiCall, 300);

      // Simulate user typing in search box
      const searchTerms = ['a', 'ab', 'abc', 'abcd'];
      searchTerms.forEach(term => debouncedApiCall(term));

      expect(mockApiCall).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(mockApiCall).toHaveBeenCalledTimes(1);
      expect(mockApiCall).toHaveBeenCalledWith('abcd');
    });

    it('should work with resize handlers', () => {
      const mockResizeHandler = jest.fn();
      const throttledResizeHandler = throttle(mockResizeHandler, 16); // ~60fps

      // Simulate rapid resize events
      for (let i = 0; i < 100; i++) {
        throttledResizeHandler({ type: 'resize', target: window });
      }

      expect(mockResizeHandler).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(16);
      throttledResizeHandler({ type: 'resize', target: window });
      expect(mockResizeHandler).toHaveBeenCalledTimes(2);
    });
  });
});
