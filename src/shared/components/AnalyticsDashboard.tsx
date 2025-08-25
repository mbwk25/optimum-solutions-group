/**
 * Analytics Dashboard Component
 * 
 * Provides a comprehensive dashboard for viewing analytics data,
 * user behavior, performance metrics, and insights.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Separator } from '@/shared/ui/separator';
import { Progress } from '@/shared/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Users,
  MousePointer,
  Clock,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from 'lucide-react';
import analytics, { type AnalyticsEvent, type UserSession } from '@/shared/services/analytics';

// =========================== TYPES ===========================

interface AnalyticsData {
  events: AnalyticsEvent[];
  session: UserSession;
  metrics: {
    totalPageViews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
    bounceRate: number;
    totalEvents: number;
    conversionRate: number;
  };
  deviceBreakdown: Array<{ name: string; value: number; percentage: number }>;
  topPages: Array<{ url: string; views: number; time: number }>;
  eventsByCategory: Array<{ category: string; count: number }>;
  timeSeriesData: Array<{ timestamp: string; events: number; users: number }>;
  performanceMetrics: {
    avgLCP: number;
    avgFID: number;
    avgCLS: number;
    avgFCP: number;
    avgTTFB: number;
  };
}

interface DashboardProps {
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d';
  autoRefresh?: boolean;
  refreshInterval?: number;
  compact?: boolean;
  showExportOptions?: boolean;
}

// =========================== MAIN COMPONENT ===========================

export const AnalyticsDashboard: React.FC<DashboardProps> = ({
  timeRange = '24h',
  autoRefresh = true,
  refreshInterval = 30000,
  compact = false,
  showExportOptions = true,
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // =========================== DATA FETCHING ===========================

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would fetch from your analytics API
      // For now, we'll simulate data based on the current session and stored events
      const session = analytics.getSession();
      
      // Simulate fetching stored events (in real implementation, this would be from your backend)
      const events = []; // This would be fetched from your analytics API
      
      const simulatedData: AnalyticsData = {
        events: events,
        session: session,
        metrics: {
          totalPageViews: session.pageViews || 1,
          uniqueVisitors: 1, // Would be calculated from your backend
          averageSessionDuration: session.duration / 1000 / 60, // Convert to minutes
          bounceRate: session.bounceRate ? 100 : 0,
          totalEvents: events.length,
          conversionRate: 0, // Would be calculated based on goals
        },
        deviceBreakdown: [
          { name: 'Desktop', value: 65, percentage: 65 },
          { name: 'Mobile', value: 30, percentage: 30 },
          { name: 'Tablet', value: 5, percentage: 5 },
        ],
        topPages: [
          { url: '/', views: session.pageViews || 1, time: session.timeOnPage / 1000 },
        ],
        eventsByCategory: [
          { category: 'navigation', count: session.pageViews || 1 },
          { category: 'engagement', count: session.interactions || 0 },
        ],
        timeSeriesData: [
          { timestamp: new Date(Date.now() - 3600000).toISOString(), events: 5, users: 3 },
          { timestamp: new Date(Date.now() - 1800000).toISOString(), events: 8, users: 5 },
          { timestamp: new Date().toISOString(), events: session.interactions + session.pageViews, users: 1 },
        ],
        performanceMetrics: {
          avgLCP: 2200,
          avgFID: 80,
          avgCLS: 0.08,
          avgFCP: 1800,
          avgTTFB: 600,
        },
      };

      setData(simulatedData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, []); // timeRange not actually used in function body

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalyticsData]);

  // =========================== COMPUTED VALUES ===========================

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  const getPerformanceRating = (metric: string, value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric.toLowerCase() as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  // =========================== RENDER METHODS ===========================

  const renderOverviewTab = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.metrics.totalPageViews)}</div>
              <p className="text-xs text-muted-foreground">
                Total page views in {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.metrics.uniqueVisitors)}</div>
              <p className="text-xs text-muted-foreground">
                Unique users in {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(data.metrics.averageSessionDuration * 60)}</div>
              <p className="text-xs text-muted-foreground">
                Average session duration
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.metrics.bounceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Users leaving after one page
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Activity Over Time
              </CardTitle>
              <CardDescription>Events and users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Events"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Device Breakdown
              </CardTitle>
              <CardDescription>Visitors by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages in your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{page.url}</p>
                      <p className="text-xs text-muted-foreground">
                        Avg. time: {formatDuration(page.time)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatNumber(page.views)}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEventsTab = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Events by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Events by Category
            </CardTitle>
            <CardDescription>Breakdown of tracked events</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.eventsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.events.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent events to display</p>
                  <p className="text-sm text-gray-400">Events will appear here as users interact with your site</p>
                </div>
              ) : (
                data.events.slice(0, 10).map((event, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{event.action}</p>
                      <p className="text-sm text-gray-600">{event.category}</p>
                      {event.label && (
                        <p className="text-xs text-gray-500">{event.label}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{event.type}</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    if (!data) return null;

    const performanceData = [
      { metric: 'LCP', value: data.performanceMetrics.avgLCP, unit: 'ms', rating: getPerformanceRating('lcp', data.performanceMetrics.avgLCP) },
      { metric: 'FID', value: data.performanceMetrics.avgFID, unit: 'ms', rating: getPerformanceRating('fid', data.performanceMetrics.avgFID) },
      { metric: 'CLS', value: data.performanceMetrics.avgCLS, unit: '', rating: getPerformanceRating('cls', data.performanceMetrics.avgCLS) },
      { metric: 'FCP', value: data.performanceMetrics.avgFCP, unit: 'ms', rating: getPerformanceRating('fcp', data.performanceMetrics.avgFCP) },
      { metric: 'TTFB', value: data.performanceMetrics.avgTTFB, unit: 'ms', rating: getPerformanceRating('ttfb', data.performanceMetrics.avgTTFB) },
    ];

    return (
      <div className="space-y-6">
        {/* Core Web Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceData.slice(0, 3).map((metric) => (
            <Card key={metric.metric}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                <CardDescription>
                  {metric.metric === 'LCP' && 'Largest Contentful Paint'}
                  {metric.metric === 'FID' && 'First Input Delay'}
                  {metric.metric === 'CLS' && 'Cumulative Layout Shift'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.unit === '' ? metric.value.toFixed(3) : Math.round(metric.value)}
                  {metric.unit}
                </div>
                <Badge 
                  variant={metric.rating === 'good' ? 'default' : metric.rating === 'needs-improvement' ? 'secondary' : 'destructive'}
                  className="mt-2"
                >
                  {metric.rating === 'good' ? 'Good' : metric.rating === 'needs-improvement' ? 'Needs Work' : 'Poor'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Performance Metrics</CardTitle>
            <CardDescription>Other important performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.slice(3).map((metric) => (
                <div key={metric.metric} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{metric.metric}</p>
                    <p className="text-sm text-gray-600">
                      {metric.metric === 'FCP' && 'First Contentful Paint'}
                      {metric.metric === 'TTFB' && 'Time to First Byte'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{Math.round(metric.value)}{metric.unit}</p>
                    <Badge 
                      variant={metric.rating === 'good' ? 'default' : metric.rating === 'needs-improvement' ? 'secondary' : 'destructive'}
                      size="sm"
                    >
                      {metric.rating === 'good' ? 'Good' : metric.rating === 'needs-improvement' ? 'Needs Work' : 'Poor'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-lg">Loading analytics data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium">No Analytics Data</h3>
        <p className="text-gray-500">Start browsing your site to generate analytics data.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${compact ? 'max-w-4xl' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdate.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {showExportOptions && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="text-sm text-gray-600">
          Analytics service is {analytics.isEnabled() ? 'active' : 'inactive'}
        </span>
        {autoRefresh && (
          <Badge variant="outline" className="ml-2">
            Auto-refresh: {refreshInterval / 1000}s
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {renderEventsTab()}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {renderPerformanceTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
