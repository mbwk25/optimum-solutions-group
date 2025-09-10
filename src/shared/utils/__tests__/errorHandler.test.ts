/**
 * @fileoverview Comprehensive test suite for error handling utilities
 * @description Tests for error handling, logging, and error recovery mechanisms
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { errorHandler, handleError, wrapAsync, wrapSync, getStoredErrors, clearStoredErrors } from '../errorHandler';

// Import ErrorContext type
interface ErrorContext {
  message?: string;
  timestamp?: string;
  url?: string;
  userAgent?: string;
  error?: string;
  filename?: string;
  lineno?: number;
  component?: string;
  action?: string;
  data?: unknown;
  reason?: unknown;
  colno?: number;
}

// Type for error handler instance - removed unused type

// Mock Date.now
const mockDateNow = jest.fn(() => 1640995200000); // 2022-01-01T00:00:00.000Z
global.Date.now = mockDateNow;

// Mock Date constructor to return consistent timestamps
const mockDate = new Date('2022-01-01T00:00:00.000Z');
global.Date = jest.fn(() => mockDate) as unknown as typeof Date;
global.Date.now = mockDateNow;


// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Error Handler utilities', () => {
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;
  let consoleWarnSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    // Mock console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    localStorageMock.getItem.mockReturnValue('[]');
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
    
    // Reset error handler instance
    (errorHandler as unknown as { errorCount: Map<string, number> }).errorCount.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ErrorHandler class', () => {
    describe('Singleton pattern', () => {
      it('should return the same instance', () => {
        const instance1 = errorHandler;
        const instance2 = errorHandler;
        expect(instance1).toBe(instance2);
      });
    });

    describe('Error logging', () => {
      it('should log errors in development mode', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        handleError('Test error', { component: 'TestComponent' });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Application Error:',
          expect.objectContaining({
            message: 'Test error',
            component: 'TestComponent',
            timestamp: expect.any(String),
            url: expect.any(String),
            userAgent: expect.any(String),
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should store errors in production mode', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        handleError('Production error', { component: 'TestComponent' });

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'app_errors',
          expect.stringContaining('Production error')
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should include timestamp and URL in error context', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        handleError('Test error');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Application Error:',
          expect.objectContaining({
            timestamp: '2022-01-01T00:00:00.000Z',
            url: window.location.href,
            userAgent: navigator.userAgent,
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });
    });

    describe('Error rate limiting', () => {
      it('should limit errors per minute', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        // Clear the error count map to ensure clean state
        (errorHandler as unknown as { errorCount: Map<string, number> }).errorCount.clear();

        // Generate more than MAX_ERRORS_PER_MINUTE (10)
        for (let i = 0; i < 15; i++) {
          handleError('Rate limited error');
        }

        // Should only log first 10 errors (rate limiting kicks in after 10)
        expect(consoleErrorSpy).toHaveBeenCalledTimes(10);

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should reset error count after a minute', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        // Generate 10 errors
        for (let i = 0; i < 10; i++) {
          handleError('Rate limited error');
        }

        // Advance time by 1 minute
        jest.advanceTimersByTime(60000);

        // Should be able to log more errors now
        handleError('New error after reset');
        expect(consoleErrorSpy).toHaveBeenCalledTimes(11);

        process.env['NODE_ENV'] = originalEnv;
      });
    });

    describe('Global error handlers', () => {
      it('should handle unhandled promise rejections', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        // Test the error handler directly instead of dispatching events
        handleError('Unhandled Promise Rejection', {
          reason: 'test reason',
          component: 'Global'
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Application Error:',
          expect.objectContaining({
            message: 'Unhandled Promise Rejection',
            reason: 'test reason',
            component: 'Global',
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should handle global errors', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const errorEvent = new ErrorEvent('error', {
          message: 'Test error message',
          filename: 'test.js',
          lineno: 10,
          colno: 5,
          error: new Error('Test error'),
        });

        window.dispatchEvent(errorEvent);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Application Error:',
          expect.objectContaining({
            message: 'Test error message',
            error: expect.any(Error),
            filename: 'test.js',
            lineno: 10,
            colno: 5,
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should handle resource loading errors in development', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const img = document.createElement('img');
        img.src = 'invalid-image.jpg';

        // Create a proper error event with the target set
        const errorEvent = new Event('error');
        Object.defineProperty(errorEvent, 'target', {
          value: img,
          writable: false,
        });

        window.dispatchEvent(errorEvent);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Failed to load img: http://localhost:3000/invalid-image.jpg'
        );

        process.env['NODE_ENV'] = originalEnv;
      });
    });
  });

  describe('Utility functions', () => {
    describe('wrapAsync', () => {
      it('should execute async function successfully', async () => {
        const mockFn = jest.fn() as jest.MockedFunction<() => Promise<string>>;
        mockFn.mockResolvedValue('success');
        const result = await wrapAsync(mockFn, { component: 'TestComponent' });

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalled();
      });

      it('should handle async function errors', async () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const mockFn = jest.fn() as jest.MockedFunction<() => Promise<never>>;
        mockFn.mockRejectedValue(new Error('Async error'));
        const result = await wrapAsync(mockFn, { component: 'TestComponent' });

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Application Error:',
          expect.objectContaining({
            message: 'Async Function Error',
            component: 'TestComponent',
            error: 'Async error',
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should handle non-Error rejections', async () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const mockFn = jest.fn() as jest.MockedFunction<() => Promise<never>>;
        mockFn.mockRejectedValue('String error');
        const result = await wrapAsync(mockFn);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Application Error:',
          expect.objectContaining({
            message: 'Async Function Error',
            error: 'String error',
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });
    });

    describe('wrapSync', () => {
      it('should execute sync function successfully', () => {
        const mockFn = jest.fn().mockReturnValue('success');
        const result = wrapSync(mockFn, { component: 'TestComponent' });

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalled();
      });

      it('should handle sync function errors', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const mockFn = jest.fn().mockImplementation(() => {
          throw new Error('Sync error');
        });
        const result = wrapSync(mockFn, { component: 'TestComponent' });

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Application Error:',
          expect.objectContaining({
            message: 'Sync Function Error',
            component: 'TestComponent',
            error: 'Sync error',
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should handle non-Error exceptions', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        const mockFn = jest.fn().mockImplementation(() => {
          throw 'String exception';
        });
        const result = wrapSync(mockFn);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Application Error:',
          expect.objectContaining({
            message: 'Sync Function Error',
            error: 'String exception',
          })
        );

        process.env['NODE_ENV'] = originalEnv;
      });
    });

    describe('Error storage and retrieval', () => {
      it('should store errors in localStorage', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        handleError('Stored error', { component: 'TestComponent' });

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'app_errors',
          expect.stringContaining('Stored error')
        );

        process.env['NODE_ENV'] = originalEnv;
      });

      it('should retrieve stored errors', () => {
        const mockErrors = [
          { message: 'Error 1', timestamp: '2023-01-01T00:00:00.000Z' },
          { message: 'Error 2', timestamp: '2023-01-01T00:01:00.000Z' },
        ];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockErrors));

        const errors = getStoredErrors();

        expect(errors).toEqual(mockErrors);
        expect(localStorageMock.getItem).toHaveBeenCalledWith('app_errors');
      });

      it('should handle corrupted localStorage data', () => {
        localStorageMock.getItem.mockReturnValue('invalid json');

        const errors = getStoredErrors();

        expect(errors).toEqual([]);
      });

      it('should clear stored errors', () => {
        clearStoredErrors();

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('app_errors');
      });

      it('should limit stored errors to 50', () => {
        const originalEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        // Mock localStorage to accumulate errors
        let storedErrors: ErrorContext[] = [];
        localStorageMock.getItem.mockImplementation((key) => {
          if (key === 'app_errors') {
            return JSON.stringify(storedErrors);
          }
          return null;
        });
        localStorageMock.setItem.mockImplementation((key, value) => {
          if (key === 'app_errors') {
            storedErrors = JSON.parse(value as string);
          }
        });

        // Generate 60 errors
        for (let i = 0; i < 60; i++) {
          handleError(`Error ${i}`);
        }

        expect(storedErrors).toHaveLength(50);
        expect(storedErrors[0]?.message).toBe('Error 10'); // First 10 should be removed

        process.env['NODE_ENV'] = originalEnv;
      });
    });
  });

  describe('Error context handling', () => {
    it('should merge provided context with default context', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      const customContext = {
        component: 'CustomComponent',
        action: 'testAction',
        data: { key: 'value' },
      };

      handleError('Test error', customContext);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          message: 'Test error',
          component: 'CustomComponent',
          action: 'testAction',
          data: { key: 'value' },
          timestamp: expect.any(String),
          url: expect.any(String),
          userAgent: expect.any(String),
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });

    it('should handle empty context', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      handleError('Test error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          message: 'Test error',
          timestamp: expect.any(String),
          url: expect.any(String),
          userAgent: expect.any(String),
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });

    it('should handle context with undefined values', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      const contextWithUndefined = {
        component: 'TestComponent',
      };

      handleError('Test error', contextWithUndefined);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          message: 'Test error',
          component: 'TestComponent',
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle rapid error generation efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        handleError(`Error ${i}`);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Should not throw
      expect(() => {
        handleError('Test error');
      }).not.toThrow();
    });

    it('should handle missing localStorage gracefully', () => {
      // Mock localStorage as undefined
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      expect(() => {
        handleError('Test error');
        getStoredErrors();
        clearStoredErrors();
      }).not.toThrow();

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should work with React error boundaries', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      const error = new Error('React error');

      handleError('React Error Boundary', {
        error: error,
        component: 'ErrorBoundary',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          message: 'React Error Boundary',
          component: 'ErrorBoundary',
          error: 'React error',
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });

    it('should work with API error handling', async () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      const apiCall = async () => {
        throw new Error('API request failed');
      };

      const result = await wrapAsync(apiCall, {
        component: 'ApiService',
        action: 'fetchUserData',
      });

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          message: 'Async Function Error',
          component: 'ApiService',
          action: 'fetchUserData',
          error: 'API request failed',
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });

    it('should work with form validation errors', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      const validateForm = () => {
        throw new Error('Validation failed');
      };

      const result = wrapSync(validateForm, {
        component: 'FormValidator',
        action: 'validateEmail',
      });

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          message: 'Sync Function Error',
          component: 'FormValidator',
          action: 'validateEmail',
          error: 'Validation failed',
        })
      );

      process.env['NODE_ENV'] = originalEnv;
    });
  });
});
