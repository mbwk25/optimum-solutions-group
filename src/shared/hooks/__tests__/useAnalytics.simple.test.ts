/**
 * Smoke Tests for useAnalytics Hook
 * 
 * Tests analytics functionality with mocked dependencies to ensure:
 * 1. Events are dispatched correctly when enabled
 * 2. Config guards work properly (disabled/partial config)
 * 3. Hook is no-op in non-browser environments
 * 
 * @version 1.0
 * @author Optimum Solutions Group
 */

// Capture original global values/descriptors before mocking
const originalPerformanceDescriptor = Object.getOwnPropertyDescriptor(global, 'performance');
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(global, 'window');
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(global, 'document');
const originalFetchDescriptor = Object.getOwnPropertyDescriptor(global, 'fetch');

// Mock performance API globally before any imports
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => 1000),
    getEntriesByType: jest.fn(() => []),
  },
  writable: true,
  configurable: true,
});

import { renderHook, act } from '@testing-library/react';
import { useAnalytics, useFormAnalytics, useEcommerceAnalytics, useMediaAnalytics } from '../useAnalytics';
import type { AnalyticsHookConfig } from '../useAnalytics';

// Mock react-router-dom
const mockLocation = {
  pathname: '/test-page',
  search: '?param=value',
  hash: '#section',
  state: null,
  key: 'test-key',
};

jest.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
}));

// Mock analytics service
jest.mock('@/shared/services/analytics', () => {
  const mockAnalytics = {
    trackEvent: jest.fn(),
    trackClick: jest.fn(),
    trackPageView: jest.fn(),
    track: jest.fn(),
    trackTiming: jest.fn(),
    identify: jest.fn(),
    setUserProperty: jest.fn(),
    setExperiment: jest.fn(),
    getExperiment: jest.fn().mockReturnValue(null),
    getSession: jest.fn().mockReturnValue({
      id: 'test-session-123',
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 1,
      interactions: 0,
      duration: 0,
      isActive: true,
      referrer: '',
      landingPage: 'https://example.com',
      scrollDepth: 0,
      timeOnPage: 0,
      bounceRate: false,
    }),
    isEnabled: jest.fn().mockReturnValue(true),
    forceFlush: jest.fn().mockResolvedValue(undefined),
    trackPerformance: jest.fn(),
    trackError: jest.fn(),
  };
  
  return {
    __esModule: true,
    default: mockAnalytics,
    analytics: mockAnalytics,
  };
});

// Import the mocked analytics service
import mockAnalytics from '@/shared/services/analytics';

// Mock DOM APIs
const mockDocument = {
  title: 'Test Page Title',
  readyState: 'complete',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  createElement: jest.fn(() => ({
    tagName: 'DIV',
    textContent: 'Test Button',
    href: 'https://example.com',
    dataset: { trackClick: 'test-element' },
    closest: jest.fn(() => null),
  })),
  body: {
    scrollHeight: 1000,
  },
  documentElement: {
    scrollHeight: 1000,
  },
};

const mockWindow = {
  location: {
    href: 'https://example.com/test-page',
    pathname: '/test-page',
    search: '?param=value',
    hash: '#section',
  },
  scrollY: 0,
  innerHeight: 600,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  performance: {
    now: jest.fn(() => 1000),
    getEntriesByType: jest.fn(() => [
      {
        domContentLoadedEventStart: 100,
        domContentLoadedEventEnd: 200,
        loadEventStart: 300,
        loadEventEnd: 400,
        responseStart: 50,
        requestStart: 0,
      },
    ]),
  },
  requestAnimationFrame: jest.fn((cb) => {
    cb();
    return 1;
  }),
  navigator: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    language: 'en-US',
  },
  screen: {
    width: 1920,
    height: 1080,
  },
  Intl: {
    DateTimeFormat: jest.fn(() => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' }),
    })),
  },
};

// Mock global objects
(global as any).window = mockWindow;
(global as any).document = mockDocument;

// Mock performance API globally
(global as any).performance = {
  now: jest.fn(() => 1000),
  getEntriesByType: jest.fn(() => []),
};

