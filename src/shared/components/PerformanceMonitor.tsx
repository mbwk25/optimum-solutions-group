/**
 * Performance Monitor Component
 * Real-time performance monitoring and PWA status display
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  Activity, 
  Gauge, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { useCoreWebVitals } from '../hooks/useCoreWebVitals';
import { usePWAStatus } from '../hooks/usePWAStatus';

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className = '',
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const webVitals = useCoreWebVitals({
    reportAllChanges: true,
    enableConsoleLogging: false,
    onMetric: () => setLastUpdate(new Date())
  });
  
  const pwaStatus = usePWAStatus();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      webVitals.collectMetrics();
      setLastUpdate(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, webVitals]);

  const getMetricStatus = (rating: string | null) => {
    switch (rating) {
      case 'good': return { color: 'bg-green-500', icon: CheckCircle };
      case 'needs-improvement': return { color: 'bg-yellow-500', icon: AlertTriangle };
      case 'poor': return { color: 'bg-red-500', icon: XCircle };
      default: return { color: 'bg-gray-400', icon: Gauge };
    }
  };

  const formatValue = (value: number | null, metric: string) => {
    if (value === null) return 'N/A';
    
    switch (metric) {
      case 'CLS':
        return value.toFixed(3);
      case 'LCP':
      case 'FCP':
      case 'FID':
      case 'TTFB':
        return `${Math.round(value)}ms`;
      case 'INP':
        return `${Math.round(value)}ms`;
      default:
        return Math.round(value).toString();
    }
  };

  const renderMetric = (name: string, label: string) => {
    const value = webVitals.getMetricValue(name);
    const rating = webVitals.getMetricRating(name);
    const status = getMetricStatus(rating);
    const Icon = status.icon;

    return (
      <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.color}`} />
          <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{formatValue(value, name)}</span>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    );
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">Performance Monitor</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <Badge variant={webVitals.isSupported ? 'default' : 'secondary'}>
              {webVitals.isSupported ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Real-time performance metrics and PWA status
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {webVitals.performanceScore}
          </div>
          <div className="text-sm text-gray-600">Performance Score</div>
        </div>

        {/* PWA Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-card rounded-lg border">
            <Smartphone className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-xs text-muted-foreground mb-1">PWA Mode</div>
            <Badge variant={pwaStatus.isStandalone ? 'default' : 'outline'}>
              {pwaStatus.isStandalone ? 'Installed' : 'Web'}
            </Badge>
          </div>
          <div className="text-center p-3 bg-card rounded-lg border">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-xs text-muted-foreground mb-1">Network</div>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Core Web Vitals */}
            <div>
              <h4 className="font-medium mb-3">Core Web Vitals</h4>
              <div className="space-y-2">
                {renderMetric('LCP', 'Largest Contentful Paint')}
                {renderMetric('FID', 'First Input Delay')}
                {renderMetric('CLS', 'Cumulative Layout Shift')}
                {renderMetric('FCP', 'First Contentful Paint')}
                {renderMetric('TTFB', 'Time to First Byte')}
                {webVitals.getMetricValue('INP') !== null && renderMetric('INP', 'Interaction to Next Paint')}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{webVitals.summary.good}</div>
                <div className="text-xs text-gray-600">Good</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">{webVitals.summary.needsImprovement}</div>
                <div className="text-xs text-gray-600">Needs Work</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{webVitals.summary.poor}</div>
                <div className="text-xs text-gray-600">Poor</div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              webVitals.collectMetrics();
              setLastUpdate(new Date());
            }}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
