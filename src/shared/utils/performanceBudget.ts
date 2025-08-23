// Performance budget monitoring
export const PERFORMANCE_BUDGETS = {
  FCP: 1500, // First Contentful Paint - 1.5s
  LCP: 2500, // Largest Contentful Paint - 2.5s
  FID: 100,  // First Input Delay - 100ms
  CLS: 0.1,  // Cumulative Layout Shift - 0.1
  TBT: 300,  // Total Blocking Time - 300ms
  BUNDLE_SIZE: 500000, // 500KB bundle size limit
};

export const checkPerformanceBudget = () => {
  const results: Record<string, { value: number; budget: number; passed: boolean }> = {};

  // Check bundle size
  const bundleSize = performance.getEntriesByType('navigation')[0];
  if (bundleSize && 'transferSize' in bundleSize) {
    const transferSize = (bundleSize as { transferSize: number }).transferSize || 0;
    results.bundleSize = {
      value: transferSize,
      budget: PERFORMANCE_BUDGETS.BUNDLE_SIZE,
      passed: transferSize <= PERFORMANCE_BUDGETS.BUNDLE_SIZE
    };
  }

  return results;
};

export const logPerformanceWarnings = () => {
  const budgetResults = checkPerformanceBudget();
  
  Object.entries(budgetResults).forEach(([metric, result]) => {
    if (!result.passed) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `🚨 Performance Budget Exceeded: ${metric}`,
          `Actual: ${result.value}, Budget: ${result.budget}`
        );
      }
      // In production, send to your monitoring service
      // Example: analytics.track('performance_budget_exceeded', { metric, ...result });
    } else if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ Performance Budget Met: ${metric}`,
        `Actual: ${result.value}, Budget: ${result.budget}`
      );
    }
  });
};

export default { PERFORMANCE_BUDGETS, checkPerformanceBudget, logPerformanceWarnings };