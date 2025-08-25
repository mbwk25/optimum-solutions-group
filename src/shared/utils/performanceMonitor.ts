/**
 * Real-time Performance Monitoring System
 * Tracks Web Vitals, user interactions, and performance metrics
 * Enhanced with Core Web Vitals integration
 */

import { getCLS, getFCP, getFID, getLCP, getTTFB, onINP, Metric } from 'web-vitals';
import { useCoreWebVitals, CoreWebVitalsData, WebVitalsMetric } from '../hooks/useCoreWebVitals';

export interface PerformanceMetrics {
  // Core Web Vitals (Enhanced)
  cls: WebVitalsMetric | null; // Cumulative Layout Shift
  fcp: WebVitalsMetric | null; // First Contentful Paint
  fid: WebVitalsMetric | null; // First Input Delay
  lcp: WebVitalsMetric | null; // Largest Contentful Paint
  ttfb: WebVitalsMetric | null; // Time to First Byte
  inp: WebVitalsMetric | null; // Interaction to Next Paint
  
  // Performance Score (0-100)
  performanceScore: number;
  coreWebVitalsScore: number;
  
  // Custom Metrics
  domContentLoaded: number | null;
  windowLoad: number | null;
  firstByte: number | null;
  
  // Navigation Timing
  navigationStart: number | null;
  loadComplete: number | null;
  
  // Memory Information
  memoryUsage: number | null;
  jsHeapSize: number | null;
  deviceMemory: number | null;
  isLowEndDevice: boolean;
  
  // Connection Information
  connectionType: string | null;
  downlink: number | null;
  rtt: number | null;
  effectiveType: string | null;
}

export interface UserInteractionMetrics {
  clickCount: number;
  scrollDistance: number;
  timeOnPage: number;
  bounceRate: boolean;
  engagementScore: number;
}

export interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    cls: null,
    fcp: null,
    fid: null,
    lcp: null,
    ttfb: null,
    inp: null,
    performanceScore: 0,
    coreWebVitalsScore: 0,
    domContentLoaded: null,
    windowLoad: null,
    firstByte: null,
    navigationStart: null,
    loadComplete: null,
    memoryUsage: null,
    jsHeapSize: null,
    deviceMemory: null,
    isLowEndDevice: false,
    connectionType: null,
    downlink: null,
    rtt: null,
    effectiveType: null,
  };

  private userMetrics: UserInteractionMetrics = {
    clickCount: 0,
    scrollDistance: 0,
    timeOnPage: 0,
    bounceRate: false,
    engagementScore: 0,
  };

  private alerts: PerformanceAlert[] = [];
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();
  private startTime: number = Date.now();
  private isMonitoring: boolean = false;

  // Performance thresholds (Core Web Vitals)
  private thresholds = {
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    fid: { good: 100, poor: 300 },
    lcp: { good: 2500, poor: 4000 },
    ttfb: { good: 800, poor: 1800 },
    inp: { good: 200, poor: 500 },
  };

  private coreWebVitalsMonitor: ReturnType<typeof useCoreWebVitals> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startTime = Date.now();
    
    // Initialize Web Vitals monitoring
    this.initializeWebVitals();
    
    // Initialize custom metrics
    this.initializeCustomMetrics();
    
    // Initialize user interaction tracking
    this.initializeUserTracking();
    
    // Set up periodic reporting
    this.startPeriodicReporting();
    
    console.log('[Performance Monitor] Monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('[Performance Monitor] Monitoring stopped');
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get user interaction metrics
   */
  getUserMetrics(): UserInteractionMetrics {
    return { ...this.userMetrics };
  }

  /**
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Clear performance alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Subscribe to metric updates
   */
  subscribe(observer: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  /**
   * Log performance report
   */
  logReport(): void {
    if (import.meta.env.MODE !== 'development') return;

    console.group('📊 Performance Report');
    
    // Core Web Vitals
    console.group('🎯 Core Web Vitals');
    this.logEnhancedMetric('CLS (Cumulative Layout Shift)', this.metrics.cls);
    this.logEnhancedMetric('FCP (First Contentful Paint)', this.metrics.fcp, 'ms');
    this.logEnhancedMetric('FID (First Input Delay)', this.metrics.fid, 'ms');
    this.logEnhancedMetric('LCP (Largest Contentful Paint)', this.metrics.lcp, 'ms');
    this.logEnhancedMetric('TTFB (Time to First Byte)', this.metrics.ttfb, 'ms');
    this.logEnhancedMetric('INP (Interaction to Next Paint)', this.metrics.inp, 'ms');
    console.log(`📊 Performance Score: ${this.metrics.performanceScore}/100`);
    console.log(`🎯 Core Web Vitals Score: ${this.metrics.coreWebVitalsScore}/100`);
    console.groupEnd();

    // Custom Metrics
    console.group('📈 Custom Metrics');
    console.log(`DOM Content Loaded: ${this.metrics.domContentLoaded}ms`);
    console.log(`Window Load: ${this.metrics.windowLoad}ms`);
    console.log(`Memory Usage: ${this.formatBytes(this.metrics.jsHeapSize)}`);
    console.log(`Connection: ${this.metrics.connectionType} (${this.metrics.downlink}Mbps, RTT: ${this.metrics.rtt}ms)`);
    console.groupEnd();

    // User Metrics
    console.group('👤 User Interaction');
    console.log(`Time on Page: ${Math.round(this.userMetrics.timeOnPage / 1000)}s`);
    console.log(`Clicks: ${this.userMetrics.clickCount}`);
    console.log(`Scroll Distance: ${Math.round(this.userMetrics.scrollDistance)}px`);
    console.log(`Engagement Score: ${this.userMetrics.engagementScore.toFixed(2)}`);
    console.groupEnd();

    // Performance Alerts
    if (this.alerts.length > 0) {
      console.group('⚠️ Performance Alerts');
      this.alerts.forEach(alert => {
        console.warn(`${alert.type.toUpperCase()}: ${alert.message}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Send metrics to analytics service
   */
  sendToAnalytics(metrics: PerformanceMetrics): void {
    // Integration point for analytics services (Google Analytics, etc.)
    if (typeof window !== 'undefined' && (window as Record<string, unknown>).gtag) {
      // Send Core Web Vitals to Google Analytics
      Object.entries(metrics).forEach(([key, value]) => {
        if (value !== null && typeof value === 'number') {
          (window as Record<string, unknown>).gtag('event', 'web_vital', {
            name: key.toUpperCase(),
            value: Math.round(value),
            event_category: 'Web Vitals',
          });
        }
      });
    }

    // Custom analytics endpoint
    if (import.meta.env.MODE === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      }).catch(error => {
        console.warn('[Performance Monitor] Failed to send analytics:', error);
      });
    }
  }

  private initializeMonitoring(): void {
    // Wait for page load before starting
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.startMonitoring();
      });
    } else {
      this.startMonitoring();
    }
  }

  private initializeWebVitals(): void {
    // Enhanced Core Web Vitals tracking with detailed metrics
    getCLS(this.handleWebVitalMetric.bind(this, 'cls'));
    getFCP(this.handleWebVitalMetric.bind(this, 'fcp'));
    getFID(this.handleWebVitalMetric.bind(this, 'fid'));
    getLCP(this.handleWebVitalMetric.bind(this, 'lcp'));
    getTTFB(this.handleWebVitalMetric.bind(this, 'ttfb'));
    
    // Include INP if supported
    try {
      onINP(this.handleWebVitalMetric.bind(this, 'inp'));
    } catch (error) {
      console.warn('[Performance Monitor] INP metric not supported:', error);
    }
  }

  private initializeCustomMetrics(): void {
    // Navigation Timing API
    if (performance.timing) {
      const timing = performance.timing;
      this.metrics.navigationStart = timing.navigationStart;
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.metrics.windowLoad = timing.loadEventEnd - timing.navigationStart;
      this.metrics.firstByte = timing.responseStart - timing.navigationStart;
    }

    // Memory API
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.jsHeapSize = memory.usedJSHeapSize;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
    }

    // Device Memory API
    if ('deviceMemory' in navigator) {
      this.metrics.deviceMemory = (navigator as any).deviceMemory || 4;
      this.metrics.isLowEndDevice = this.metrics.deviceMemory <= 1;
    }

    // Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.connectionType = connection?.type || 'unknown';
      this.metrics.effectiveType = connection?.effectiveType || 'unknown';
      this.metrics.downlink = connection?.downlink || 0;
      this.metrics.rtt = connection?.rtt || 0;
      
      // Update low-end device detection based on connection
      if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
        this.metrics.isLowEndDevice = true;
      }
    }
  }

  private initializeUserTracking(): void {
    // Click tracking - throttled
    let clickThrottle = false;
    document.addEventListener('click', () => {
      if (!clickThrottle) {
        this.userMetrics.clickCount++;
        this.updateEngagementScore();
        clickThrottle = true;
        setTimeout(() => { clickThrottle = false; }, 100);
      }
    });

    // Scroll tracking - throttled
    let maxScrollY = 0;
    let scrollThrottle = false;
    document.addEventListener('scroll', () => {
      if (!scrollThrottle) {
        maxScrollY = Math.max(maxScrollY, window.scrollY);
        this.userMetrics.scrollDistance = maxScrollY;
        this.updateEngagementScore();
        scrollThrottle = true;
        setTimeout(() => { scrollThrottle = false; }, 250);
      }
    });

    // Time tracking - less frequent updates
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.userMetrics.timeOnPage = Date.now() - this.startTime;
      }
    }, 5000); // Reduced from 1 second to 5 seconds

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.userMetrics.bounceRate = this.userMetrics.timeOnPage < 30000; // Less than 30 seconds
      }
    });
  }

  private handleWebVitalMetric(metricName: keyof PerformanceMetrics, metric: Metric): void {
    // Convert to enhanced WebVitalsMetric format
    const thresholds = this.thresholds[metricName as keyof typeof this.thresholds];
    let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
    
    if (thresholds) {
      if (metric.value > thresholds.poor) {
        rating = 'poor';
      } else if (metric.value > thresholds.good) {
        rating = 'needs-improvement';
      }
    }

    const enhancedMetric: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      rating,
      navigationType: (metric.navigationType as any) || 'navigate',
      timestamp: Date.now(),
      entries: metric.entries,
    };

    this.metrics[metricName] = enhancedMetric;
    
    // Update performance scores
    this.updatePerformanceScores();
    
    // Check for performance issues
    this.checkThresholds(metricName, metric.value);
    
    // Notify observers
    this.notifyObservers();
    
    // Log in development
    if (import.meta.env.MODE === 'development') {
      console.log(`[Performance Monitor] ${metricName.toUpperCase()}: ${metric.value} (${rating})`);
    }
  }

  private checkThresholds(metricName: string, value: number): void {
    const threshold = this.thresholds[metricName as keyof typeof this.thresholds];
    if (!threshold) return;

    if (value > threshold.poor) {
      this.addAlert('critical', metricName, value, threshold.poor, 
        `${metricName.toUpperCase()} is critically slow (${value} > ${threshold.poor})`);
    } else if (value > threshold.good) {
      this.addAlert('warning', metricName, value, threshold.good,
        `${metricName.toUpperCase()} needs improvement (${value} > ${threshold.good})`);
    }
  }

  private addAlert(type: 'warning' | 'critical', metric: string, value: number, threshold: number, message: string): void {
    const alert: PerformanceAlert = {
      type,
      metric,
      value,
      threshold,
      message,
      timestamp: new Date(),
    };

    this.alerts.push(alert);

    // Limit alerts to prevent memory issues
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-25);
    }
  }

  private updatePerformanceScores(): void {
    const scores: number[] = [];
    const coreVitalScores: number[] = [];
    
    // Calculate scores for each metric
    ['cls', 'fcp', 'fid', 'lcp', 'ttfb', 'inp'].forEach(metricName => {
      const metric = this.metrics[metricName as keyof PerformanceMetrics] as WebVitalsMetric | null;
      if (metric && 'rating' in metric) {
        let score = 0;
        switch (metric.rating) {
          case 'good': score = 100; break;
          case 'needs-improvement': score = 50; break;
          case 'poor': score = 0; break;
        }
        scores.push(score);
        
        // Core Web Vitals are LCP, FID, CLS
        if (['lcp', 'fid', 'cls'].includes(metricName)) {
          coreVitalScores.push(score);
        }
      }
    });
    
    // Calculate overall performance score
    this.metrics.performanceScore = scores.length > 0 ? 
      Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    
    // Calculate Core Web Vitals score (Google's main metrics)
    this.metrics.coreWebVitalsScore = coreVitalScores.length > 0 ? 
      Math.round(coreVitalScores.reduce((a, b) => a + b, 0) / coreVitalScores.length) : 0;
  }

  /**
   * Get Core Web Vitals data in the format expected by the dashboard
   */
  getCoreWebVitalsData(): CoreWebVitalsData {
    return {
      lcp: this.metrics.lcp,
      fid: this.metrics.fid,
      cls: this.metrics.cls,
      fcp: this.metrics.fcp,
      ttfb: this.metrics.ttfb,
      inp: this.metrics.inp,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      connectionType: this.metrics.effectiveType || undefined,
      deviceMemory: this.metrics.deviceMemory || undefined,
      isLowEndDevice: this.metrics.isLowEndDevice,
      pageLoadTime: this.metrics.domContentLoaded || 0,
    };
  }

  /**
   * Get simplified metric values for backward compatibility
   */
  getMetricValues(): Record<string, number | null> {
    const values: Record<string, number | null> = {};
    
    Object.keys(this.metrics).forEach(key => {
      const metric = this.metrics[key as keyof PerformanceMetrics];
      if (metric && typeof metric === 'object' && 'value' in metric) {
        values[key] = metric.value;
      } else if (typeof metric === 'number') {
        values[key] = metric;
      } else {
        values[key] = null;
      }
    });
    
    return values;
  }

  private updateEngagementScore(): void {
    const timeScore = Math.min(this.userMetrics.timeOnPage / 60000, 1); // 0-1 based on time (up to 1 min)
    const clickScore = Math.min(this.userMetrics.clickCount / 10, 1); // 0-1 based on clicks (up to 10)
    const scrollScore = Math.min(this.userMetrics.scrollDistance / 1000, 1); // 0-1 based on scroll (up to 1000px)
    
    this.userMetrics.engagementScore = (timeScore + clickScore + scrollScore) / 3;
  }

  private startPeriodicReporting(): void {
    // Report every 30 seconds in development
    if (import.meta.env.MODE === 'development') {
      setInterval(() => {
        this.logReport();
      }, 30000);
    }

    // Send to analytics every 5 minutes in production
    if (import.meta.env.MODE === 'production') {
      setInterval(() => {
        this.sendToAnalytics(this.metrics);
      }, 300000);
    }
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.metrics));
  }

  private logMetric(name: string, value: number | null, threshold?: Record<string, unknown>, unit: string = ''): void {
    if (value === null) return;

    let status = '✅';
    if (threshold) {
      if (value > threshold.poor) status = '🔴';
      else if (value > threshold.good) status = '🟡';
    }

    console.log(`${status} ${name}: ${value}${unit}`);
  }

  private logEnhancedMetric(name: string, metric: WebVitalsMetric | null, unit: string = ''): void {
    if (!metric) {
      console.log(`⚪ ${name}: Not measured yet`);
      return;
    }

    const statusEmoji = {
      'good': '🟢',
      'needs-improvement': '🟡', 
      'poor': '🔴'
    }[metric.rating] || '⚪';

    console.log(`${statusEmoji} ${name}: ${metric.value}${unit} (${metric.rating.replace('-', ' ')})`);
  }

  private formatBytes(bytes: number | null): string {
    if (bytes === null) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Development-only global access
if (import.meta.env.MODE === 'development' && typeof window !== 'undefined') {
  (window as Record<string, unknown>).__performanceMonitor = performanceMonitor;
  console.log('📊 Performance monitor available at window.__performanceMonitor');
}

export default performanceMonitor;
