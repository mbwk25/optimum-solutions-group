/**
 * Performance Benchmarking Suite
 * 
 * Comprehensive performance testing and benchmarking utilities for
 * automated performance regression detection and optimization tracking.
 */

import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

// ========== TYPES AND INTERFACES ==========

export interface PerformanceBenchmark {
  id: string;
  name: string;
  url: string;
  timestamp: number;
  userAgent: string;
  connection: {
    type: string;
    effectiveType: string;
    downlink?: number;
    rtt?: number;
  };
  metrics: {
    // Core Web Vitals
    cls?: number;
    fcp?: number;
    fid?: number;
    lcp?: number;
    ttfb?: number;
    
    // Custom Performance Metrics
    domContentLoaded: number;
    windowLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint?: number;
    
    // Resource Loading
    totalResourceCount: number;
    totalResourceSize: number;
    criticalResourceLoadTime: number;
    
    // JavaScript Performance
    mainThreadBlockingTime: number;
    totalJavaScriptSize: number;
    unusedJavaScriptSize?: number;
    
    // CSS Performance
    totalCSSSize: number;
    unusedCSSSize?: number;
    
    // Memory Usage
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
    
    // Bundle Analysis
    bundleSize: {
      total: number;
      gzipped: number;
      chunks: Array<{
        name: string;
        size: number;
        gzippedSize: number;
      }>;
    };
  };
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa?: number;
  };
}

export interface BenchmarkConfig {
  url: string;
  runs: number;
  throttling?: {
    cpu: number;
    network: string;
  };
  device?: string;
  disableCache?: boolean;
  collectTraces?: boolean;
}

export interface BenchmarkThresholds {
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  lcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
  performanceScore: { good: number; poor: number };
}

// ========== DEFAULT THRESHOLDS ==========

export const DEFAULT_THRESHOLDS: BenchmarkThresholds = {
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  fid: { good: 100, poor: 300 },
  lcp: { good: 2500, poor: 4000 },
  ttfb: { good: 800, poor: 1800 },
  performanceScore: { good: 90, poor: 50 }
};

// ========== PERFORMANCE BENCHMARK CLASS ==========

export class PerformanceBenchmarkSuite {
  private thresholds: BenchmarkThresholds;
  private results: PerformanceBenchmark[] = [];

  constructor(thresholds: Partial<BenchmarkThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Run a complete performance benchmark
   */
  async runBenchmark(config: BenchmarkConfig): Promise<PerformanceBenchmark> {
    const benchmarkId = this.generateBenchmarkId();
    
    console.log(`🚀 Starting performance benchmark: ${benchmarkId}`);
    
    const benchmark: PerformanceBenchmark = {
      id: benchmarkId,
      name: `Benchmark ${new Date().toISOString()}`,
      url: config.url,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      metrics: await this.collectMetrics(),
      scores: await this.calculateScores()
    };

    this.results.push(benchmark);
    return benchmark;
  }

  /**
   * Collect comprehensive performance metrics
   */
  private async collectMetrics(): Promise<PerformanceBenchmark['metrics']> {
    const metrics = {
      domContentLoaded: 0,
      windowLoaded: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      totalResourceCount: 0,
      totalResourceSize: 0,
      criticalResourceLoadTime: 0,
      mainThreadBlockingTime: 0,
      totalJavaScriptSize: 0,
      totalCSSSize: 0,
      bundleSize: {
        total: 0,
        gzipped: 0,
        chunks: [] as Array<{ name: string; size: number; gzippedSize: number }>
      }
    };

    // Collect Web Vitals
    await this.collectWebVitals(metrics);
    
    // Collect Navigation Timing
    this.collectNavigationTiming(metrics);
    
    // Collect Resource Timing
    this.collectResourceTiming(metrics);
    
    // Collect Memory Info
    this.collectMemoryInfo(metrics);
    
    // Collect Bundle Analysis
    await this.collectBundleAnalysis(metrics);

    return metrics;
  }

  /**
   * Collect Web Vitals metrics
   */
  private async collectWebVitals(metrics: any): Promise<void> {
    return new Promise((resolve) => {
      let collected = 0;
      const total = 5; // CLS, FCP, FID, LCP, TTFB

      const checkComplete = () => {
        collected++;
        if (collected === total) resolve();
      };

      getCLS((metric) => {
        metrics.cls = metric.value;
        checkComplete();
      });

      getFCP((metric) => {
        metrics.fcp = metric.value;
        checkComplete();
      });

      getFID((metric) => {
        metrics.fid = metric.value;
        checkComplete();
      });

      getLCP((metric) => {
        metrics.lcp = metric.value;
        metrics.largestContentfulPaint = metric.value;
        checkComplete();
      });

      getTTFB((metric) => {
        metrics.ttfb = metric.value;
        checkComplete();
      });

      // Fallback timeout
      setTimeout(() => resolve(), 5000);
    });
  }

  /**
   * Collect Navigation Timing metrics
   */
  private collectNavigationTiming(metrics: any): void {
    if (!performance.timing) return;

    const timing = performance.timing;
    const navigationStart = timing.navigationStart;

    metrics.domContentLoaded = timing.domContentLoadedEventEnd - navigationStart;
    metrics.windowLoaded = timing.loadEventEnd - navigationStart;
    
    // Paint Timing API
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      if (firstPaint) {
        metrics.firstPaint = firstPaint.startTime;
      }
      
      if (firstContentfulPaint) {
        metrics.firstContentfulPaint = firstContentfulPaint.startTime;
      }
    }
  }

