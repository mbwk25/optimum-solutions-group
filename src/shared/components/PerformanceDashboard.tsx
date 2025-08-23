import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';
import {
  usePerformanceBenchmark,
  useAutomatedPerformanceTesting,
  useCoreWebVitalsMonitor,
  usePerformanceRegressionDetector
} from '@/shared/hooks/usePerformanceBenchmark';
import { BenchmarkConfig, PerformanceBenchmark } from '@/shared/utils/performanceBenchmark';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Download,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

// ========== TYPES ==========

interface ComparisonEntry {
  metric: string;
  baseline: number;
  current: number;
  change: number;
}

interface WebVitalsData {
  lcp?: number;
  fcp?: number;
  cls?: number;
  fid?: number;
  ttfb?: number;
}

interface PerformanceSnapshot {
  domContentLoaded: number;
  windowLoaded: number;
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
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

interface RegressionAlert {
  summary: string;
  regressions: ComparisonEntry[];
  improvements: ComparisonEntry[];
}

interface PerformanceDashboardProps {
  showAutomatedTesting?: boolean;
  showRegressionDetection?: boolean;
  defaultConfig?: Partial<BenchmarkConfig>;
  onRegressionAlert?: (regressions: ComparisonEntry[]) => void;
}

// ========== MAIN COMPONENT ==========

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  showAutomatedTesting = true,
  showRegressionDetection = true,
  defaultConfig = {},
  onRegressionAlert
}) => {
  const [benchmarkConfig, setBenchmarkConfig] = useState<BenchmarkConfig>({
    url: window.location.href,
    runs: 3,
    ...defaultConfig
  });

  // Hooks
  const benchmark = usePerformanceBenchmark({ autoStart: false });
  const webVitals = useCoreWebVitalsMonitor();
  const automatedTesting = useAutomatedPerformanceTesting({
    onRegressionDetected: onRegressionAlert
  });
  const regressionDetector = usePerformanceRegressionDetector({
    onRegressionDetected: onRegressionAlert
  });

  // Handle running a benchmark
  const handleRunBenchmark = useCallback(async () => {
    await benchmark.startBenchmarking(benchmarkConfig);
    
    // Update regression detector with latest result
    if (benchmark.latestResult && showRegressionDetection) {
      regressionDetector.compareWithBaseline(benchmark.latestResult);
    }
  }, [benchmarkConfig, benchmark, regressionDetector, showRegressionDetection]);

  // Handle starting automated testing
  const handleStartAutomatedTesting = useCallback(() => {
    automatedTesting.startScheduledTesting(benchmarkConfig);
  }, [automatedTesting, benchmarkConfig]);

  return (
    <div className="performance-dashboard space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and benchmark your application's performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRunBenchmark} 
            disabled={benchmark.isRunning}
          >
            {benchmark.isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Benchmark
              </>
            )}
          </Button>
          
          {benchmark.hasResults && (
            <Button 
              variant="outline"
              onClick={() => {
                const data = benchmark.exportResults('json');
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `performance-benchmark-${Date.now()}.json`;
                a.click();
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Core Web Vitals Overview */}
      <WebVitalsOverview vitals={webVitals.vitals} getVitalStatus={webVitals.getVitalStatus} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current Metrics</TabsTrigger>
          <TabsTrigger value="history">Benchmark History</TabsTrigger>
          {showAutomatedTesting && <TabsTrigger value="automated">Automated Testing</TabsTrigger>}
          {showRegressionDetection && <TabsTrigger value="regressions">Regression Analysis</TabsTrigger>}
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <CurrentMetricsTab 
            snapshot={benchmark.currentSnapshot}
            latestResult={benchmark.latestResult}
            isRunning={benchmark.isRunning}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <BenchmarkHistoryTab 
            results={benchmark.results}
            onCompare={(baseline, current) => benchmark.compareBenchmarks(baseline, current)}
            getTrendAnalysis={benchmark.getTrendAnalysis}
          />
        </TabsContent>

        {showAutomatedTesting && (
          <TabsContent value="automated" className="space-y-4">
            <AutomatedTestingTab 
              isScheduled={automatedTesting.isScheduled}
              testResults={automatedTesting.testResults}
              onStart={handleStartAutomatedTesting}
              onStop={automatedTesting.stopScheduledTesting}
              lastRegressionAlert={automatedTesting.lastRegressionAlert}
            />
          </TabsContent>
        )}

        {showRegressionDetection && (
          <TabsContent value="regressions" className="space-y-4">
            <RegressionAnalysisTab 
              baseline={regressionDetector.baseline}
              regressions={regressionDetector.regressions}
              improvements={regressionDetector.improvements}
              onSetBaseline={regressionDetector.setNewBaseline}
              hasResults={benchmark.hasResults}
              latestResult={benchmark.latestResult}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// ========== SUB-COMPONENTS ==========

const WebVitalsOverview: React.FC<{
  vitals: WebVitalsData;
  getVitalStatus: (vital: string) => string;
}> = ({ vitals, getVitalStatus }) => {
  const vitalMetrics = [
    { key: 'lcp', label: 'LCP', description: 'Largest Contentful Paint' },
    { key: 'fid', label: 'FID', description: 'First Input Delay' },
    { key: 'cls', label: 'CLS', description: 'Cumulative Layout Shift' },
    { key: 'fcp', label: 'FCP', description: 'First Contentful Paint' },
    { key: 'ttfb', label: 'TTFB', description: 'Time to First Byte' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {vitalMetrics.map(({ key, label, description }) => {
        const value = vitals[key];
        const status = getVitalStatus(key);
        
        return (
          <Card key={key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <VitalStatusBadge status={status} />
              </div>
              <CardDescription className="text-xs">{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {value ? formatMetricValue(key, value) : '-'}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const VitalStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    good: { variant: 'default' as const, color: 'text-green-600', icon: CheckCircle },
    'needs-improvement': { variant: 'secondary' as const, color: 'text-yellow-600', icon: AlertTriangle },
    poor: { variant: 'destructive' as const, color: 'text-red-600', icon: AlertTriangle },
    unknown: { variant: 'outline' as const, color: 'text-gray-600', icon: Activity }
  };

  const { variant, color, icon: Icon } = config[status as keyof typeof config] || config.unknown;

  return (
    <Badge variant={variant} className="text-xs">
      <Icon className={`w-3 h-3 mr-1 ${color}`} />
      {status.replace('-', ' ')}
    </Badge>
  );
};

const CurrentMetricsTab: React.FC<{
  snapshot: PerformanceSnapshot | null;
  latestResult: PerformanceBenchmark | null;
  isRunning: boolean;
}> = ({ snapshot, latestResult, isRunning }) => {
  if (isRunning) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Running performance benchmark...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestResult && !snapshot) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p>No performance data available. Run a benchmark to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Performance Scores */}
      {latestResult && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Scores</CardTitle>
            <CardDescription>Latest benchmark results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Performance</span>
                <span className="font-mono">{latestResult.scores.performance}</span>
              </div>
              <Progress value={latestResult.scores.performance} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Accessibility</span>
                <span className="font-mono">{latestResult.scores.accessibility}</span>
              </div>
              <Progress value={latestResult.scores.accessibility} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Best Practices</span>
                <span className="font-mono">{latestResult.scores.bestPractices}</span>
              </div>
              <Progress value={latestResult.scores.bestPractices} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Metrics */}
      {snapshot && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Metrics</CardTitle>
            <CardDescription>Current page resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>DOM Content Loaded</span>
              <span className="font-mono">{formatDuration(snapshot.domContentLoaded)}</span>
            </div>
            <div className="flex justify-between">
              <span>Window Loaded</span>
              <span className="font-mono">{formatDuration(snapshot.windowLoaded)}</span>
            </div>
            {snapshot.usedJSHeapSize && (
              <div className="flex justify-between">
                <span>JS Heap Used</span>
                <span className="font-mono">{formatBytes(snapshot.usedJSHeapSize)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const BenchmarkHistoryTab: React.FC<{
  results: PerformanceBenchmark[];
  onCompare: (baseline: PerformanceBenchmark, current: PerformanceBenchmark) => ComparisonResult;
  getTrendAnalysis: () => TrendAnalysis;
}> = ({ results, onCompare, getTrendAnalysis }) => {
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  const handleCompare = useCallback(() => {
    if (selectedResults.length === 2) {
      const baseline = results.find(r => r.id === selectedResults[0]);
      const current = results.find(r => r.id === selectedResults[1]);
      
      if (baseline && current) {
        const comparisonResult = onCompare(baseline, current);
        setComparison(comparisonResult);
      }
    }
  }, [selectedResults, results, onCompare]);

  const trendAnalysis = getTrendAnalysis();

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p>No benchmark history available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trend Analysis */}
      {Object.keys(trendAnalysis.trends).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
            <CardDescription>Performance trends over recent benchmarks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              {Object.entries(trendAnalysis.trends).map(([metric, trend]) => (
                <div key={metric} className="text-center">
                  <div className="font-medium text-sm uppercase tracking-wide">{metric}</div>
                  <div className="flex items-center justify-center mt-1">
                    {trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {trend === 'degrading' && <TrendingDown className="h-4 w-4 text-red-600" />}
                    {trend === 'stable' && <Activity className="h-4 w-4 text-blue-600" />}
                    <span className="ml-1 text-xs capitalize">{trend}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {trendAnalysis.recommendations.map((rec: string, index: number) => (
                <p key={index} className="text-sm text-muted-foreground">• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benchmark List */}
      <Card>
        <CardHeader>
          <CardTitle>Benchmark History</CardTitle>
          <CardDescription>
            Select two benchmarks to compare (selected: {selectedResults.length}/2)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results.slice().reverse().map((result) => (
              <div
                key={result.id}
                className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                  selectedResults.includes(result.id)
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  if (selectedResults.includes(result.id)) {
                    setSelectedResults(prev => prev.filter(id => id !== result.id));
                  } else if (selectedResults.length < 2) {
                    setSelectedResults(prev => [...prev, result.id]);
                  }
                }}
              >
                <div>
                  <div className="font-medium">{new Date(result.timestamp).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{result.url}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Score: {result.scores.performance}</div>
                  <div className="text-xs text-muted-foreground">
                    LCP: {formatMetricValue('lcp', result.metrics.lcp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedResults.length === 2 && (
            <div className="mt-4 pt-4 border-t">
              <Button onClick={handleCompare} className="w-full">
                Compare Selected Benchmarks
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
            <CardDescription>{comparison.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparison.regressions.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">Regressions</h4>
                <div className="space-y-1">
                  {comparison.regressions.map((reg: ComparisonEntry, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="font-mono">{reg.metric}:</span> {reg.change}% worse
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {comparison.improvements.length > 0 && (
              <div>
                <h4 className="font-medium text-green-600 mb-2">Improvements</h4>
                <div className="space-y-1">
                  {comparison.improvements.map((imp: ComparisonEntry, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="font-mono">{imp.metric}:</span> {Math.abs(imp.change)}% better
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AutomatedTestingTab: React.FC<{
  isScheduled: boolean;
  testResults: PerformanceBenchmark[];
  onStart: () => void;
  onStop: () => void;
  lastRegressionAlert: RegressionAlert | null;
}> = ({ isScheduled, testResults, onStart, onStop, lastRegressionAlert }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automated Performance Testing</CardTitle>
          <CardDescription>
            Schedule regular performance tests to detect regressions automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Status: {isScheduled ? 'Running' : 'Stopped'}
              </p>
              <p className="text-sm text-muted-foreground">
                Tests run every hour when enabled
              </p>
            </div>
            <Button
              onClick={isScheduled ? onStop : onStart}
              variant={isScheduled ? "destructive" : "default"}
            >
              {isScheduled ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Testing
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Testing
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{testResults.length}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {lastRegressionAlert?.regressions?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Regressions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {lastRegressionAlert?.improvements?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Improvements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {lastRegressionAlert && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
              Last Regression Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{lastRegressionAlert.summary}</p>
            
            {lastRegressionAlert.regressions?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Detected Regressions:</h4>
                <div className="space-y-1">
                  {lastRegressionAlert.regressions.map((reg: ComparisonEntry, index: number) => (
                    <div key={index} className="text-sm text-red-600">
                      • {reg.metric}: {reg.change}% worse
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const RegressionAnalysisTab: React.FC<{
  baseline: PerformanceBenchmark | null;
  regressions: ComparisonEntry[];
  improvements: ComparisonEntry[];
  onSetBaseline: (benchmark: PerformanceBenchmark) => void;
  hasResults: boolean;
  latestResult: PerformanceBenchmark | null;
}> = ({ baseline, regressions, improvements, onSetBaseline, hasResults, latestResult }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Regression Detection</CardTitle>
          <CardDescription>
            Set a performance baseline and detect regressions automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Baseline: {baseline ? new Date(baseline.timestamp).toLocaleString() : 'None set'}
              </p>
              <p className="text-sm text-muted-foreground">
                Use the latest benchmark result as baseline
              </p>
            </div>
            <Button
              onClick={() => latestResult && onSetBaseline(latestResult)}
              disabled={!latestResult}
            >
              Set Baseline
            </Button>
          </div>
        </CardContent>
      </Card>

      {(regressions.length > 0 || improvements.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regressions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Performance Regressions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {regressions.map((reg, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-mono text-sm">{reg.metric.toUpperCase()}</span>
                      <Badge variant="destructive">
                        +{reg.change}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Performance Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {improvements.map((imp, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-mono text-sm">{imp.metric.toUpperCase()}</span>
                      <Badge variant="default" className="bg-green-600">
                        {imp.change}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// ========== UTILITY FUNCTIONS ==========

const formatMetricValue = (metric: string, value: number): string => {
  switch (metric) {
    case 'cls':
      return value.toFixed(3);
    case 'lcp':
    case 'fcp':
    case 'fid':
    case 'ttfb':
      return `${Math.round(value)}ms`;
    default:
      return value.toString();
  }
};

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default PerformanceDashboard;
