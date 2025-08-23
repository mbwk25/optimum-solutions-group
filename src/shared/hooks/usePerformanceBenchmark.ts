import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PerformanceBenchmarkSuite,
  AutomatedPerformanceTesting,
  BenchmarkConfig,
  BenchmarkThresholds,
  PerformanceBenchmark,
  getPerformanceSnapshot,
  monitorCoreWebVitals
} from '../utils/performanceBenchmark';

// ========== TYPE DEFINITIONS ==========

interface ComparisonEntry {
  metric: string;
  baseline: number;
  current: number;
  change: number;
}

interface ComparisonResult {
  regressions: ComparisonEntry[];
  improvements: ComparisonEntry[];
  summary: string;
}

interface TrendAnalysis {
  trends: Record<string, 'improving' | 'degrading' | 'stable'>;
  recommendations: string[];
}

interface PerformanceSnapshot {
  domContentLoaded: number;
  windowLoaded: number;
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

interface RegressionAlert {
  summary: string;
  regressions: ComparisonEntry[];
  improvements: ComparisonEntry[];
}

// ========== PERFORMANCE BENCHMARK HOOK ==========

interface UsePerformanceBenchmarkOptions {
  thresholds?: Partial<BenchmarkThresholds>;
  autoStart?: boolean;
  collectInterval?: number;
}

export const usePerformanceBenchmark = (options: UsePerformanceBenchmarkOptions = {}) => {
  const {
    thresholds = {},
    autoStart = false,
    collectInterval = 30000 // 30 seconds
  } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PerformanceBenchmark[]>([]);
  const [currentSnapshot, setCurrentSnapshot] = useState<PerformanceSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const benchmarkSuite = useRef<PerformanceBenchmarkSuite>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize benchmark suite
  useEffect(() => {
    benchmarkSuite.current = new PerformanceBenchmarkSuite(thresholds);
  }, [thresholds]);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && benchmarkSuite.current) {
      startBenchmarking({
        url: window.location.href,
        runs: 1
      });
    }
  }, [autoStart, startBenchmarking]);

  // Periodic snapshot collection
  useEffect(() => {
    if (collectInterval > 0) {
      intervalRef.current = setInterval(async () => {
        try {
          const snapshot = await getPerformanceSnapshot();
          setCurrentSnapshot(snapshot);
        } catch (err) {
          console.warn('Failed to collect performance snapshot:', err);
        }
      }, collectInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [collectInterval]);

  const startBenchmarking = useCallback(async (config: BenchmarkConfig) => {
    if (!benchmarkSuite.current) return;

    setIsRunning(true);
    setError(null);

    try {
      const result = await benchmarkSuite.current.runBenchmark(config);
      const allResults = benchmarkSuite.current.getResults();
      setResults([...allResults]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Benchmarking failed';
      setError(errorMessage);
      console.error('Performance benchmarking error:', err);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const compareBenchmarks = useCallback((baseline: PerformanceBenchmark, current: PerformanceBenchmark) => {
    if (!benchmarkSuite.current) return null;
    return benchmarkSuite.current.compareBenchmarks(baseline, current);
  }, []);

  const exportResults = useCallback((format: 'json' | 'csv' = 'json') => {
    if (!benchmarkSuite.current) return '';
    return benchmarkSuite.current.exportResults(format);
  }, []);

  const clearResults = useCallback(() => {
    if (benchmarkSuite.current) {
      benchmarkSuite.current.clearResults();
      setResults([]);
    }
  }, []);

  const getTrendAnalysis = useCallback(() => {
    if (!benchmarkSuite.current) return { trends: {}, recommendations: [] };
    return benchmarkSuite.current.getTrendAnalysis();
  }, []);

  return {
    // State
    isRunning,
    results,
    currentSnapshot,
    error,

    // Actions
    startBenchmarking,
    compareBenchmarks,
    exportResults,
    clearResults,
    getTrendAnalysis,

    // Computed
    hasResults: results.length > 0,
    latestResult: results[results.length - 1] || null
  };
};

// ========== AUTOMATED TESTING HOOK ==========

interface UseAutomatedPerformanceTestingOptions {
  thresholds?: Partial<BenchmarkThresholds>;
  intervalMs?: number;
  onRegressionDetected?: (comparison: ComparisonResult) => void;
}

export const useAutomatedPerformanceTesting = (
  options: UseAutomatedPerformanceTestingOptions = {}
) => {
  const {
    thresholds = {},
    intervalMs = 3600000, // 1 hour
    onRegressionDetected
  } = options;

  const [isScheduled, setIsScheduled] = useState(false);
  const [testResults, setTestResults] = useState<PerformanceBenchmark[]>([]);
  const [lastRegressionAlert, setLastRegressionAlert] = useState<RegressionAlert | null>(null);

  const automatedTesting = useRef<AutomatedPerformanceTesting>();

  // Initialize automated testing
  useEffect(() => {
    automatedTesting.current = new AutomatedPerformanceTesting(thresholds);
    
    return () => {
      if (automatedTesting.current) {
        automatedTesting.current.stopScheduledTests();
      }
    };
  }, [thresholds]);

  const startScheduledTesting = useCallback((config: BenchmarkConfig) => {
    if (!automatedTesting.current) return;

    // Custom regression handler
    // Note: Using 'any' here is necessary because we're accessing private/internal methods
    // of the AutomatedPerformanceTesting class that aren't part of its public interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalOnRegressionDetected = (automatedTesting.current as any).onRegressionDetected;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (automatedTesting.current as any).onRegressionDetected = (comparison: ComparisonResult) => {
      setLastRegressionAlert(comparison);
      if (onRegressionDetected) {
        onRegressionDetected(comparison);
      }
      originalOnRegressionDetected.call(automatedTesting.current, comparison);
    };

    automatedTesting.current.scheduleTests(config, intervalMs);
    setIsScheduled(true);

    // Update results periodically
    const updateResults = () => {
      if (automatedTesting.current) {
        const results = automatedTesting.current.getBenchmarkSuite().getResults();
        setTestResults([...results]);
      }
    };

    const updateInterval = setInterval(updateResults, 60000); // Update every minute
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [intervalMs, onRegressionDetected]);

  const stopScheduledTesting = useCallback(() => {
    if (automatedTesting.current) {
      automatedTesting.current.stopScheduledTests();
      setIsScheduled(false);
    }
  }, []);

  const getBenchmarkSuite = useCallback(() => {
    return automatedTesting.current?.getBenchmarkSuite() || null;
  }, []);

  return {
    // State
    isScheduled,
    testResults,
    lastRegressionAlert,

    // Actions
    startScheduledTesting,
    stopScheduledTesting,
    getBenchmarkSuite,

    // Computed
    hasRegressions: lastRegressionAlert?.regressions?.length > 0 || false,
    hasImprovements: lastRegressionAlert?.improvements?.length > 0 || false
  };
};

// ========== CORE WEB VITALS MONITOR HOOK ==========

interface CoreWebVitalsData {
  cls?: number;
  fcp?: number;
  fid?: number;
  lcp?: number;
  ttfb?: number;
}

export const useCoreWebVitalsMonitor = () => {
  const [vitals, setVitals] = useState<CoreWebVitalsData>({});
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    
    monitorCoreWebVitals((metric: string, value: number) => {
      setVitals(prev => ({
        ...prev,
        [metric.toLowerCase()]: value
      }));
    });
  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    // Note: Web Vitals library doesn't provide a stop method
    // The callbacks will continue to fire, but we ignore them by checking isMonitoring
  }, []);

  // Auto-start monitoring on mount
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  const getVitalStatus = useCallback((vital: keyof CoreWebVitalsData) => {
    const value = vitals[vital];
    if (!value) return 'unknown';

    // Define thresholds based on Google's recommendations
    const thresholds: Record<string, { good: number; poor: number }> = {
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      fid: { good: 100, poor: 300 },
      lcp: { good: 2500, poor: 4000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[vital];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }, [vitals]);

  return {
    // State
    vitals,
    isMonitoring,

    // Actions
    startMonitoring,
    stopMonitoring,

    // Computed
    getVitalStatus,
    overallScore: Object.keys(vitals).length,
    hasAllVitals: Object.keys(vitals).length === 5
  };
};

// ========== PERFORMANCE REGRESSION DETECTOR HOOK ==========

interface UsePerformanceRegressionDetectorOptions {
  threshold?: number; // Percentage change to consider a regression
  metrics?: string[];
  onRegressionDetected?: (regressions: ComparisonEntry[]) => void;
  onImprovementDetected?: (improvements: ComparisonEntry[]) => void;
}

export const usePerformanceRegressionDetector = (
  options: UsePerformanceRegressionDetectorOptions = {}
) => {
  const {
    threshold = 10, // 10% change
    metrics = ['lcp', 'fid', 'cls', 'fcp', 'ttfb'],
    onRegressionDetected,
    onImprovementDetected
  } = options;

  const [baseline, setBaseline] = useState<PerformanceBenchmark | null>(null);
  const [regressions, setRegressions] = useState<ComparisonEntry[]>([]);
  const [improvements, setImprovements] = useState<ComparisonEntry[]>([]);

  const benchmarkSuite = useRef<PerformanceBenchmarkSuite>(new PerformanceBenchmarkSuite());

  const setNewBaseline = useCallback((benchmark: PerformanceBenchmark) => {
    setBaseline(benchmark);
    setRegressions([]);
    setImprovements([]);
  }, []);

  const compareWithBaseline = useCallback((current: PerformanceBenchmark) => {
    if (!baseline) {
      setBaseline(current);
      return;
    }

    const comparison = benchmarkSuite.current.compareBenchmarks(baseline, current);
    
    // Filter based on specified metrics and threshold
    const filteredRegressions = comparison.regressions.filter(
      reg => metrics.includes(reg.metric) && Math.abs(reg.change) >= threshold
    );
    
    const filteredImprovements = comparison.improvements.filter(
      imp => metrics.includes(imp.metric) && Math.abs(imp.change) >= threshold
    );

    setRegressions(filteredRegressions);
    setImprovements(filteredImprovements);

    // Trigger callbacks
    if (filteredRegressions.length > 0 && onRegressionDetected) {
      onRegressionDetected(filteredRegressions);
    }

    if (filteredImprovements.length > 0 && onImprovementDetected) {
      onImprovementDetected(filteredImprovements);
    }

    return comparison;
  }, [baseline, metrics, threshold, onRegressionDetected, onImprovementDetected]);

  const clearDetection = useCallback(() => {
    setBaseline(null);
    setRegressions([]);
    setImprovements([]);
  }, []);

  return {
    // State
    baseline,
    regressions,
    improvements,

    // Actions
    setNewBaseline,
    compareWithBaseline,
    clearDetection,

    // Computed
    hasBaseline: !!baseline,
    hasRegressions: regressions.length > 0,
    hasImprovements: improvements.length > 0,
    regressionCount: regressions.length,
    improvementCount: improvements.length
  };
};

// ========== PERFORMANCE METRICS HOOK ==========

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceSnapshot | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);

  const collectMetrics = useCallback(async () => {
    setIsCollecting(true);
    
    try {
      const snapshot = await getPerformanceSnapshot();
      setMetrics(snapshot);
      return snapshot;
    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
      return null;
    } finally {
      setIsCollecting(false);
    }
  }, []);

  // Auto-collect on mount
  useEffect(() => {
    collectMetrics();
  }, [collectMetrics]);

  return {
    // State
    metrics,
    isCollecting,

    // Actions
    collectMetrics,

    // Computed
    hasMetrics: !!metrics
  };
};
