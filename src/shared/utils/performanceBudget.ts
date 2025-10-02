import { logger } from './logger';

// Performance budget monitoring
export const PERFORMANCE_BUDGETS: Record<string, number> = {
  FCP: 1500, // First Contentful Paint - 1.5s
  LCP: 2500, // Largest Contentful Paint - 2.5s
  FID: 100,  // First Input Delay - 100ms
  CLS: 0.1,  // Cumulative Layout Shift - 0.1
  TBT: 300,  // Total Blocking Time - 300ms
  BUNDLE_SIZE: 500000, // 500KB bundle size limit
};

export const checkPerformanceBudget = () => {
  const results: Record<string, { value: number; budget: number; passed: boolean }> = {};

  // Guard for browser environment and Performance API availability
  if (typeof window !== 'undefined' && typeof performance !== 'undefined' && performance.getEntriesByType) {
    // Check bundle size - prioritize JS bundle measurement
    let bundleSize: number = 0;

    try {
      // Get resource entries and sum transferSize for script resources
      const resourceEntries: PerformanceResourceTiming[] = performance.getEntriesByType('resource');
      const scriptResources: PerformanceResourceTiming[] = resourceEntries.filter((entry: PerformanceResourceTiming) =>
        entry.initiatorType === 'script' || entry.name.endsWith('.js')
      );

      bundleSize = scriptResources.reduce((sum: number, entry: PerformanceResourceTiming) => {
        return sum + (entry.transferSize || 0);
      }, 0);

      // Fall back to navigation entry transferSize if no script resources found
      if (bundleSize === 0) {
        const navigationEntry: PerformanceNavigationTiming | undefined = performance.getEntriesByType('navigation')[0];
        bundleSize = navigationEntry?.transferSize || 0;
      }
    } catch (error) {
      // Handle any errors gracefully
      console.warn('Error measuring bundle size:', error);
      bundleSize = 0;
    }

    results['bundleSize'] = {
      value: bundleSize,
      budget: PERFORMANCE_BUDGETS['BUNDLE_SIZE'] || 0,
      passed: bundleSize <= (PERFORMANCE_BUDGETS['BUNDLE_SIZE'] || 0)
    };
  }

  return results;
};

export const logPerformanceWarnings = () => {
  const budgetResults: Record<string, { value: number; budget: number; passed: boolean }> = checkPerformanceBudget();
  const isDev: boolean = typeof process !== 'undefined' && (process as unknown as { env?: { NODE_ENV?: string } }).env?.NODE_ENV === 'development';
  if (isDev) console.log(budgetResults);
  Object.entries(budgetResults).forEach(([metric, result]) => {
    if (!result.passed) {
      if (isDev) {
        logger.warn(
          `🚨 Performance Budget Exceeded: ${metric}`,
          `Actual: ${result.value}, Budget: ${result.budget}`
        );
      }
      // In production, send to your monitoring service
      // Example: analytics.track('performance_budget_exceeded', { metric, ...result });
    } else if (isDev) {
      console.log(
        `✅ Performance Budget Met: ${metric}`,
        `Actual: ${result.value}, Budget: ${result.budget}`
      );
    }
  });
};

export default { PERFORMANCE_BUDGETS, checkPerformanceBudget, logPerformanceWarnings };