  /**
   * Collect Resource Timing metrics
   */
  private collectResourceTiming(metrics: any): void {
    if (!performance.getEntriesByType) return;

    const resources = performance.getEntriesByType('resource');
    
    metrics.totalResourceCount = resources.length;
    metrics.totalResourceSize = resources.reduce((total, resource: any) => {
      return total + (resource.transferSize || 0);
    }, 0);

    // Calculate critical resource load time
    const criticalResources = resources.filter((resource: any) => {
      return resource.name.includes('.css') || 
             resource.name.includes('.js') ||
             resource.name.includes('font');
    });

    metrics.criticalResourceLoadTime = Math.max(
      ...criticalResources.map((resource: any) => resource.responseEnd)
    );

    // Calculate JS and CSS sizes
    metrics.totalJavaScriptSize = resources
      .filter((resource: any) => resource.name.includes('.js'))
      .reduce((total, resource: any) => total + (resource.transferSize || 0), 0);

    metrics.totalCSSSize = resources
      .filter((resource: any) => resource.name.includes('.css'))
      .reduce((total, resource: any) => total + (resource.transferSize || 0), 0);
  }

  /**
   * Collect Memory information
   */
  private collectMemoryInfo(metrics: any): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.usedJSHeapSize = memory.usedJSHeapSize;
      metrics.totalJSHeapSize = memory.totalJSHeapSize;
      metrics.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    }
  }

  /**
   * Collect Bundle Analysis data
   */
  private async collectBundleAnalysis(metrics: any): Promise<void> {
    try {
      // This would typically integrate with build tools to get actual bundle sizes
      // For now, we'll estimate based on resource timing
      const jsResources = performance.getEntriesByType('resource')
        .filter((resource: any) => resource.name.includes('.js'));

      let totalSize = 0;
      const chunks: Array<{ name: string; size: number; gzippedSize: number }> = [];

      jsResources.forEach((resource: any) => {
        const size = resource.transferSize || 0;
        totalSize += size;
        
        chunks.push({
          name: resource.name.split('/').pop() || 'unknown',
          size: resource.decodedBodySize || size,
          gzippedSize: size
        });
      });

      metrics.bundleSize = {
        total: totalSize,
        gzipped: Math.round(totalSize * 0.7), // Estimate compression ratio
        chunks
      };
    } catch (error) {
      console.warn('Bundle analysis failed:', error);
    }
  }

  /**
   * Calculate performance scores
   */
  private async calculateScores(): Promise<PerformanceBenchmark['scores']> {
    // This would typically integrate with Lighthouse or similar tools
    // For now, we'll provide a basic scoring algorithm
    
    return {
      performance: 85, // Would be calculated based on metrics
      accessibility: 95,
      bestPractices: 90,
      seo: 92,
      pwa: 80
    };
  }

  /**
   * Get connection information
   */
  private getConnectionInfo(): PerformanceBenchmark['connection'] {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      type: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink,
      rtt: connection?.rtt
    };
  }

  /**
   * Generate unique benchmark ID
   */
  private generateBenchmarkId(): string {
    return `benchmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Compare benchmarks and detect regressions
   */
  compareBenchmarks(
    baseline: PerformanceBenchmark, 
    current: PerformanceBenchmark
  ): {
    regressions: Array<{ metric: string; baseline: number; current: number; change: number }>;
    improvements: Array<{ metric: string; baseline: number; current: number; change: number }>;
    summary: string;
  } {
    const regressions: any[] = [];
    const improvements: any[] = [];

    const metricsToCompare = [
      'cls', 'fcp', 'fid', 'lcp', 'ttfb', 
      'domContentLoaded', 'windowLoaded', 'totalResourceSize'
    ];

    metricsToCompare.forEach(metric => {
      const baselineValue = baseline.metrics[metric as keyof typeof baseline.metrics] as number;
      const currentValue = current.metrics[metric as keyof typeof current.metrics] as number;

      if (baselineValue && currentValue) {
        const change = ((currentValue - baselineValue) / baselineValue) * 100;
        
        if (Math.abs(change) > 5) { // Only consider significant changes (>5%)
          const entry = {
            metric,
            baseline: baselineValue,
            current: currentValue,
            change: Math.round(change * 100) / 100
          };

          if (change > 0 && this.isWorseMetric(metric)) {
            regressions.push(entry);
          } else if (change < 0 && this.isWorseMetric(metric)) {
            improvements.push(entry);
          } else if (change > 0 && !this.isWorseMetric(metric)) {
            improvements.push(entry);
          } else if (change < 0 && !this.isWorseMetric(metric)) {
            regressions.push(entry);
          }
        }
      }
    });

    const summary = this.generateComparisonSummary(regressions, improvements);

    return { regressions, improvements, summary };
  }

  /**
   * Determine if higher values indicate worse performance
   */
  private isWorseMetric(metric: string): boolean {
    const worseWhenHigher = [
      'cls', 'fcp', 'fid', 'lcp', 'ttfb',
      'domContentLoaded', 'windowLoaded', 'totalResourceSize',
      'mainThreadBlockingTime'
    ];
    
    return worseWhenHigher.includes(metric);
  }

  /**
   * Generate summary of comparison results
   */
  private generateComparisonSummary(regressions: any[], improvements: any[]): string {
    if (regressions.length === 0 && improvements.length === 0) {
      return 'No significant performance changes detected.';
    }

    let summary = '';
    
    if (regressions.length > 0) {
      summary += `⚠️ ${regressions.length} performance regression${regressions.length > 1 ? 's' : ''} detected. `;
    }
    
    if (improvements.length > 0) {
      summary += `✅ ${improvements.length} performance improvement${improvements.length > 1 ? 's' : ''} detected.`;
    }

    return summary;
  }

  /**
   * Export benchmark results
   */
  exportResults(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.results, null, 2);
    }

    // CSV export
    if (this.results.length === 0) return '';

    const headers = [
      'id', 'timestamp', 'url', 'cls', 'fcp', 'fid', 'lcp', 'ttfb',
      'domContentLoaded', 'windowLoaded', 'totalResourceSize', 'performanceScore'
    ];

    const rows = this.results.map(result => [
      result.id,
      result.timestamp,
      result.url,
      result.metrics.cls || 0,
      result.metrics.fcp || 0,
      result.metrics.fid || 0,
      result.metrics.lcp || 0,
      result.metrics.ttfb || 0,
      result.metrics.domContentLoaded,
      result.metrics.windowLoaded,
      result.metrics.totalResourceSize,
      result.scores.performance
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Get all benchmark results
   */
  getResults(): PerformanceBenchmark[] {
    return [...this.results];
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Get performance trend analysis
   */
  getTrendAnalysis(): {
    trends: Record<string, 'improving' | 'degrading' | 'stable'>;
    recommendations: string[];
  } {
    if (this.results.length < 2) {
      return {
        trends: {},
        recommendations: ['Not enough data for trend analysis. Run more benchmarks.']
      };
    }

    const recentResults = this.results.slice(-5); // Last 5 results
    const trends: Record<string, 'improving' | 'degrading' | 'stable'> = {};
    const recommendations: string[] = [];

    const metrics = ['cls', 'fcp', 'fid', 'lcp', 'ttfb'];

    metrics.forEach(metric => {
      const values = recentResults.map(r => r.metrics[metric as keyof typeof r.metrics] as number).filter(v => v != null);
      
      if (values.length > 1) {
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const change = ((lastValue - firstValue) / firstValue) * 100;

        if (Math.abs(change) < 5) {
          trends[metric] = 'stable';
        } else if ((change > 0 && this.isWorseMetric(metric)) || (change < 0 && !this.isWorseMetric(metric))) {
          trends[metric] = 'degrading';
          recommendations.push(`${metric.toUpperCase()} is degrading. Consider optimization strategies.`);
        } else {
          trends[metric] = 'improving';
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Performance metrics are stable or improving. Keep up the good work!');
    }

    return { trends, recommendations };
  }
}

// ========== AUTOMATED TESTING UTILITIES ==========

export class AutomatedPerformanceTesting {
  private benchmarkSuite: PerformanceBenchmarkSuite;
  private testSchedule: NodeJS.Timeout | null = null;

  constructor(thresholds?: Partial<BenchmarkThresholds>) {
    this.benchmarkSuite = new PerformanceBenchmarkSuite(thresholds);
  }

  /**
   * Schedule regular performance tests
   */
  scheduleTests(config: BenchmarkConfig, intervalMs: number = 3600000): void { // Default: 1 hour
    if (this.testSchedule) {
      clearInterval(this.testSchedule);
    }

    this.testSchedule = setInterval(async () => {
      try {
        console.log('🔄 Running scheduled performance test...');
        const result = await this.benchmarkSuite.runBenchmark(config);
        
        // Check for regressions
        const results = this.benchmarkSuite.getResults();
        if (results.length > 1) {
          const comparison = this.benchmarkSuite.compareBenchmarks(
            results[results.length - 2],
            results[results.length - 1]
          );
          
          if (comparison.regressions.length > 0) {
            console.warn('⚠️ Performance regressions detected!', comparison.regressions);
            this.onRegressionDetected(comparison);
          }
        }
      } catch (error) {
        console.error('Performance test failed:', error);
      }
    }, intervalMs);

    console.log(`📅 Performance tests scheduled every ${intervalMs / 1000} seconds`);
  }

  /**
   * Stop scheduled tests
   */
  stopScheduledTests(): void {
    if (this.testSchedule) {
      clearInterval(this.testSchedule);
      this.testSchedule = null;
      console.log('🛑 Scheduled performance tests stopped');
    }
  }

  /**
   * Handle regression detection
   */
  private onRegressionDetected(comparison: any): void {
    // This could trigger alerts, notifications, or CI/CD failures
    console.group('🚨 Performance Regression Alert');
    console.log('Summary:', comparison.summary);
    console.log('Regressions:', comparison.regressions);
    console.groupEnd();

    // In a real implementation, this might:
    // - Send notifications to developers
    // - Create GitHub issues
    // - Update monitoring dashboards
    // - Trigger rollback procedures
  }

  /**
   * Get benchmark suite instance
   */
  getBenchmarkSuite(): PerformanceBenchmarkSuite {
    return this.benchmarkSuite;
  }
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Quick performance snapshot
 */
export const getPerformanceSnapshot = (): Promise<Partial<PerformanceBenchmark['metrics']>> => {
  return new Promise((resolve) => {
    const snapshot: any = {};
    
    // Get basic timing info
    if (performance.timing) {
      const timing = performance.timing;
      const navigationStart = timing.navigationStart;
      
      snapshot.domContentLoaded = timing.domContentLoadedEventEnd - navigationStart;
      snapshot.windowLoaded = timing.loadEventEnd - navigationStart;
    }

    // Get memory info
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      snapshot.usedJSHeapSize = memory.usedJSHeapSize;
      snapshot.totalJSHeapSize = memory.totalJSHeapSize;
    }

    resolve(snapshot);
  });
};

/**
 * Monitor Core Web Vitals in real-time
 */
export const monitorCoreWebVitals = (callback: (metric: string, value: number) => void): void => {
  getCLS((metric) => callback('CLS', metric.value));
  getFCP((metric) => callback('FCP', metric.value));
  getFID((metric) => callback('FID', metric.value));
  getLCP((metric) => callback('LCP', metric.value));
  getTTFB((metric) => callback('TTFB', metric.value));
};
