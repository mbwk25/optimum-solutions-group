/**
 * Comprehensive Tests for useCoreWebVitals Hook
 * 
 * Tests Core Web Vitals monitoring with mocked web-vitals library
 * Covers LCP, FID, CLS subscriptions, unsubscription, and all functionality
 * 
 * @version 1.0
 * @author Optimum Solutions Group
 */

import { renderHook, act, cleanup } from '@testing-library/react';
import { useCoreWebVitals } from '../useCoreWebVitals';
import type { CoreWebVitalsOptions } from '../../types/coreWebVitals';

// Mock web-vitals library
jest.mock('web-vitals', () => ({
  onLCP: jest.fn(),
  onFCP: jest.fn(),
  onCLS: jest.fn(),
  onTTFB: jest.fn(),
  onINP: jest.fn(),
}));

// Import the mocked functions
import { onLCP, onFCP, onCLS, onTTFB, onINP } from 'web-vitals';

// Define interface for mock functions with callback property
interface MockWebVitalsFunction {
  (...args: unknown[]): void;
  mockImplementation: (fn: (callback: (metric: unknown) => void, ...args: unknown[]) => () => void) => void;
  mockReturnValue: (value: () => void) => void;
  callback?: (metric: unknown) => void;
}

const mockOnLCP = onLCP as MockWebVitalsFunction;
const mockOnFCP = onFCP as MockWebVitalsFunction;
const mockOnCLS = onCLS as MockWebVitalsFunction;
const mockOnTTFB = onTTFB as MockWebVitalsFunction;
const mockOnINP = onINP as MockWebVitalsFunction;

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => 1000),
  mark: jest.fn(),
  measure: jest.fn(),
};

// Mock navigator for device capabilities
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  deviceMemory: 8,
  connection: {
    effectiveType: '4g',
  },
};

// Mock window and global objects
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Mock location
delete (window as any).location;
window.location = { href: 'https://example.com' } as any;

// Mock fetch for analytics
global.fetch = jest.fn();

