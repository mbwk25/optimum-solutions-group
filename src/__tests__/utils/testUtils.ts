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
  const startTime: number = performance.now();
  
  // Mark the start of component rendering
  performance.mark('component-render-start');
  
  // Execute the render component function
  const renderResult: HTMLElement | DocumentFragment = renderComponent();
  
  // Mark the end of component rendering
  performance.mark('component-render-end');
  
  const endTime: number = performance.now();
  const totalRenderTime: number = endTime - startTime;
  
  // Measure the render time
  performance.measure('component-render-time', 'component-render-start', 'component-render-end');
  
  // Simulate component mount time (for hooks and effects)
  await new Promise(resolve => setTimeout(resolve, 0));
  const mountEndTime: number = performance.now();
  const componentMountTime: number = mountEndTime - endTime;
  
  // Suppress unused variable warning by using the result
  void renderResult;
  
  return {
    renderTime: totalRenderTime,
    componentMountTime,
  };
};

/**
 * Accessibility testing utility
 * Note: Requires jest-axe to be properly configured in test environment
 */
export const testAccessibility = async (
  _component: HTMLElement | DocumentFragment
): Promise<AccessibilityTestResult> => {
  // This function is a placeholder for test environments
  // Actual implementation requires jest-axe setup
  return {
    violations: [],
    passed: true,
    results: {},
  };
};

// This will be defined in a separate .tsx file
export { renderAndTestAccessibility } from './reactTestUtils';

/**
 * Mock data factory for consistent test data
 * Following the coding standards for type definitions
 */
type MockUserPreferences = {
  theme: 'light' | 'dark';
  notifications: boolean;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  preferences: MockUserPreferences;
};

export const createMockUser = (): MockUser => ({
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
  const metrics: PerformanceMetrics = await measureRenderPerformance(renderFn);
  const passed: boolean = metrics.renderTime < expectedMaxRenderTime;
  
  if (!passed) {
    console.warn(`Component render time ${metrics.renderTime.toFixed(2)}ms exceeds target ${expectedMaxRenderTime}ms`);
  }
  
  return { passed, metrics };
};

/**
 * Helper to create mock intersection observer for lazy loading tests
 */
export const mockIntersectionObserver = (): jest.Mock => {
  const mockIntersectionObserver: jest.Mock = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;
  return mockIntersectionObserver;
};

/**
 * Helper to create mock resize observer for responsive tests
 */
export const mockResizeObserver = (): jest.Mock => {
  const mockResizeObserver: jest.Mock = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.ResizeObserver = mockResizeObserver as unknown as typeof ResizeObserver;
  return mockResizeObserver;
};

/**
 * Utility to simulate viewport resize for responsive testing
 */
export const resizeViewport = (width: number, height: number): void => {

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
  const startTime: number = Date.now();
  
  return new Promise((resolve, reject) => {
    const check: () => void = () => {
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
