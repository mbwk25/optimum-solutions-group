/**
 * Core Web Vitals React Components
 * Provider and HOC for Core Web Vitals monitoring
 * Separated to fix React Fast Refresh warnings
 */

import React from 'react';
import { useCoreWebVitals } from '../hooks/useCoreWebVitals';
import { CoreWebVitalsContextType, CoreWebVitalsOptions } from '../types/coreWebVitals';
import { CoreWebVitalsContext } from '../contexts/CoreWebVitalsContext';

/**
 * Core Web Vitals Provider for app-wide monitoring
 */
export function CoreWebVitalsProvider({
  children,
  options = {},
}: {
  children: React.ReactNode;
  options?: CoreWebVitalsOptions;
}) {
  const webVitals = useCoreWebVitals(options);
  
  const contextValue: CoreWebVitalsContextType = {
    metrics: webVitals.metrics,
    performanceScore: webVitals.performanceScore,
    summary: webVitals.summary,
    collectMetrics: webVitals.collectMetrics,
    isSupported: webVitals.isSupported,
  };

  return (
    <CoreWebVitalsContext.Provider value={contextValue}>
      {children}
    </CoreWebVitalsContext.Provider>
  );
}

// Note: The withCoreWebVitals HOC has been moved to src/shared/hocs/withCoreWebVitals.tsx
// to fix React Fast Refresh warnings.
