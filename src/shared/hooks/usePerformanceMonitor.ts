import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceMonitor, PerformanceMetrics, UserInteractionMetrics, PerformanceAlert } from '@/shared/utils/performanceMonitor';

export interface UsePerformanceMonitorOptions {
  autoStart?: boolean;
  trackUserInteractions?: boolean;
  alertThreshold?: 'good' | 'poor';
  enableReporting?: boolean;
}

export interface UsePerformanceMonitorReturn {
  metrics: PerformanceMetrics;
  userMetrics: UserInteractionMetrics;
  alerts: PerformanceAlert[];
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearAlerts: () => void;
  logReport: () => void;
  getPerformanceScore: () => number;
}

/**
 * React hook for performance monitoring
 * Provides real-time access to performance metrics and controls
 */
export const usePerformanceMonitor = (
  options: UsePerformanceMonitorOptions = {}
): UsePerformanceMonitorReturn => {
  const {
    autoStart = true,
    trackUserInteractions = true,
    alertThreshold = 'poor',
    enableReporting = import.meta.env.MODE === 'development',
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => performanceMonitor.getMetrics());
  const [userMetrics, setUserMetrics] = useState<UserInteractionMetrics>(() => performanceMonitor.getUserMetrics());
  const [alerts, setAlerts] = useState<PerformanceAlert[]>(() => performanceMonitor.getAlerts());
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const reportIntervalRef = useRef<number | null>(null);

  // Subscribe to performance metric updates
  useEffect(() => {
    const handleMetricsUpdate = (updatedMetrics: PerformanceMetrics) => {
      setMetrics(updatedMetrics);
      setUserMetrics(performanceMonitor.getUserMetrics());
      setAlerts(performanceMonitor.getAlerts());
    };

    unsubscribeRef.current = performanceMonitor.subscribe(handleMetricsUpdate);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Auto-start monitoring
  useEffect(() => {
    if (autoStart && typeof window !== 'undefined') {
      startMonitoring();
    }

    return () => {
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
    };
  }, [autoStart, startMonitoring]);

  const startMonitoring = useCallback(() => {
    performanceMonitor.startMonitoring();
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    performanceMonitor.stopMonitoring();
    setIsMonitoring(false);

    if (reportIntervalRef.current) {
      clearInterval(reportIntervalRef.current);
      reportIntervalRef.current = null;
    }
  }, []);

  const clearAlerts = useCallback(() => {
    performanceMonitor.clearAlerts();
    setAlerts([]);
  }, []);

  const logReport = useCallback(() => {
    performanceMonitor.logReport();
  }, []);

  // Calculate overall performance score (0-100)
  const getPerformanceScore = useCallback((): number => {
    const scores = {
      lcp: metrics.lcp ? Math.max(0, 100 - (metrics.lcp / 2500) * 100) : null,
      fid: metrics.fid ? Math.max(0, 100 - (metrics.fid / 100) * 100) : null,
      cls: metrics.cls ? Math.max(0, 100 - (metrics.cls / 0.1) * 100) : null,
      fcp: metrics.fcp ? Math.max(0, 100 - (metrics.fcp / 1800) * 100) : null,
      ttfb: metrics.ttfb ? Math.max(0, 100 - (metrics.ttfb / 600) * 100) : null,
    };

    const validScores = Object.values(scores).filter(score => score !== null) as number[];
    
    if (validScores.length === 0) return 0;
    
    return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length);
  }, [metrics]);

  return {
    metrics,
    userMetrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    logReport,
    getPerformanceScore,
  };
};

/**
 * Hook for tracking specific performance metrics
 */
export const useWebVitals = () => {
  const { metrics, getPerformanceScore } = usePerformanceMonitor({
    autoStart: true,
    enableReporting: false,
  });

  const webVitals = {
    lcp: metrics.lcp,
    fid: metrics.fid,
    cls: metrics.cls,
    fcp: metrics.fcp,
    ttfb: metrics.ttfb,
  };

  const vitalsStatus = {
    lcp: metrics.lcp ? (metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor') : null,
    fid: metrics.fid ? (metrics.fid <= 100 ? 'good' : metrics.fid <= 300 ? 'needs-improvement' : 'poor') : null,
    cls: metrics.cls ? (metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor') : null,
    fcp: metrics.fcp ? (metrics.fcp <= 1800 ? 'good' : metrics.fcp <= 3000 ? 'needs-improvement' : 'poor') : null,
    ttfb: metrics.ttfb ? (metrics.ttfb <= 600 ? 'good' : metrics.ttfb <= 1500 ? 'needs-improvement' : 'poor') : null,
  };

  return {
    webVitals,
    vitalsStatus,
    performanceScore: getPerformanceScore(),
    isLoading: Object.values(webVitals).every(value => value === null),
  };
};

/**
 * Hook for user interaction tracking
 */
export const useUserEngagement = () => {
  const { userMetrics } = usePerformanceMonitor({
    trackUserInteractions: true,
    enableReporting: false,
  });

  const engagementLevel = userMetrics.engagementScore >= 0.7 ? 'high' : 
                          userMetrics.engagementScore >= 0.4 ? 'medium' : 'low';

  return {
    ...userMetrics,
    engagementLevel,
    isEngaged: userMetrics.engagementScore > 0.5,
    timeOnPageFormatted: `${Math.floor(userMetrics.timeOnPage / 60000)}:${Math.floor((userMetrics.timeOnPage % 60000) / 1000).toString().padStart(2, '0')}`,
  };
};

export default usePerformanceMonitor;
