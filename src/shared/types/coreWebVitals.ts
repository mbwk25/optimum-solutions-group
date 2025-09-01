/**
 * Core Web Vitals Types and Constants
 * Separated from components to fix React Fast Refresh warnings
 */

// Core Web Vitals thresholds (Google recommended values)
export const CWV_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
  INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint
};

export interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  timestamp: number;
  entries?: PerformanceEntry[];
}

export interface CoreWebVitalsData {
  lcp: WebVitalsMetric | null;
  fid: WebVitalsMetric | null;
  cls: WebVitalsMetric | null;
  fcp: WebVitalsMetric | null;
  ttfb: WebVitalsMetric | null;
  inp: WebVitalsMetric | null;
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string | null;
  deviceMemory?: number | null;
  isLowEndDevice: boolean;
  pageLoadTime: number;
}

export interface CoreWebVitalsOptions {
  reportAllChanges?: boolean;
  enableAnalytics?: boolean;
  enableConsoleLogging?: boolean;
  threshold?: 'good' | 'needs-improvement' | 'poor';
  onMetric?: (metric: WebVitalsMetric) => void;
  onReport?: (data: CoreWebVitalsData) => void;
  analyticsEndpoint?: string;
}

export interface CoreWebVitalsContextType {
  metrics: CoreWebVitalsData;
  performanceScore: number;
  summary: {
    good: number;
    needsImprovement: number;
    poor: number;
    total: number;
    score: number;
  };
  collectMetrics: () => void;
  isSupported: boolean;
}
