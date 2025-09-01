/**
 * Enhanced Test Utilities for Optimum Solutions Group
 * 
 * Provides standardized testing utilities following the coding standards:
 * - TypeScript strict mode compliance
 * - Performance testing capabilities  
 * - Accessibility testing integration
 * - Consistent component rendering patterns
 * 
 * @version 1.0
 * @author Optimum Solutions Group
 */

import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Re-export from data factories
export type { ButtonProps } from './testDataFactories';

// TypeScript interface for test context options
export interface TestProviderOptions {
  withRouter?: boolean;
  withAccessibility?: boolean;
  withErrorBoundary?: boolean;
  initialRoute?: string;
}

// TypeScript interface for performance metrics
export interface PerformanceMetrics {
  renderTime: number;
  componentMountTime: number;
  rerenderTime?: number;
}

// TypeScript interface for accessibility test results
export interface AccessibilityTestResult {
  violations: unknown[];
  passed: boolean;
  results: unknown;
}

// This will be defined in a separate .tsx file to handle JSX
export { renderWithProviders } from './reactTestUtils';

/**
 * Measure component render performance
 * Follows the performance monitoring standards from the coding guidelines
 */
export const measureRenderPerformance = async (
  renderComponent: () => HTMLElement | DocumentFragment
): Promise<PerformanceMetrics> => {
  const startTime = performance.now();
  
  // Mark the start of component rendering
  performance.mark('component-render-start');
  
  // Execute the render component function
  const renderResult = renderComponent();
  
  // Mark the end of component rendering
  performance.mark('component-render-end');
  
  const endTime = performance.now();
  const totalRenderTime = endTime - startTime;
  
  // Measure the render time
  performance.measure('component-render-time', 'component-render-start', 'component-render-end');
  
  // Simulate component mount time (for hooks and effects)
  await new Promise(resolve => setTimeout(resolve, 0));
  const mountEndTime = performance.now();
  const componentMountTime = mountEndTime - endTime;
  
  // Suppress unused variable warning by using the result
  void renderResult;
  
  return {
    renderTime: totalRenderTime,
    componentMountTime,
  };
};

/**
 * Accessibility testing utility
 * Integrates axe-core for comprehensive accessibility testing
 */
export const testAccessibility = async (
  component: HTMLElement | DocumentFragment
): Promise<AccessibilityTestResult> => {
  const results = await axe(component);
  
  return {
    violations: results.violations,
    passed: results.violations.length === 0,
    results: results,
  };
};

// This will be defined in a separate .tsx file
export { renderAndTestAccessibility } from './reactTestUtils';

/**
 * Mock data factory for consistent test data
 * Following the coding standards for type definitions
 */
export const createMockUser = () => ({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  preferences: {
    theme: 'light' as const,
    notifications: true,
  },
});

/**
 * Mock API response factory with proper typing
 */
export const createMockApiResponse = <T>(data: T): { data: T; status: number; message?: string } => ({
  data,
  status: 200,
  message: 'Success',
});

/**
 * Performance benchmark utility for component testing
 * Tests if component meets performance standards (less than 16ms render time for 60fps)
 */
export const benchmarkComponent = async (
  renderFn: () => HTMLElement | DocumentFragment,
  expectedMaxRenderTime = 16
): Promise<{ passed: boolean; metrics: PerformanceMetrics }> => {
  const metrics = await measureRenderPerformance(renderFn);
  const passed = metrics.renderTime < expectedMaxRenderTime;
  
  if (!passed) {
    console.warn(`Component render time ${metrics.renderTime.toFixed(2)}ms exceeds target ${expectedMaxRenderTime}ms`);
  }
  
  return { passed, metrics };
};

/**
 * Helper to create mock intersection observer for lazy loading tests
 */
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

/**
 * Helper to create mock resize observer for responsive tests
 */
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

/**
 * Utility to simulate viewport resize for responsive testing
 */
export const resizeViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

/**
 * Utility to wait for async operations in tests
 * Useful for testing hooks and async component behavior
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> => {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
};
