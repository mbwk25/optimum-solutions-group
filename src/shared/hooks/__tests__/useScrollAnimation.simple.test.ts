import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import useScrollAnimation from '../useScrollAnimation';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

// Create a proper mock for IntersectionObserverEntry
const createMockEntry = (target: HTMLElement, isIntersecting: boolean): IntersectionObserverEntry => ({
  target,
  isIntersecting,
  boundingClientRect: {} as DOMRectReadOnly,
  intersectionRatio: isIntersecting ? 1 : 0,
  intersectionRect: {} as DOMRectReadOnly,
  rootBounds: {} as DOMRectReadOnly,
  time: Date.now()
});

beforeEach(() => {
  mockIntersectionObserver.mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    root: null,
    rootMargin: '',
    thresholds: []
  }));
  
  // @ts-expect-error - Mocking for test
  global.IntersectionObserver = mockIntersectionObserver;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useScrollAnimation', () => {
  it('should return a ref', () => {
    const { result } = renderHook(() => useScrollAnimation());
    
    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it('should create IntersectionObserver with correct options', () => {
    renderHook(() => useScrollAnimation());
    
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
  });

  it('should add animate-in class when element intersects', () => {
    let observerCallback: (entries: IntersectionObserverEntry[]) => void;
    
    mockIntersectionObserver.mockImplementation((...args: unknown[]) => {
      const callback = args[0] as (entries: IntersectionObserverEntry[]) => void;
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
        root: null,
        rootMargin: '',
        thresholds: []
      };
    });
    
    const { result } = renderHook(() => useScrollAnimation());
    
    const mockElement = document.createElement('div');
    mockElement.classList.add('animate-out');
    (result.current as React.MutableRefObject<HTMLElement | null>).current = mockElement;
    
    // Simulate intersection
    const mockEntry = createMockEntry(mockElement, true);
    
    observerCallback!([mockEntry]);
    
    expect(mockElement.classList.contains('animate-in')).toBe(true);
    expect(mockElement.classList.contains('animate-out')).toBe(false);
  });

  it('should not add animate-in class when element does not intersect', () => {
    let observerCallback: (entries: IntersectionObserverEntry[]) => void;
    
    mockIntersectionObserver.mockImplementation((...args: unknown[]) => {
      const callback = args[0] as (entries: IntersectionObserverEntry[]) => void;
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
        root: null,
        rootMargin: '',
        thresholds: []
      };
    });
    
    const { result } = renderHook(() => useScrollAnimation());
    
    const mockElement = document.createElement('div');
    mockElement.classList.add('animate-out');
    (result.current as React.MutableRefObject<HTMLElement | null>).current = mockElement;
    
    // Simulate no intersection
    const mockEntry = createMockEntry(mockElement, false);
    
    observerCallback!([mockEntry]);
    
    expect(mockElement.classList.contains('animate-in')).toBe(false);
    expect(mockElement.classList.contains('animate-out')).toBe(true);
  });

  it('should work with different element types', () => {
    const { result: divResult } = renderHook(() => useScrollAnimation<HTMLDivElement>());
    const { result: sectionResult } = renderHook(() => useScrollAnimation<HTMLElement>());
    
    expect(divResult.current).toBeDefined();
    expect(sectionResult.current).toBeDefined();
  });
});
