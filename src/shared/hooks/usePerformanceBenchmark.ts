import { useState, useCallback } from 'react';

export interface PerformanceSnapshot {
  domContentLoaded: number;
  windowLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  cls?: number;
  fcp?: number;
  fid?: number | null;
  lcp?: number;
  ttfb?: number;
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

export interface ComparisonEntry {
  metric: string;
  baseline: number;
  current: number;
  change: number;
}

export interface ComparisonResult {
  regressions: ComparisonEntry[];
  improvements: ComparisonEntry[];
  summary: string;
}

export const usePerformanceBenchmark = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PerformanceSnapshot[]>([]);
  const [currentSnapshot, setCurrentSnapshot] = useState<PerformanceSnapshot | null>(null);

  const startBenchmarking = useCallback(() => {
    setIsRunning(true);
    
    // Simple performance snapshot
    const snapshot: PerformanceSnapshot = {
      domContentLoaded: performance.now(),
      windowLoaded: performance.now(), 
      firstPaint: performance.now(),
      firstContentfulPaint: performance.now(),
    };
    
    setCurrentSnapshot(snapshot);
    setResults(prev => [...prev, snapshot]);
    setIsRunning(false);
    
    return snapshot;
  }, []);

  const compareBenchmarks = useCallback((baseline: PerformanceSnapshot, current: PerformanceSnapshot): ComparisonResult => {
    const regressions: ComparisonEntry[] = [];
    const improvements: ComparisonEntry[] = [];
    
    // Simple comparison logic
    if (current.domContentLoaded > baseline.domContentLoaded) {
      regressions.push({
        metric: 'domContentLoaded',
        baseline: baseline.domContentLoaded,
        current: current.domContentLoaded,
        change: current.domContentLoaded - baseline.domContentLoaded
      });
    }
    
    return {
      regressions,
      improvements,
      summary: `Found ${regressions.length} regressions and ${improvements.length} improvements`
    };
  }, []);

  return {
    isRunning,
    results,
    currentSnapshot,
    startBenchmarking,
    compareBenchmarks,
    exportResults: () => 'No data',
    getTrendAnalysis: () => ({ trends: {}, recommendations: [] }),
    hasResults: results.length > 0,
    latestResult: results[results.length - 1] || null,
    comparison: null,
    regressions: []
  };
};

// Missing hooks - add simple stub implementations
export const useAutomatedPerformanceTesting = () => ({
  isScheduled: false,
  testResults: [],
  lastRegressionAlert: null,
  startScheduledTesting: () => {},
  stopScheduledTesting: () => {},
  getBenchmarkSuite: () => null,
  hasRegressions: false,
  hasImprovements: false
});

export const useCoreWebVitalsMonitor = () => ({
  vitals: {},
  isMonitoring: false,
  startMonitoring: () => {},
  stopMonitoring: () => {},
  getVitalStatus: () => 'unknown',
  overallScore: 0,
  hasAllVitals: false
});

export const usePerformanceRegressionDetector = () => ({
  baseline: null,
  regressions: [],
  improvements: [],
  setNewBaseline: () => {},
  compareWithBaseline: () => null,
  clearDetection: () => {},
  hasBaseline: false,
  hasRegressions: false,
  hasImprovements: false,
  regressionCount: 0,
  improvementCount: 0
});

export const usePerformanceMetrics = () => ({
  metrics: null,
  isCollecting: false,
  collectMetrics: () => Promise.resolve(null),
  hasMetrics: false
});