/**
 * Minimal Unit Tests for usePWAStatus Hook
 * 
 * Tests PWA status detection functionality by working with
 * the existing global test setup rather than overriding it.
 * 
 * @version 1.0
 * @author Optimum Solutions Group
 */

import { renderHook, act, type RenderHookResult } from '@testing-library/react';
import { usePWAStatus, type PWACapabilities } from '../usePWAStatus';

describe('usePWAStatus Hook - Minimal Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return initial PWA status with expected properties', () => {
      const { result }: RenderHookResult<PWACapabilities, unknown> = renderHook(() => usePWAStatus());

      // Check that all expected properties exist
      expect(result.current).toHaveProperty('isStandalone');
      expect(result.current).toHaveProperty('canInstall');
      expect(result.current).toHaveProperty('isInstalled');
      expect(result.current).toHaveProperty('supportsNotifications');
      expect(result.current).toHaveProperty('supportsOffline');
      expect(result.current).toHaveProperty('supportsPush');
      expect(result.current).toHaveProperty('hasServiceWorker');

      // Check that all properties are boolean values
      expect(typeof result.current.isStandalone).toBe('boolean');
      expect(typeof result.current.canInstall).toBe('boolean');
      expect(typeof result.current.isInstalled).toBe('boolean');
      expect(typeof result.current.supportsNotifications).toBe('boolean');
      expect(typeof result.current.supportsOffline).toBe('boolean');
      expect(typeof result.current.supportsPush).toBe('boolean');
      expect(typeof result.current.hasServiceWorker).toBe('boolean');
    });

    it('should handle SSR environment gracefully', () => {
      // Store original window
      const originalWindow: Window & typeof globalThis = global.window;
      try {
        // @ts-expect-error - Intentionally setting window to undefined for SSR test
        global.window = undefined;

        const { result }: RenderHookResult<PWACapabilities, unknown> = renderHook(() => usePWAStatus());

        // Should not crash and should return initial state
        expect(result.current).toBeDefined();
        expect(result.current.isStandalone).toBe(false);
        expect(result.current.canInstall).toBe(false);
        expect(result.current.isInstalled).toBe(false);
      } finally {
        global.window = originalWindow;
      }
    });
  });

  describe('Hook Behavior', () => {
    it('should return the same object reference on re-renders when state does not change', () => {
      const { result, rerender }: RenderHookResult<PWACapabilities, unknown> = renderHook(() => usePWAStatus());

      const firstResult: PWACapabilities = result.current;
      rerender();
      const secondResult: PWACapabilities = result.current;

      // The hook should return the same object reference if state hasn't changed
      expect(firstResult).toBe(secondResult);
    });

    it('should handle multiple hook instances independently', () => {
      const { result: result1 }: RenderHookResult<PWACapabilities, unknown> = renderHook(() => usePWAStatus());
      const { result: result2 }: RenderHookResult<PWACapabilities, unknown> = renderHook(() => usePWAStatus());

      // Both instances should return the same initial state
      expect(result1.current).toEqual(result2.current);
    });
  });

  describe('Media Query Integration', () => {
    it('should call window.matchMedia with correct query', () => {
      const mockMatchMedia: jest.MockedFunction<typeof window.matchMedia> = window.matchMedia as jest.MockedFunction<typeof window.matchMedia>;

      renderHook(() => usePWAStatus());

      // Should call matchMedia with the standalone display mode query
      expect(mockMatchMedia).toHaveBeenCalledWith('(display-mode: standalone)');
    });

    it('should set up event listener on media query', () => {
      const mockMatchMedia: jest.MockedFunction<typeof window.matchMedia> = window.matchMedia as jest.MockedFunction<typeof window.matchMedia>;

      renderHook(() => usePWAStatus());

      // Get the mock media query that was returned
      const mockMediaQuery: MediaQueryList = mockMatchMedia.mock.results[mockMatchMedia.mock.results.length - 1]?.value as MediaQueryList;

      // Should set up change event listener
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should clean up event listener on unmount', () => {
      const mockMatchMedia: jest.MockedFunction<typeof window.matchMedia> = window.matchMedia as jest.MockedFunction<typeof window.matchMedia>;

      const { unmount }: RenderHookResult<PWACapabilities, unknown> = renderHook(() => usePWAStatus());

      // Get the mock media query that was returned
      const mockMediaQuery: MediaQueryList = mockMatchMedia.mock.results[mockMatchMedia.mock.results.length - 1]?.value as MediaQueryList;

      unmount();

      // Should clean up change event listener
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('State Updates', () => {
    it('should handle media query change events', () => {
      const mockMatchMedia: jest.MockedFunction<typeof window.matchMedia> = window.matchMedia as jest.MockedFunction<typeof window.matchMedia>;

      const { result }: RenderHookResult<PWACapabilities, unknown> = renderHook(() => usePWAStatus());

      // Get the mock media query that was returned
      const mockMediaQuery: MediaQueryList = mockMatchMedia.mock.results[mockMatchMedia.mock.results.length - 1]?.value as MediaQueryList;

      // Get the change handler that was registered
      const changeHandler: ((event: Event) => void) | undefined = (mockMediaQuery.addEventListener as jest.MockedFunction<typeof mockMediaQuery.addEventListener>).mock.calls[0]?.[1] as ((event: Event) => void) | undefined;

      // Simulate media query change by calling the handler
      act(() => {
        changeHandler?.(new Event('change'));
      });

      // The hook should still return a valid state (we can't easily test the exact values
      // due to the global mocking setup, but we can ensure it doesn't crash)
      expect(result.current).toBeDefined();
      expect(typeof result.current.isStandalone).toBe('boolean');
    });
  });

  describe('Type Safety', () => {
    it('should return PWACapabilities interface', () => {
      const { result }: RenderHookResult<PWACapabilities, unknown> = renderHook(() => usePWAStatus());

      // Type check - this will fail at compile time if the interface doesn't match
      const status: PWACapabilities = result.current;

      expect(status).toBeDefined();
      expect(typeof status.isStandalone).toBe('boolean');
      expect(typeof status.canInstall).toBe('boolean');
      expect(typeof status.isInstalled).toBe('boolean');
      expect(typeof status.supportsNotifications).toBe('boolean');
      expect(typeof status.supportsOffline).toBe('boolean');
      expect(typeof status.supportsPush).toBe('boolean');
      expect(typeof status.hasServiceWorker).toBe('boolean');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined window.matchMedia gracefully', () => {
      // Store original matchMedia
      const originalMatchMedia: typeof window.matchMedia = window.matchMedia;
      try {
        // Delete matchMedia
        delete (window as { matchMedia?: typeof window.matchMedia }).matchMedia;

        const { result }: RenderHookResult<PWACapabilities, unknown> = renderHook(() => usePWAStatus());

        // Should not crash and should return initial state
        expect(result.current).toBeDefined();
        expect(result.current.isStandalone).toBe(false);
      } finally {
        // Restore matchMedia even if an error occurred above
        window.matchMedia = originalMatchMedia;
      }
    });

    it('should handle media query without addEventListener', () => {
      const mockMatchMedia: jest.MockedFunction<typeof window.matchMedia> = window.matchMedia as jest.MockedFunction<typeof window.matchMedia>;

      // Mock a media query with non-functional addEventListener/removeEventListener
      const mockMediaQuery: MediaQueryList = {
        matches: false,
        media: '(display-mode: standalone)',
        addEventListener: jest.fn().mockImplementation(() => {
          throw new Error('addEventListener not supported');
        }),
        removeEventListener: jest.fn().mockImplementation(() => {
          throw new Error('removeEventListener not supported');
        }),
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      } as MediaQueryList;
      
      mockMatchMedia.mockReturnValueOnce(mockMediaQuery);

      const { result, unmount }: RenderHookResult<PWACapabilities, unknown> = renderHook(() => usePWAStatus());

      // Should not crash
      expect(result.current).toBeDefined();
      expect(result.current.isStandalone).toBe(false);

      // Should not crash on unmount either
      expect(() => unmount()).not.toThrow();
    });
  });
});
