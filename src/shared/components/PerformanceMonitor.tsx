import React, { useEffect, useState } from 'react';
import { useCoreWebVitals } from '@/shared/hooks/useCoreWebVitals';

interface PerformanceMonitorProps {
  showDevTools?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDevTools = import.meta.env.MODE === 'development'
}) => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  
  const { 
    metrics, 
    performanceScore, 
    isSupported 
  } = useCoreWebVitals({
    enableConsoleLogging: import.meta.env.MODE === 'development',
    reportAllChanges: false,
    onReport: (data) => {
      setPerformanceData(data);
    }
  });

  // Resource loading performance
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
          
          if (import.meta.env.MODE === 'development') {
            console.log('Page Load Performance:', {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: loadTime,
              firstByte: navEntry.responseStart - navEntry.requestStart,
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });
    
    return () => observer.disconnect();
  }, []);

  // Memory usage monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMemoryUsage = () => {
      // @ts-ignore - performance.memory is experimental but widely supported
      if (window.performance?.memory) {
        // @ts-ignore
        const memory = window.performance.memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 90) {
          console.warn('High memory usage detected:', usagePercent.toFixed(2) + '%');
        }
      }
    };

    const interval = setInterval(checkMemoryUsage, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!isSupported || !showDevTools) {
    return null;
  }

  return (
    <>
      {showDevTools && performanceData && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
          <h4 className="font-semibold mb-2">Performance Metrics</h4>
          <div className="space-y-1">
            <div>Score: {performanceScore}/100</div>
            {metrics.lcp && (
              <div className={`${metrics.lcp.rating === 'good' ? 'text-green-400' : metrics.lcp.rating === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400'}`}>
                LCP: {metrics.lcp.value.toFixed(0)}ms ({metrics.lcp.rating})
              </div>
            )}
            {metrics.fid && (
              <div className={`${metrics.fid.rating === 'good' ? 'text-green-400' : metrics.fid.rating === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400'}`}>
                FID: {metrics.fid.value.toFixed(0)}ms ({metrics.fid.rating})
              </div>
            )}
            {metrics.cls && (
              <div className={`${metrics.cls.rating === 'good' ? 'text-green-400' : metrics.cls.rating === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400'}`}>
                CLS: {metrics.cls.value.toFixed(3)} ({metrics.cls.rating})
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;