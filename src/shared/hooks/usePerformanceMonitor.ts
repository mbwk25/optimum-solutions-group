import { useEffect, useCallback } from 'react';
import { logPerformanceWarnings } from '@/utils/performanceBudget';
import type { PerformanceEventTiming, LayoutShift, WebVitalsMetrics } from '@/types/performance';

export const usePerformanceMonitor: () => void = () => {
  const reportWebVital: (metric: string, value: number) => void = useCallback((metric: string, value: number) => {
    // Only log in development, send to analytics in production
    if (process.env.NODE_ENV === 'development') {
      // Reduce logging frequency for CLS to avoid spam
      if (metric === 'CLS' && value === 0) {
        return; // Skip logging zero CLS values
      }
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
    const fcpObserver: PerformanceObserver = new PerformanceObserver((entryList) => {
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
    const lcpObserver: PerformanceObserver = new PerformanceObserver((entryList) => {
      const entries: PerformanceEntry[] = entryList.getEntries();
      const lastEntry: PerformanceEntry | undefined = entries[entries.length - 1];
      if (lastEntry) {
        metrics.lcp = lastEntry.startTime;
        reportWebVital('LCP', lastEntry.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(lcpObserver);

    // First Input Delay (FID)
    const fidObserver: PerformanceObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fidEntry: PerformanceEventTiming = entry as unknown as PerformanceEventTiming;
        if (fidEntry.processingStart) {
          const inputDelay: number = fidEntry.processingStart - fidEntry.startTime;
          metrics.fid = inputDelay;
          reportWebVital('FID', inputDelay);
        }
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
    observers.push(fidObserver);

    // Cumulative Layout Shift (CLS)
    const clsObserver: PerformanceObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const clsEntry: LayoutShift = entry as unknown as LayoutShift;
        if (!clsEntry.hadRecentInput) {
          metrics.cls += clsEntry.value;
        }
      }
      // Only report CLS if it's greater than 0 to reduce console spam
      if (metrics.cls > 0) {
        reportWebVital('CLS', metrics.cls);
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    observers.push(clsObserver);

    // Check performance budgets after metrics are captured
    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      logPerformanceWarnings();
    }, 3000);

    return () => {
      // Cleanup observers
      observers.forEach((observer: PerformanceObserver) => observer.disconnect());
      clearTimeout(timeoutId);
    };
  }, [reportWebVital]);
};

export default usePerformanceMonitor;