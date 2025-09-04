export interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  timestamp: number;
  entries: any[];
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
  isLowEndDevice: boolean;
  deviceMemory?: number | null;
  connectionType?: string | null;
  pageLoadTime: number;
}

export interface CoreWebVitalsOptions {
  enableAnalytics?: boolean;
  analyticsEndpoint?: string;
  enableConsoleLogging?: boolean;
  reportAllChanges?: boolean;
  onMetric?: (metric: WebVitalsMetric) => void;
  onReport?: (data: CoreWebVitalsData) => void;
}

export interface CoreWebVitalsContextType {
  metrics: CoreWebVitalsData | null;
  performanceScore: number;
  summary: {
    good: number;
    needsImprovement: number;
    poor: number;
  };
  collectMetrics: () => void;
  isSupported: boolean;
}

export const CWV_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  INP: { good: 200, needsImprovement: 500 },
};