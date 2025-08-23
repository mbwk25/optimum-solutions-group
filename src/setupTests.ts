// Import jest-dom for custom matchers
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Global test utilities and mocks

// Mock for window.matchMedia which is not available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock for ResizeObserver which is not available in JSDOM
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock for IntersectionObserver which is not available in JSDOM
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock for scrollTo which is not available in JSDOM
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock for getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    getPropertyValue: jest.fn(),
  })),
});

// Performance testing utilities
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    ...window.performance,
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    now: jest.fn(() => Date.now()),
  },
});

// Mock Web Vitals for performance testing
Object.defineProperty(window, 'PerformanceObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

// Mock requestAnimationFrame for animation testing
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: jest.fn(cb => setTimeout(cb, 16)), // 60fps
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: jest.fn(id => clearTimeout(id)),
});

// Mock pointer capture methods for Radix UI compatibility
Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  writable: true,
  value: jest.fn(() => false),
});

Object.defineProperty(Element.prototype, 'setPointerCapture', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  writable: true,
  value: jest.fn(),
});

// Mock scrollIntoView for Radix UI compatibility
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  writable: true,
  value: jest.fn(),
});

// Enhanced console warning suppression with specific patterns
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('Warning: componentWillMount') ||
       args[0].includes('target.hasPointerCapture is not a function') ||
       args[0].includes('Uncaught [TypeError: target.hasPointerCapture is not a function]') ||
       args[0].includes('candidate?.scrollIntoView is not a function') ||
       args[0].includes('Uncaught [TypeError: candidate?.scrollIntoView is not a function]'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('deprecated')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test configuration
jest.setTimeout(10000);

// Global performance tracking for tests
let testStartTime: number;
beforeEach(() => {
  testStartTime = performance.now();
});

afterEach(() => {
  const testEndTime = performance.now();
  const testDuration = testEndTime - testStartTime;
  
  // Warn if test takes longer than 1 second
  if (testDuration > 1000) {
    console.warn(`Test took ${testDuration.toFixed(2)}ms - consider optimizing`);
  }
});