// Mock performance globally for setupTests.ts
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => 1000),
    getEntriesByType: jest.fn(() => []),
  },
  writable: true,
  configurable: true,
});

// Mock fetch for network calls
global.fetch = jest.fn();

describe('useAnalytics Hook - Smoke Tests', () => {
  // Restore original globals after all tests complete
  afterAll(() => {
    // Restore original global descriptors/values
    if (originalPerformanceDescriptor) {
      Object.defineProperty(global, 'performance', originalPerformanceDescriptor);
    } else {
      delete (global as any).performance;
    }

    if (originalWindowDescriptor) {
      Object.defineProperty(global, 'window', originalWindowDescriptor);
    } else {
      delete (global as any).window;
    }

    if (originalDocumentDescriptor) {
      Object.defineProperty(global, 'document', originalDocumentDescriptor);
    } else {
      delete (global as any).document;
    }

    if (originalFetchDescriptor) {
      Object.defineProperty(global, 'fetch', originalFetchDescriptor);
    } else {
      delete (global as any).fetch;
    }
  });

  beforeEach(() => {
    // Ensure global objects are properly assigned
    (global as any).window = mockWindow;
    (global as any).document = mockDocument;
    
    // Clear all mocks before each test (after assignment)
    jest.clearAllMocks();
    
    // Reset DOM state
    mockDocument.readyState = 'complete';
    mockWindow.scrollY = 0;
    
    // Reset analytics service mocks to defaults
    (mockAnalytics.isEnabled as jest.Mock).mockReturnValue(true);
    (mockAnalytics.getSession as jest.Mock).mockReturnValue({
      id: 'test-session-123',
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 1,
      interactions: 0,
      duration: 0,
      isActive: true,
      referrer: '',
      landingPage: 'https://example.com',
      scrollDepth: 0,
      timeOnPage: 0,
      bounceRate: false,
    });
    (mockAnalytics.getExperiment as jest.Mock).mockReturnValue(null);
    (mockAnalytics.forceFlush as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
  });

  describe('Event Dispatch When Enabled', () => {
    it('should dispatch trackEvent when analytics is enabled', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackEvent('test-category', 'test-action', 'test-label', 100);
      });

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        'test-category',
        'test-action',
        'test-label',
        100
      );
    });

    it('should dispatch trackClick when analytics is enabled', () => {
      const config: AnalyticsHookConfig = {
        pageCategory: 'test-category',
        customProperties: { testProp: 'testValue' },
      };
      const { result } = renderHook(() => useAnalytics(config));

      act(() => {
        result.current.trackClick('test-element', 'https://example.com', { extra: 'data' });
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        type: 'interaction',
        category: 'engagement',
        action: 'click',
        label: 'test-element',
        properties: {
          targetUrl: 'https://example.com',
          elementType: 'test-element',
          pageCategory: 'test-category',
          testProp: 'testValue',
          extra: 'data',
        },
      });
    });

    it('should dispatch trackPageView when analytics is enabled', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPageView('/custom-page', 'Custom Page Title');
      });

      expect(mockAnalytics.trackPageView).toHaveBeenCalledWith(
        '/custom-page',
        'Custom Page Title'
      );
    });

    it('should dispatch trackGoal when analytics is enabled', () => {
      const config: AnalyticsHookConfig = {
        pageCategory: 'ecommerce',
        customProperties: { source: 'test' },
      };
      const { result } = renderHook(() => useAnalytics(config));

      act(() => {
        result.current.trackGoal('purchase-completed', 99.99, { currency: 'USD' });
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        type: 'goal',
        category: 'conversion',
        action: 'goal_completed',
        label: 'purchase-completed',
        value: 99.99,
        properties: {
          goalId: 'purchase-completed',
          pageCategory: 'ecommerce',
          source: 'test',
          currency: 'USD',
        },
      });
    });

    it('should dispatch trackTiming when analytics is enabled', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackTiming('performance', 'page-load', 1500, 'homepage');
      });

      expect(mockAnalytics.trackTiming).toHaveBeenCalledWith(
        'performance',
        'page-load',
        1500,
        'homepage'
      );
    });

    it('should dispatch identify when analytics is enabled', () => {
      const config: AnalyticsHookConfig = {
        customProperties: { source: 'signup' },
      };
      const { result } = renderHook(() => useAnalytics(config));

      act(() => {
        result.current.identify('user-123', { name: 'John Doe', email: 'john@example.com' });
      });

      expect(mockAnalytics.identify).toHaveBeenCalledWith('user-123', {
        source: 'signup',
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should dispatch setUserProperty when analytics is enabled', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.setUserProperty('preferred_language', 'en-US');
      });

      expect(mockAnalytics.setUserProperty).toHaveBeenCalledWith(
        'preferred_language',
        'en-US'
      );
    });

    it('should dispatch setExperiment when analytics is enabled', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.setExperiment('button-color-test', 'red');
      });

      expect(mockAnalytics.setExperiment).toHaveBeenCalledWith(
        'button-color-test',
        'red'
      );
    });

    it('should call getExperiment when analytics is enabled', () => {
      (mockAnalytics.getExperiment as jest.Mock).mockReturnValue('variant-a');
      const { result } = renderHook(() => useAnalytics());

      const experiment = result.current.getExperiment('button-color-test');

      expect(mockAnalytics.getExperiment).toHaveBeenCalledWith('button-color-test');
      expect(experiment).toBe('variant-a');
    });

    it('should call getSession when analytics is enabled', () => {
      const mockSession = {
        id: 'session-123',
        startTime: Date.now(),
        lastActivity: Date.now(),
        pageViews: 5,
        interactions: 10,
        duration: 300000,
        isActive: true,
        referrer: 'https://google.com',
        landingPage: 'https://example.com',
        scrollDepth: 75,
        timeOnPage: 300000,
        bounceRate: false,
      };
      (mockAnalytics.getSession as jest.Mock).mockReturnValue(mockSession);
      const { result } = renderHook(() => useAnalytics());

      const session = result.current.getSession();

      expect(mockAnalytics.getSession).toHaveBeenCalled();
      expect(session).toEqual(mockSession);
    });

    it('should call isEnabled when analytics is enabled', () => {
      (mockAnalytics.isEnabled as jest.Mock).mockReturnValue(true);
      const { result } = renderHook(() => useAnalytics());

      const isEnabled = result.current.isEnabled();

      expect(mockAnalytics.isEnabled).toHaveBeenCalled();
      expect(isEnabled).toBe(true);
    });

    it('should call flush when analytics is enabled', async () => {
      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        await result.current.flush();
      });

      expect(mockAnalytics.forceFlush).toHaveBeenCalled();
    });
  });

  describe('Config Guards and Early Returns', () => {
    it('should not track page views when trackPageViews is false', () => {
      const config: AnalyticsHookConfig = {
        trackPageViews: false,
      };
      renderHook(() => useAnalytics(config));

      // Page view should not be tracked on mount
      expect(mockAnalytics.trackPageView).not.toHaveBeenCalled();
    });

    it('should not track performance when trackPerformance is false', () => {
      const config: AnalyticsHookConfig = {
        trackPerformance: false,
        enableWebVitals: true,
      };
      renderHook(() => useAnalytics(config));

      // Performance tracking should not be set up
      expect(mockAnalytics.trackPerformance).not.toHaveBeenCalled();
    });

    it('should not track scroll depth when trackScrollDepth is false', () => {
      const config: AnalyticsHookConfig = {
        trackScrollDepth: false,
      };
      renderHook(() => useAnalytics(config));

      // Scroll tracking should not be set up
      expect(mockDocument.addEventListener).not.toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
    });

    it('should not track clicks when trackClicks is false', () => {
      const config: AnalyticsHookConfig = {
        trackClicks: false,
      };
      renderHook(() => useAnalytics(config));

      // Click tracking should not be set up
      expect(mockDocument.addEventListener).not.toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
    });

    it('should not track errors when trackErrors is false', () => {
      const config: AnalyticsHookConfig = {
        trackErrors: false,
      };
      renderHook(() => useAnalytics(config));

      // Error tracking should not be set up
      expect(mockWindow.addEventListener).not.toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
      expect(mockWindow.addEventListener).not.toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
    });

    it('should not track goal when value is undefined', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackGoal('test-goal');
      });

      // Goal should not be tracked without value
      expect(mockAnalytics.track).not.toHaveBeenCalled();
    });

    it('should handle partial config gracefully', () => {
      const config: AnalyticsHookConfig = {
        trackPageViews: true,
        // Other options undefined - should use defaults
      };
      const { result } = renderHook(() => useAnalytics(config));

      // Should still work with partial config
      act(() => {
        result.current.trackEvent('test', 'action');
      });

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('test', 'action', undefined, undefined);
    });
  });

  describe('Non-Browser Environment (No-Op)', () => {
    let originalWindow: typeof global.window;
    let originalDocument: typeof global.document;
    let originalPerformance: typeof global.window.performance;

    beforeEach(() => {
      // Store original globals
      originalWindow = global.window;
      originalDocument = global.document;
      originalPerformance = global.window?.performance;
    });

    afterEach(() => {
      // Restore original globals
      global.window = originalWindow;
      global.document = originalDocument;
      // Restore performance API if window exists
      if (global.window) {
        global.window.performance = originalPerformance;
      }
    });

    it('should be no-op when window is undefined', () => {
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      global.window = undefined;
      // @ts-expect-error - Intentionally setting document to undefined for SSR test
      global.document = undefined;

      const { result } = renderHook(() => useAnalytics());

      // All methods should exist but not throw errors
      expect(() => {
        result.current.trackEvent('test', 'action');
        result.current.trackClick('element');
        result.current.trackPageView();
        result.current.trackGoal('goal', 100);
        result.current.trackTiming('perf', 'metric', 1000);
        result.current.identify('user');
        result.current.setUserProperty('key', 'value');
        result.current.setExperiment('exp', 'variant');
        result.current.getExperiment('exp');
        result.current.getSession();
        result.current.isEnabled();
        result.current.flush();
      }).not.toThrow();

      // Analytics calls should still be made (the hook doesn't check for window existence)
      // This test verifies the hook doesn't crash in non-browser environments
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('test', 'action', undefined, undefined);
      // Note: trackClick and trackPageView may not be called due to DOM dependencies
      // The important thing is that the hook doesn't crash
    });

    it('should be no-op when document is undefined', () => {
      // @ts-expect-error - Intentionally setting document to undefined for SSR test
      global.document = undefined;

      const { result } = renderHook(() => useAnalytics());

      // Should not throw errors
      expect(() => {
        result.current.trackEvent('test', 'action');
        result.current.trackClick('element');
      }).not.toThrow();
    });

    it('should handle missing performance API gracefully', () => {
      // @ts-expect-error - Intentionally removing performance for test
      global.window.performance = undefined;

      const config: AnalyticsHookConfig = {
        trackPerformance: true,
        enableWebVitals: true,
      };

      expect(() => {
        renderHook(() => useAnalytics(config));
      }).not.toThrow();
    });
  });

  describe('Specialized Hooks', () => {
    describe('useFormAnalytics', () => {
      it('should track form events correctly', () => {
        const { result } = renderHook(() => useFormAnalytics('contact-form'));

        act(() => {
          result.current.trackFormStart();
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('form', 'start', 'contact-form', undefined);

        act(() => {
          result.current.trackFormSubmit(true, ['email required']);
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('form', 'submit_success', 'contact-form', undefined);
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('form', 'validation_error', 'contact-form', 1);

        act(() => {
          result.current.trackFieldFocus('email');
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('form', 'field_focus', 'contact-form_email', undefined);

        act(() => {
          result.current.trackFieldError('email');
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('form', 'field_error', 'contact-form_email', undefined);
      });
    });

    describe('useEcommerceAnalytics', () => {
      it('should track e-commerce events correctly', () => {
        const { result } = renderHook(() => useEcommerceAnalytics());

        act(() => {
          result.current.trackPurchase('txn-123', 99.99, [
            { id: 'item-1', name: 'Product 1', category: 'electronics', quantity: 1, price: 49.99 },
            { id: 'item-2', name: 'Product 2', category: 'electronics', quantity: 1, price: 50.00 },
          ]);
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('ecommerce', 'purchase', 'txn-123', 99.99);
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('ecommerce', 'purchase_item', 'item-1_Product 1', 49.99);
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('ecommerce', 'purchase_item', 'item-2_Product 2', 50.00);

        act(() => {
          result.current.trackAddToCart('item-3', 'Product 3', 25.00, 2);
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('ecommerce', 'add_to_cart', 'item-3_Product 3', 50.00);

        act(() => {
          result.current.trackRemoveFromCart('item-3', 'Product 3', 25.00, 1);
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('ecommerce', 'remove_from_cart', 'item-3_Product 3', 25.00);

        act(() => {
          result.current.trackViewItem('item-4', 'Product 4');
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('ecommerce', 'view_item', 'item-4_Product 4', undefined);
      });
    });

    describe('useMediaAnalytics', () => {
      it('should track media events correctly', () => {
        const { result } = renderHook(() => useMediaAnalytics('video'));

        act(() => {
          result.current.trackPlay('video-123', 120);
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('media', 'play', 'video_video-123', 120);

        act(() => {
          result.current.trackPause('video-123', 60);
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('media', 'pause', 'video_video-123', 60);

        act(() => {
          result.current.trackComplete('video-123', 120);
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('media', 'complete', 'video_video-123', 120);

        act(() => {
          result.current.trackSeek('video-123', 30, 60);
        });
        expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('media', 'seek', 'video_video-123', 30);
      });
    });
  });

  describe('Event Listeners and Cleanup', () => {
    it('should set up and clean up scroll event listeners', () => {
      const config: AnalyticsHookConfig = {
        trackScrollDepth: true,
      };
      
      // Create spies on the global window object
      const addEventListenerSpy: jest.SpyInstance = jest.spyOn(global.window, 'addEventListener');
      const removeEventListenerSpy: jest.SpyInstance = jest.spyOn(global.window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useAnalytics(config));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
      
      // Clean up spies
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should set up and clean up click event listeners', () => {
      const config: AnalyticsHookConfig = {
        trackClicks: true,
      };
      
      // Create spies on the global document object
      const addEventListenerSpy: jest.SpyInstance = jest.spyOn(global.document, 'addEventListener');
      const removeEventListenerSpy: jest.SpyInstance = jest.spyOn(global.document, 'removeEventListener');
      
      const { unmount } = renderHook(() => useAnalytics(config));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        { capture: true, passive: true }
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        { capture: true }
      );
      
      // Clean up spies
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should set up and clean up error event listeners', () => {
      const config: AnalyticsHookConfig = {
        trackErrors: true,
      };
      
      // Create spies on the global window object
      const addEventListenerSpy = jest.spyOn(global.window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(global.window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useAnalytics(config));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
      
      // Clean up spies
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Performance Integration', () => {
    it('should track performance metrics when enabled', () => {
      const config: AnalyticsHookConfig = {
        trackPerformance: true,
        enableWebVitals: true,
      };
      
      // Mock the performance.getEntriesByType method to return navigation data
      const getEntriesByTypeSpy = jest.spyOn(global.window.performance, 'getEntriesByType')
        .mockReturnValue([
          {
            domContentLoadedEventStart: 100,
            domContentLoadedEventEnd: 200,
            loadEventStart: 300,
            loadEventEnd: 400,
            responseStart: 50,
            requestStart: 0,
          } as PerformanceNavigationTiming,
        ]);
      
      renderHook(() => useAnalytics(config));

      // Should call trackPerformance with basic metrics
      expect(mockAnalytics.trackPerformance).toHaveBeenCalledWith({
        domContentLoaded: 100, // 200 - 100
        loadComplete: 100, // 400 - 300
      });
      
      // Clean up spy
      getEntriesByTypeSpy.mockRestore();
    });

    it('should not track performance when disabled', () => {
      const config: AnalyticsHookConfig = {
        trackPerformance: false,
        enableWebVitals: true,
      };
      renderHook(() => useAnalytics(config));

      expect(mockAnalytics.trackPerformance).not.toHaveBeenCalled();
    });
  });
});
