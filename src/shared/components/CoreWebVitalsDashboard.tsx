import React, { useState, useEffect } from 'react';
import { useCoreWebVitals, WebVitalsMetric, CWV_THRESHOLDS } from '../hooks/useCoreWebVitals';

interface CoreWebVitalsDashboardProps {
  enableAnalytics?: boolean;
  analyticsEndpoint?: string;
  compact?: boolean;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

interface MetricCardProps {
  name: string;
  metric: WebVitalsMetric | null;
  unit: string;
  threshold: { good: number; needsImprovement: number };
  description: string;
  compact?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  name,
  metric,
  unit,
  threshold,
  description,
  compact = false,
}) => {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return '🟢';
      case 'needs-improvement': return '🟡';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms') {
      return `${Math.round(value)}ms`;
    }
    if (unit === 'score') {
      return value.toFixed(3);
    }
    return `${value}${unit}`;
  };

  const getThresholdText = (threshold: { good: number; needsImprovement: number }, unit: string) => {
    return `Good: <${formatValue(threshold.good, unit)}, Needs Improvement: <${formatValue(threshold.needsImprovement, unit)}`;
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-lg border ${metric ? getRatingColor(metric.rating) : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
        <span className="text-lg">{getRatingIcon(metric?.rating || 'unknown')}</span>
        <div className="flex-1">
          <div className="font-medium text-sm">{name}</div>
          <div className="text-xs opacity-75">
            {metric ? formatValue(metric.value, unit) : 'Measuring...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border-2 transition-all duration-200 ${metric ? getRatingColor(metric.rating) : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">{name}</h3>
        <span className="text-2xl">{getRatingIcon(metric?.rating || 'unknown')}</span>
      </div>
      
      <div className="mb-4">
        <div className="text-3xl font-bold mb-1">
          {metric ? formatValue(metric.value, unit) : 'Measuring...'}
        </div>
        <div className="text-sm opacity-75 mb-2">{description}</div>
        {metric && (
          <div className="text-xs">
            <div className="capitalize font-medium mb-1">Rating: {metric.rating.replace('-', ' ')}</div>
            <div className="opacity-75">{getThresholdText(threshold, unit)}</div>
          </div>
        )}
      </div>

      {metric && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Delta: {formatValue(metric.delta, unit)}</span>
            <span>ID: {metric.id.substring(0, 8)}...</span>
          </div>
          <div className="text-xs opacity-75">
            Navigation: {metric.navigationType} • Updated: {new Date(metric.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

const PerformanceGauge: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({ 
  score, 
  size = 'md' 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // green-500
    if (score >= 70) return '#F59E0B'; // yellow-500
    if (score >= 50) return '#EF4444'; // red-500
    return '#6B7280'; // gray-500
  };

  const sizes = {
    sm: { width: 80, height: 80, strokeWidth: 6 },
    md: { width: 120, height: 120, strokeWidth: 8 },
    lg: { width: 160, height: 160, strokeWidth: 10 },
  };

  const { width, height, strokeWidth } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-block">
      <svg width={width} height={height} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{score}</div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
      </div>
    </div>
  );
};

export const CoreWebVitalsDashboard: React.FC<CoreWebVitalsDashboardProps> = ({
  enableAnalytics = false,
  analyticsEndpoint,
  compact = false,
  showDetails = true,
  autoRefresh = false,
  refreshInterval = 30000,
  className = '',
}) => {
  const webVitals = useCoreWebVitals({
    enableAnalytics,
    analyticsEndpoint,
    enableConsoleLogging: false,
    reportAllChanges: autoRefresh,
  });

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isVisible, setIsVisible] = useState(true);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      webVitals.collectMetrics();
      setLastUpdate(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, webVitals]);

  // Visibility tracking for performance optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const metricConfigs = [
    {
      name: 'LCP',
      fullName: 'Largest Contentful Paint',
      metric: webVitals.metrics.lcp,
      unit: 'ms',
      threshold: CWV_THRESHOLDS.LCP,
      description: 'Time for the largest content element to become visible',
    },
    {
      name: 'FID',
      fullName: 'First Input Delay',
      metric: webVitals.metrics.fid,
      unit: 'ms',
      threshold: CWV_THRESHOLDS.FID,
      description: 'Time from first user interaction to browser response',
    },
    {
      name: 'CLS',
      fullName: 'Cumulative Layout Shift',
      metric: webVitals.metrics.cls,
      unit: 'score',
      threshold: CWV_THRESHOLDS.CLS,
      description: 'Unexpected layout shifts during page load',
    },
    {
      name: 'FCP',
      fullName: 'First Contentful Paint',
      metric: webVitals.metrics.fcp,
      unit: 'ms',
      threshold: CWV_THRESHOLDS.FCP,
      description: 'Time for first content element to appear',
    },
    {
      name: 'TTFB',
      fullName: 'Time to First Byte',
      metric: webVitals.metrics.ttfb,
      unit: 'ms',
      threshold: CWV_THRESHOLDS.TTFB,
      description: 'Time for first byte of response from server',
    },
    {
      name: 'INP',
      fullName: 'Interaction to Next Paint',
      metric: webVitals.metrics.inp,
      unit: 'ms',
      threshold: CWV_THRESHOLDS.INP,
      description: 'Latency of interactions throughout page lifecycle',
    },
  ];

  const coreVitals = metricConfigs.slice(0, 3); // LCP, FID, CLS
  const additionalMetrics = metricConfigs.slice(3); // FCP, TTFB, INP

  if (!webVitals.isSupported) {
    return (
      <div className={`p-6 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-yellow-700">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-medium">Core Web Vitals Not Supported</h3>
            <p className="text-sm opacity-75">Your browser doesn't support Web Vitals measurement.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with performance score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <PerformanceGauge score={webVitals.performanceScore} size={compact ? 'sm' : 'md'} />
          <div>
            <h2 className="text-2xl font-bold">Core Web Vitals</h2>
            <p className="text-gray-600">Real-time performance monitoring</p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="text-green-600">Good: {webVitals.summary.good}</span>
              <span className="text-yellow-600">Needs Work: {webVitals.summary.needsImprovement}</span>
              <span className="text-red-600">Poor: {webVitals.summary.poor}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {webVitals.isReporting && (
            <div className="flex items-center space-x-1 text-blue-600 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Reporting</span>
            </div>
          )}
          <button
            onClick={webVitals.collectMetrics}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            disabled={webVitals.isReporting}
          >
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Core Web Vitals
        </h3>
        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          {coreVitals.map((config) => (
            <MetricCard
              key={config.name}
              name={compact ? config.name : config.fullName}
              metric={config.metric}
              unit={config.unit}
              threshold={config.threshold}
              description={config.description}
              compact={compact}
            />
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      {showDetails && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Additional Metrics
          </h3>
          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {additionalMetrics.map((config) => (
              <MetricCard
                key={config.name}
                name={compact ? config.name : config.fullName}
                metric={config.metric}
                unit={config.unit}
                threshold={config.threshold}
                description={config.description}
                compact={compact}
              />
            ))}
          </div>
        </div>
      )}

      {/* Device & Connection Info */}
      {showDetails && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-3 text-gray-700">Environment Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Device</span>
              <div className="font-medium">
                {webVitals.metrics.isLowEndDevice ? '📱 Low-End' : '💪 High-End'}
              </div>
            </div>
            {webVitals.metrics.deviceMemory && (
              <div>
                <span className="text-gray-500">Memory</span>
                <div className="font-medium">{webVitals.metrics.deviceMemory}GB</div>
              </div>
            )}
            {webVitals.metrics.connectionType && (
              <div>
                <span className="text-gray-500">Connection</span>
                <div className="font-medium capitalize">{webVitals.metrics.connectionType}</div>
              </div>
            )}
            <div>
              <span className="text-gray-500">Last Update</span>
              <div className="font-medium">{lastUpdate.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="text-xs text-gray-500 text-center">
        {isVisible ? (
          <span>✅ Monitoring active • Page visible</span>
        ) : (
          <span>⏸️ Monitoring paused • Page not visible</span>
        )}
      </div>
    </div>
  );
};

export default CoreWebVitalsDashboard;
