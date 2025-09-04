import { useState, useEffect, useCallback } from 'react';

export interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
}

export interface UserInteractionMetrics {
  clickCount: number;
  scrollDepth: number;
  timeOnPage: number;
  engagementScore: number;
}

export interface PerformanceAlert {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
  });
  
  const [userMetrics] = useState<UserInteractionMetrics>({
    clickCount: 0,
    scrollDepth: 0,
    timeOnPage: 0,
    engagementScore: 0
  });
  
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Simulate performance data
    setTimeout(() => {
      setMetrics({
        lcp: Math.random() * 2000 + 1000,
        fid: Math.random() * 100,
        cls: Math.random() * 0.2,
        fcp: Math.random() * 1000 + 500,
        ttfb: Math.random() * 500 + 200,
      });
    }, 1000);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const logReport = useCallback(() => {
    console.log('Performance Report:', { metrics, userMetrics, alerts });
  }, [metrics, userMetrics, alerts]);

  const getPerformanceScore = useCallback((): number => {
    if (!metrics.lcp && !metrics.fid && !metrics.cls) return 0;
    
    let score = 0;
    let count = 0;
    
    if (metrics.lcp !== null) {
      score += metrics.lcp < 2500 ? 100 : metrics.lcp < 4000 ? 50 : 0;
      count++;
    }
    if (metrics.fid !== null) {
      score += metrics.fid < 100 ? 100 : metrics.fid < 300 ? 50 : 0;
      count++;
    }
    if (metrics.cls !== null) {
      score += metrics.cls < 0.1 ? 100 : metrics.cls < 0.25 ? 50 : 0;
      count++;
    }
    
    return count > 0 ? Math.round(score / count) : 0;
  }, [metrics]);

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

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

export const useWebVitals = () => {
  const { metrics, getPerformanceScore } = usePerformanceMonitor();

  return {
    webVitals: metrics,
    vitalsStatus: {
      lcp: metrics.lcp ? (metrics.lcp <= 2500 ? 'good' : 'poor') : null,
      fid: metrics.fid ? (metrics.fid <= 100 ? 'good' : 'poor') : null,
      cls: metrics.cls ? (metrics.cls <= 0.1 ? 'good' : 'poor') : null,
      fcp: metrics.fcp ? (metrics.fcp <= 1800 ? 'good' : 'poor') : null,
      ttfb: metrics.ttfb ? (metrics.ttfb <= 600 ? 'good' : 'poor') : null,
    },
    performanceScore: getPerformanceScore(),
    isLoading: Object.values(metrics).every(value => value === null),
  };
};

export default usePerformanceMonitor;