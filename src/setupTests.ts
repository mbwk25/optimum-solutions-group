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
    now: jest.fn(() => 1234567890),
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

// Polyfill for HTMLFormElement.requestSubmit (not implemented in JSDOM)
if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function(submitter?: HTMLElement) {
    if (submitter) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      Object.defineProperty(submitEvent, 'submitter', {
        value: submitter,
        configurable: true
      });
      this.dispatchEvent(submitEvent);
    } else {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      this.dispatchEvent(submitEvent);
    }
  };
}

// Enhanced console warning suppression with specific patterns
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Handle both string messages and error objects
    const firstArg = args[0];
    let message = '';
    
    if (typeof firstArg === 'string') {
      message = firstArg;
    } else if (firstArg && typeof firstArg === 'object') {
      message = firstArg.toString();
    }
    
    // Suppress known testing-related warnings and errors
    if (
      message.includes('Warning: ReactDOM.render is no longer supported') ||
      message.includes('Warning: componentWillReceiveProps') ||
      message.includes('Warning: componentWillMount') ||
      message.includes('target.hasPointerCapture is not a function') ||
      message.includes('Uncaught [TypeError: target.hasPointerCapture is not a function]') ||
      message.includes('candidate?.scrollIntoView is not a function') ||
      message.includes('Uncaught [TypeError: candidate?.scrollIntoView is not a function]') ||
      message.includes('Not implemented: HTMLFormElement.prototype.requestSubmit') ||
      message.includes('Error: Not implemented: HTMLFormElement.prototype.requestSubmit') ||
      message.includes('Warning: You provided a `value` prop to a form field without an `onChange` handler') ||
      message.includes('This will render a read-only field')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (
      message.includes('deprecated') ||
      message.includes('Warning: You provided a `value` prop to a form field without an `onChange` handler') ||
      message.includes('You provided a `value` prop to a form field without an `onChange` handler') ||
      message.includes('This will render a read-only field')
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

// Mock import.meta for Vite compatibility
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        MODE: 'test',
        DEV: true,
        PROD: false
      }
    }
  }
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
