import { useEffect } from 'react';
import { logPerformanceWarnings } from '@/utils/performanceBudget';

export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const reportWebVitals = () => {
      // First Contentful Paint (FCP)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
          }
        }
      }).observe({ type: 'paint', buffered: true });

      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay (FID) / Interaction to Next Paint (INP)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fidEntry = entry as any; // PerformanceEventTiming
          if (fidEntry.processingStart) {
            const inputDelay = fidEntry.processingStart - fidEntry.startTime;
            console.log('Input Delay:', inputDelay);
          }
        }
      }).observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift (CLS)
      new PerformanceObserver((entryList) => {
        let clsValue = 0;
        for (const entry of entryList.getEntries()) {
          const clsEntry = entry as any; // LayoutShift
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
          }
        }
        console.log('CLS:', clsValue);
      }).observe({ type: 'layout-shift', buffered: true });
    };

    // Run after page load and check performance budgets
    const checkBudgetsAfterLoad = () => {
      reportWebVitals();
      // Check performance budgets after a delay to ensure metrics are captured
      setTimeout(logPerformanceWarnings, 3000);
    };

    // Run after page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkBudgetsAfterLoad);
    } else {
      checkBudgetsAfterLoad();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', checkBudgetsAfterLoad);
    };
  }, []);
};

export default usePerformanceMonitor;