import { useEffect, useCallback } from 'react';
import { logPerformanceWarnings } from '@/utils/performanceBudget';
import type { PerformanceEventTiming, LayoutShift, WebVitalsMetrics } from '@/types/performance';

export const usePerformanceMonitor = () => {
  const reportWebVital = useCallback((metric: string, value: number) => {
    // Only log in development, send to analytics in production
    if (process.env.NODE_ENV === 'development') {
      console.log(`${metric}:`, value);
    } else {
      // Here you would send to your analytics service
      // Example: analytics.track('web_vital', { metric, value });
    }
  }, []);

  useEffect(() => {
    const observers: PerformanceObserver[] = [];
    const metrics: WebVitalsMetrics = {
      fcp: null,
      lcp: null,
      fid: null,
      cls: 0
    };

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
          reportWebVital('FCP', entry.startTime);
        }
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });
    observers.push(fcpObserver);

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metrics.lcp = lastEntry.startTime;
        reportWebVital('LCP', lastEntry.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(lcpObserver);

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fidEntry = entry as unknown as PerformanceEventTiming;
        if (fidEntry.processingStart) {
          const inputDelay = fidEntry.processingStart - fidEntry.startTime;
          metrics.fid = inputDelay;
          reportWebVital('FID', inputDelay);
        }
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
    observers.push(fidObserver);

    // Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const clsEntry = entry as unknown as LayoutShift;
        if (!clsEntry.hadRecentInput) {
          metrics.cls += clsEntry.value;
        }
      }
      reportWebVital('CLS', metrics.cls);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    observers.push(clsObserver);

    // Check performance budgets after metrics are captured
    const timeoutId = setTimeout(() => {
      logPerformanceWarnings();
    }, 3000);

    return () => {
      // Cleanup observers
      observers.forEach(observer => observer.disconnect());
      clearTimeout(timeoutId);
    };
  }, [reportWebVital]);
};

export default usePerformanceMonitor;