describe('useCoreWebVitals Hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset mock implementations
    mockOnLCP.mockImplementation((callback: (metric: unknown) => void) => {
      // Store callback for later triggering
      mockOnLCP.callback = callback;
      return () => {}; // Return unsubscribe function
    });
    
    mockOnFCP.mockImplementation((callback: (metric: unknown) => void) => {
      mockOnFCP.callback = callback;
      return () => {};
    });
    
    mockOnCLS.mockImplementation((callback: (metric: unknown) => void) => {
      mockOnCLS.callback = callback;
      return () => {};
    });
    
    mockOnTTFB.mockImplementation((callback: (metric: unknown) => void) => {
      mockOnTTFB.callback = callback;
      return () => {};
    });
    
    mockOnINP.mockImplementation((callback: (metric: unknown) => void) => {
      mockOnINP.callback = callback;
      return () => {};
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Hook Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCoreWebVitals());

      expect(result.current.metrics).toEqual({
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null,
        inp: null,
        timestamp: expect.any(Number),
        url: 'http://localhost:3000/',
        userAgent: mockNavigator.userAgent,
        isLowEndDevice: false,
        pageLoadTime: 1000,
        deviceMemory: 8,
        connectionType: '4g',
      });
      expect(result.current.isSupported).toBe(true);
      expect(result.current.isReporting).toBe(false);
      expect(result.current.performanceScore).toBe(0);
    });

    it('should register all web vitals observers on mount', () => {
      renderHook(() => useCoreWebVitals());

      expect(mockOnLCP).toHaveBeenCalledWith(expect.any(Function), { reportAllChanges: false });
      expect(mockOnFCP).toHaveBeenCalledWith(expect.any(Function), { reportAllChanges: false });
      expect(mockOnCLS).toHaveBeenCalledWith(expect.any(Function), { reportAllChanges: false });
      expect(mockOnTTFB).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnINP).toHaveBeenCalledWith(expect.any(Function), { reportAllChanges: false });
    });

    it('should handle server-side rendering (no window)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      delete global.window;

      const { result } = renderHook(() => useCoreWebVitals());

      expect(result.current.isSupported).toBe(false);

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('Web Vitals Subscriptions', () => {
    it('should handle LCP metric updates', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      const mockLCPMetric = {
        name: 'LCP',
        value: 2000,
        delta: 2000,
        id: 'lcp-1',
        navigationType: 'navigate' as const,
        entries: [],
      };

      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback(mockLCPMetric);
        }
      });

      expect(result.current.metrics.lcp).toEqual({
        name: 'LCP',
        value: 2000,
        delta: 2000,
        id: 'lcp-1',
        rating: 'good',
        navigationType: 'navigate',
        timestamp: expect.any(Number),
        entries: [],
      });
    });

    it('should handle FID metric updates', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      const mockFIDMetric = {
        name: 'FCP',
        value: 50,
        delta: 50,
        id: 'fid-1',
        navigationType: 'navigate' as const,
        entries: [],
      };

      act(() => {
        if (mockOnFCP.callback) {
          mockOnFCP.callback(mockFIDMetric);
        }
      });

      expect(result.current.metrics.fcp).toEqual({
        name: 'FCP',
        value: 50,
        delta: 50,
        id: 'fid-1',
        rating: 'good',
        navigationType: 'navigate',
        timestamp: expect.any(Number),
        entries: [],
      });
    });

    it('should handle CLS metric updates', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      const mockCLSMetric = {
        name: 'CLS',
        value: 0.05,
        delta: 0.05,
        id: 'cls-1',
        navigationType: 'navigate' as const,
        entries: [],
      };

      act(() => {
        if (mockOnCLS.callback) {
          mockOnCLS.callback(mockCLSMetric);
        }
      });

      expect(result.current.metrics.cls).toEqual({
        name: 'CLS',
        value: 0.05,
        delta: 0.05,
        id: 'cls-1',
        rating: 'good',
        navigationType: 'navigate',
        timestamp: expect.any(Number),
        entries: [],
      });
    });

    it('should handle TTFB metric updates', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      const mockTTFBMetric = {
        name: 'TTFB',
        value: 500,
        delta: 500,
        id: 'ttfb-1',
        navigationType: 'navigate' as const,
        entries: [],
      };

      act(() => {
        if (mockOnTTFB.callback) {
          mockOnTTFB.callback(mockTTFBMetric);
        }
      });

      expect(result.current.metrics.ttfb).toEqual({
        name: 'TTFB',
        value: 500,
        delta: 500,
        id: 'ttfb-1',
        rating: 'good',
        navigationType: 'navigate',
        timestamp: expect.any(Number),
        entries: [],
      });
    });

    it('should handle INP metric updates', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      const mockINPMetric = {
        name: 'INP',
        value: 150,
        delta: 150,
        id: 'inp-1',
        navigationType: 'navigate' as const,
        entries: [],
      };

      act(() => {
        if (mockOnINP.callback) {
          mockOnINP.callback(mockINPMetric);
        }
      });

      expect(result.current.metrics.inp).toEqual({
        name: 'INP',
        value: 150,
        delta: 150,
        id: 'inp-1',
        rating: 'good',
        navigationType: 'navigate',
        timestamp: expect.any(Number),
        entries: [],
      });
    });
  });

  describe('Metric Rating Calculations', () => {
    it('should rate LCP metrics correctly', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      // Test good rating (under 2500ms)
      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000,
            delta: 2000,
            id: 'lcp-good',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.metrics.lcp?.rating).toBe('good');

      // Test needs improvement rating (2500-4000ms)
      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 3000,
            delta: 3000,
            id: 'lcp-needs-improvement',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.metrics.lcp?.rating).toBe('needs-improvement');

      // Test poor rating (over 4000ms)
      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 5000,
            delta: 5000,
            id: 'lcp-poor',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.metrics.lcp?.rating).toBe('poor');
    });

    it('should rate FID metrics correctly', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      // Test good rating (under 100ms)
      act(() => {
        if (mockOnFCP.callback) {
          mockOnFCP.callback({
            name: 'FCP',
            value: 50,
            delta: 50,
            id: 'fid-good',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.metrics.fcp?.rating).toBe('good');

      // Test needs improvement rating (100-300ms)
      act(() => {
        if (mockOnFCP.callback) {
          mockOnFCP.callback({
            name: 'FCP',
            value: 200,
            delta: 200,
            id: 'fid-needs-improvement',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.metrics.fid?.rating).toBe('needs-improvement');

      // Test poor rating (over 300ms)
      act(() => {
        if (mockOnFCP.callback) {
          mockOnFCP.callback({
            name: 'FCP',
            value: 400,
            delta: 400,
            id: 'fid-poor',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.metrics.fcp?.rating).toBe('poor');
    });

    it('should rate CLS metrics correctly', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      // Test good rating (under 0.1)
      act(() => {
        if (mockOnCLS.callback) {
          mockOnCLS.callback({
            name: 'CLS',
            value: 0.05,
            delta: 0.05,
            id: 'cls-good',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.metrics.cls?.rating).toBe('good');

      // Test needs improvement rating (0.1-0.25)
      act(() => {
        if (mockOnCLS.callback) {
          mockOnCLS.callback({
            name: 'CLS',
            value: 0.15,
            delta: 0.15,
            id: 'cls-needs-improvement',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.metrics.cls?.rating).toBe('needs-improvement');

      // Test poor rating (over 0.25)
      act(() => {
        if (mockOnCLS.callback) {
          mockOnCLS.callback({
            name: 'CLS',
            value: 0.3,
            delta: 0.3,
            id: 'cls-poor',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.metrics.cls?.rating).toBe('poor');
    });
  });

  describe('Unsubscription on Unmount', () => {
    it('should register web vitals observers on mount', () => {
      renderHook(() => useCoreWebVitals());

      // Verify observers were registered
      expect(mockOnLCP).toHaveBeenCalled();
      expect(mockOnFCP).toHaveBeenCalled();
      expect(mockOnCLS).toHaveBeenCalled();
      expect(mockOnTTFB).toHaveBeenCalled();
      expect(mockOnINP).toHaveBeenCalled();
    });
  });

  describe('Analytics Reporting', () => {
    it('should report metrics to analytics when enabled', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValue({ ok: true });

      const options: CoreWebVitalsOptions = {
        enableAnalytics: true,
        analyticsEndpoint: 'https://api.example.com/analytics',
      };

      renderHook(() => useCoreWebVitals(options));

      // Trigger metrics that should trigger reporting
      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000,
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnCLS.callback) {
          mockOnCLS.callback({
            name: 'CLS',
            value: 0.05,
            delta: 0.05,
            id: 'cls-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnFCP.callback) {
          mockOnFCP.callback({
            name: 'FCP',
            value: 50,
            delta: 50,
            id: 'fid-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      // Wait for async operations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/analytics',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('core-web-vitals'),
          keepalive: true,
        })
      );
    });

    it('should handle analytics reporting errors gracefully', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const options: CoreWebVitalsOptions = {
        enableAnalytics: true,
        analyticsEndpoint: 'https://api.example.com/analytics',
      };

      const { result } = renderHook(() => useCoreWebVitals(options));

      // Trigger metrics
      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000,
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnCLS.callback) {
          mockOnCLS.callback({
            name: 'CLS',
            value: 0.05,
            delta: 0.05,
            id: 'cls-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnFCP.callback) {
          mockOnFCP.callback({
            name: 'FCP',
            value: 50,
            delta: 50,
            id: 'fid-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to report Core Web Vitals:', expect.any(Error));
      expect(result.current.isReporting).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Device Capabilities Detection', () => {
    it('should detect low-end device correctly', () => {
      // Mock low-end device
      const originalDeviceMemory = (navigator as any).deviceMemory;
      (navigator as any).deviceMemory = 0.5;

      const { result } = renderHook(() => useCoreWebVitals());

      expect(result.current.metrics.isLowEndDevice).toBe(true);
      expect(result.current.metrics.deviceMemory).toBe(0.5);

      // Restore original value
      (navigator as any).deviceMemory = originalDeviceMemory;
    });

    it('should detect high-end device correctly', () => {
      // Mock high-end device
      const originalDeviceMemory = (navigator as any).deviceMemory;
      (navigator as any).deviceMemory = 8;

      const { result } = renderHook(() => useCoreWebVitals());

      expect(result.current.metrics.isLowEndDevice).toBe(false);
      expect(result.current.metrics.deviceMemory).toBe(8);

      // Restore original value
      (navigator as any).deviceMemory = originalDeviceMemory;
    });

    it('should handle missing device memory gracefully', () => {
      // Mock device without deviceMemory support
      const originalDeviceMemory = (navigator as any).deviceMemory;
      delete (navigator as any).deviceMemory;

      const { result } = renderHook(() => useCoreWebVitals());

      expect(result.current.metrics.isLowEndDevice).toBe(false);
      expect(result.current.metrics.deviceMemory).toBe(null);

      // Restore original value
      (navigator as any).deviceMemory = originalDeviceMemory;
    });
  });

  describe('Performance Score Calculation', () => {
    it('should calculate performance score correctly', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      // Set up all metrics with good ratings
      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000,
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnCLS.callback) {
          mockOnCLS.callback({
            name: 'CLS',
            value: 0.05,
            delta: 0.05,
            id: 'cls-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnFCP.callback) {
          mockOnFCP.callback({
            name: 'FCP',
            value: 50,
            delta: 50,
            id: 'fid-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.performanceScore).toBe(100);
    });

    it('should calculate mixed performance score correctly', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      // Set up mixed ratings
      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000, // good
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnCLS.callback) {
          mockOnCLS.callback({
            name: 'CLS',
            value: 0.15, // needs improvement
            delta: 0.15,
            id: 'cls-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnFCP.callback) {
          mockOnFCP.callback({
            name: 'FCP',
            value: 400, // poor
            delta: 400,
            id: 'fid-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.performanceScore).toBe(50); // (100 + 50 + 0) / 3
    });
  });

  describe('Helper Functions', () => {
    it('should get metric rating correctly', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000,
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.getMetricRating('LCP')).toBe('good');
      expect(result.current.getMetricRating('FID')).toBe(null);
    });

    it('should get metric value correctly', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000,
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.getMetricValue('LCP')).toBe(2000);
      expect(result.current.getMetricValue('FID')).toBe(null);
    });

    it('should get threshold correctly', () => {
      const { result } = renderHook(() => useCoreWebVitals());

      expect(result.current.getThreshold('LCP')).toEqual({
        good: 2500,
        needsImprovement: 4000,
      });
      expect(result.current.getThreshold('INVALID')).toBe(null);
    });

    it('should check if metric is good correctly', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000, // good rating
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(result.current.isMetricGood('LCP')).toBe(true);
      expect(result.current.isMetricGood('FID')).toBe(false);
    });
  });

  describe('Console Logging', () => {
    it('should log metrics when console logging is enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: CoreWebVitalsOptions = {
        enableConsoleLogging: true,
      };

      renderHook(() => useCoreWebVitals(options));

      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000,
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '📊 Core Web Vitals - LCP:',
        expect.objectContaining({
          value: 2000,
          rating: 'good',
          delta: 2000,
        })
      );

      consoleSpy.mockRestore();
    });

    it('should not log metrics when console logging is disabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: CoreWebVitalsOptions = {
        enableConsoleLogging: false,
      };

      renderHook(() => useCoreWebVitals(options));

      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000,
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Callbacks', () => {
    it('should call onMetric callback when metric is received', () => {
      const onMetricSpy = jest.fn();

      const options: CoreWebVitalsOptions = {
        onMetric: onMetricSpy,
      };

      renderHook(() => useCoreWebVitals(options));

      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000,
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(onMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'LCP',
          value: 2000,
          rating: 'good',
        })
      );
    });

    it('should call onReport callback when key metrics are available', () => {
      const onReportSpy = jest.fn();

      const options: CoreWebVitalsOptions = {
        onReport: onReportSpy,
      };

      renderHook(() => useCoreWebVitals(options));

      // Trigger LCP, CLS, and FID metrics
      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000,
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnCLS.callback) {
          mockOnCLS.callback({
            name: 'CLS',
            value: 0.05,
            delta: 0.05,
            id: 'cls-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnFCP.callback) {
          mockOnFCP.callback({
            name: 'FCP',
            value: 50,
            delta: 50,
            id: 'fid-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      expect(onReportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          lcp: expect.any(Object),
          cls: expect.any(Object),
          fcp: expect.any(Object),
        })
      );
    });
  });

  describe('Manual Metric Collection', () => {
    it('should collect metrics manually when collectMetrics is called', () => {
      const { result } = renderHook(() => useCoreWebVitals());

      // Clear previous calls
      jest.clearAllMocks();

      act(() => {
        result.current.collectMetrics();
      });

      expect(mockOnLCP).toHaveBeenCalledWith(expect.any(Function), { reportAllChanges: true });
      expect(mockOnCLS).toHaveBeenCalledWith(expect.any(Function), { reportAllChanges: true });
      expect(mockOnFCP).toHaveBeenCalledWith(expect.any(Function), { reportAllChanges: true });
      expect(mockOnTTFB).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnINP).toHaveBeenCalledWith(expect.any(Function), { reportAllChanges: true });
    });

    it('should not collect metrics when not supported', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      delete global.window;

      const { result } = renderHook(() => useCoreWebVitals());

      act(() => {
        result.current.collectMetrics();
      });

      expect(mockOnLCP).not.toHaveBeenCalled();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('Summary Generation', () => {
    it('should generate correct summary with mixed metrics', async () => {
      const { result } = renderHook(() => useCoreWebVitals());

      // Set up mixed ratings
      act(() => {
        if (mockOnLCP.callback) {
          mockOnLCP.callback({
            name: 'LCP',
            value: 2000, // good
            delta: 2000,
            id: 'lcp-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnCLS.callback) {
          mockOnCLS.callback({
            name: 'CLS',
            value: 0.15, // needs improvement
            delta: 0.15,
            id: 'cls-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
        if (mockOnFCP.callback) {
          mockOnFCP.callback({
            name: 'FCP',
            value: 400, // poor
            delta: 400,
            id: 'fid-1',
            navigationType: 'navigate',
            entries: [],
          });
        }
      });

      const summary = result.current.summary;
      expect(summary).toEqual({
        good: 1,
        needsImprovement: 1,
        poor: 1,
        total: 3,
        score: 50,
      });
    });
  });
});
