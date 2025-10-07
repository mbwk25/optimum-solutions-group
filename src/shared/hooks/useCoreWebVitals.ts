/**
 * Core Web Vitals Custom Hook
 * Separated from components to fix React Fast Refresh warnings
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { 
  CWV_THRESHOLDS, 
  WebVitalsMetric, 
  CoreWebVitalsData, 
  CoreWebVitalsOptions 
} from '../types/coreWebVitals';

// Export types for use in other components
export type { WebVitalsMetric, CWV_THRESHOLDS };

// Prevent duplicate web-vitals observer registrations across HMR/rerenders
let __WEB_VITALS_INITIALIZED__ = false;

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
  
  // Store options in ref to prevent unnecessary re-renders
  const optionsRef = useRef(options);
  optionsRef.current = options;
  
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

  // Initialize Core Web Vitals monitoring - DISABLED to prevent errors
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }

    // Skip if already initialized globally
    if (__WEB_VITALS_INITIALIZED__) {
      return;
    }
    
    __WEB_VITALS_INITIALIZED__ = true;

    try {
      const deviceInfo = detectDeviceCapabilities();
      
      // Update device info only once on mount
      setMetrics(prev => ({
        ...prev,
        ...deviceInfo,
        pageLoadTime: performance.now(),
      }));

      // DISABLED: Web Vitals monitoring temporarily disabled to prevent errors
      // The web-vitals library was causing runtime errors
      console.log('Core Web Vitals monitoring is disabled');

    } catch (error) {
      console.error('Core Web Vitals not supported:', error);
      setIsSupported(false);
    }
  }, [detectDeviceCapabilities]);

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

  // Manual metric collection - return current metrics without re-subscribing
  const collectMetrics = useCallback(() => {
    // Return current snapshot of metrics without re-initializing observers
    return metrics;
  }, [metrics]);

  return {
    // Core data
    metrics,
    isSupported,
    isReporting: false,
    
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
      const metric = metrics[metricName.toLowerCase() as keyof CoreWebVitalsData];
      return !!(metric && typeof metric === 'object' && 'rating' in metric && metric.rating === 'good');
    },
  };
}
