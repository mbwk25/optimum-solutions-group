export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

export interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
}

export interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export interface PerformanceBudgetResult {
  passed: boolean;
  value: number;
  budget: number;
  metric: string;
}

export interface WebVitalsMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number;
}

export interface PerformanceBudgets {
  [key: string]: number;
}