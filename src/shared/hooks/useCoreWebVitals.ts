/**
 * Core Web Vitals Custom Hook
 * Separated from components to fix React Fast Refresh warnings
 */

import { useEffect, useCallback, useState } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { 
  CWV_THRESHOLDS, 
  WebVitalsMetric, 
  CoreWebVitalsData, 
  CoreWebVitalsOptions 
} from '../types/coreWebVitals';

interface DeviceCapabilities {
  isLowEndDevice: boolean;
  deviceMemory: number | null;
  connectionType: string | null;
}

/**
 * Custom hook for monitoring Core Web Vitals performance metrics
 * Tracks LCP, FID, CLS, FCP, TTFB, and INP with real-time updates
 */
export function useCoreWebVitals(options: CoreWebVitalsOptions = {}) {
  const [metrics, setMetrics] = useState<CoreWebVitalsData>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    isLowEndDevice: false,
    pageLoadTime: 0,
  });

  const [isSupported, setIsSupported] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  
  // Device and connection detection
  const detectDeviceCapabilities = useCallback((): DeviceCapabilities => {
    if (typeof navigator === 'undefined') {
      return {
        isLowEndDevice: false,
        deviceMemory: null,
        connectionType: null,
      };
    }
    
    // @ts-expect-error - DeviceMemory is experimental but widely supported
    const deviceMemory = navigator.deviceMemory ?? null;
    // @ts-expect-error - Connection API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    const isLowEndDevice = (deviceMemory !== null && deviceMemory <= 1) || 
      (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'));
    
    return {
      isLowEndDevice,
      deviceMemory,
      connectionType: connection?.effectiveType || null,
    };
  }, []);

  // Convert raw metric to our enhanced format
  const processMetric = useCallback((metric: Metric): WebVitalsMetric => {
    const thresholds = CWV_THRESHOLDS[metric.name as keyof typeof CWV_THRESHOLDS];
    let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
    
    if (thresholds) {
      if (metric.value > thresholds.needsImprovement) {
        rating = 'poor';
      } else if (metric.value > thresholds.good) {
        rating = 'needs-improvement';
      }
    }

    return {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      rating,
      navigationType: (() => {
        switch (metric.navigationType) {
          case 'back-forward':
          case 'back-forward-cache':
            return 'back_forward';
          case 'navigate':
          case 'reload':
          case 'prerender':
            return metric.navigationType;
          default:
            return 'navigate';
        }
      })(),
      timestamp: Date.now(),
      entries: metric.entries,
    };
  }, []);

  // Send metrics to analytics endpoint
  const reportToAnalytics = useCallback(async (data: CoreWebVitalsData) => {
    if (!options.enableAnalytics || !options.analyticsEndpoint) return;

    try {
      setIsReporting(true);
      await fetch(options.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'core-web-vitals',
          data,
          timestamp: Date.now(),
        }),
        keepalive: true, // Ensure data is sent even if page unloads
      });
    } catch (error) {
      console.error('Failed to report Core Web Vitals:', error);
    } finally {
      setIsReporting(false);
    }
  }, [options.enableAnalytics, options.analyticsEndpoint]);

  // Handle metric updates
  const handleMetric = useCallback((metric: Metric) => {
    const processedMetric = processMetric(metric);
    
    if (options.enableConsoleLogging) {
      console.log(`📊 Core Web Vitals - ${metric.name}:`, {
        value: metric.value,
        rating: processedMetric.rating,
        delta: metric.delta,
      });
    }

    // Update metrics state
    setMetrics(prev => {
      const updated = {
        ...prev,
        [metric.name.toLowerCase()]: processedMetric,
        timestamp: Date.now(),
      };

      // Call callbacks
      options.onMetric?.(processedMetric);
      
      // Report complete data if we have key metrics
      if (updated.lcp && updated.cls && (updated.fid || updated.inp)) {
        options.onReport?.(updated);
        reportToAnalytics(updated);
      }

      return updated;
    });
  }, [processMetric, options, reportToAnalytics]);

  // Initialize Core Web Vitals monitoring
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }

    try {
      const deviceInfo = detectDeviceCapabilities();
      
      setMetrics(prev => ({
        ...prev,
        ...deviceInfo,
        pageLoadTime: performance.now(),
      }));

      // Register Web Vitals observers
      const options_internal = { reportAllChanges: options.reportAllChanges ?? false };

      onLCP(handleMetric, options_internal);
      onFCP(handleMetric, options_internal);
      onCLS(handleMetric, options_internal);
      onTTFB(handleMetric);
      
      // INP is newer, might not be available in all browsers
      try {
        onINP(handleMetric, options_internal);
      } catch {
        console.warn('INP metric not supported in this browser');
      }

    } catch (error) {
      console.error('Core Web Vitals not supported:', error);
      setIsSupported(false);
    }
  }, [handleMetric, detectDeviceCapabilities, options.reportAllChanges]);

  // Calculate overall performance score
  const getPerformanceScore = useCallback((): number => {
    const scores: number[] = [];
    
    Object.values(metrics).forEach(metric => {
      if (metric && typeof metric === 'object' && 'rating' in metric) {
        switch (metric.rating) {
          case 'good': scores.push(100); break;
          case 'needs-improvement': scores.push(50); break;
          case 'poor': scores.push(0); break;
        }
      }
    });

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [metrics]);

  // Get metrics summary
  const getSummary = useCallback(() => {
    const summary = {
      good: 0,
      needsImprovement: 0,
      poor: 0,
      total: 0,
      score: getPerformanceScore(),
    };

    Object.values(metrics).forEach(metric => {
      if (metric && typeof metric === 'object' && 'rating' in metric) {
        summary.total++;
        switch (metric.rating) {
          case 'good': summary.good++; break;
          case 'needs-improvement': summary.needsImprovement++; break;
          case 'poor': summary.poor++; break;
        }
      }
    });

    return summary;
  }, [metrics, getPerformanceScore]);

  // Manual metric collection (useful for SPAs)
  const collectMetrics = useCallback(() => {
    if (!isSupported) return;

    try {
      // Force collection of current metrics
      onLCP(handleMetric, { reportAllChanges: true });
      onCLS(handleMetric, { reportAllChanges: true });
      onFCP(handleMetric, { reportAllChanges: true });
      onTTFB(handleMetric);
      
      try {
        onINP(handleMetric, { reportAllChanges: true });
      } catch {
        // INP not supported
      }
    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  }, [isSupported, handleMetric]);

  return {
    // Core data
    metrics,
    isSupported,
    isReporting,
    
    // Computed values
    performanceScore: getPerformanceScore(),
    summary: getSummary(),
    
    // Actions
    collectMetrics,
    
    // Helper functions
    getMetricRating: (metricName: string) => {
      const metric = metrics[metricName.toLowerCase() as keyof CoreWebVitalsData];
      return metric && typeof metric === 'object' && 'rating' in metric ? metric.rating : null;
    },
    
    getMetricValue: (metricName: string) => {
      const metric = metrics[metricName.toLowerCase() as keyof CoreWebVitalsData];
      return metric && typeof metric === 'object' && 'value' in metric ? metric.value : null;
    },
    
    getThreshold: (metricName: string) => {
      return CWV_THRESHOLDS[metricName as keyof typeof CWV_THRESHOLDS] || null;
    },
    
    isMetricGood: (metricName: string) => {
      const rating = metrics[metricName.toLowerCase() as keyof CoreWebVitalsData];
      return rating && typeof rating === 'object' && 'rating' in rating && rating.rating === 'good';
    },
  };
}
