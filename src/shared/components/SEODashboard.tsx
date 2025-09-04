/**
 * SEO Dashboard Component
 * Comprehensive SEO monitoring dashboard with real-time metrics and analysis
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  Search,
  Globe,
  Zap,
  BarChart3,
  Activity,
  Users,
  Clock,
  Shield,
  Target,
  RefreshCw,
  Share2
} from 'lucide-react';
import { useSEO, type SEOMetadata } from '../hooks/useSEO';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

// ====================================================
// Types and Interfaces
// ====================================================

interface SEODashboardProps {
  initialMetadata?: SEOMetadata;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showAdvanced?: boolean;
  compact?: boolean;
  onScoreChange?: (score: number) => void;
  onIssuesDetected?: (issues: Array<{ category: string; type: string; message: string; recommendation: string; impact: string }>) => void;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'stable' | undefined;
  trendValue?: string | undefined;
  icon?: React.ComponentType<any>;
  color?: 'default' | 'green' | 'yellow' | 'red' | 'blue';
  onClick?: () => void;
}

// ====================================================
// Utility Functions
// ====================================================


const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

const getScoreBadgeVariant = (score: number) => {
  if (score >= 90) return 'default';
  if (score >= 70) return 'secondary';
  if (score >= 50) return 'outline';
  return 'destructive';
};


const getVitalStatus = (value: number | null, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' | 'unknown' => {
  if (value === null) return 'unknown';
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
};

// ====================================================
// Metric Card Component
// ====================================================

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend,
  trendValue,
  icon: Icon,
  color = 'default',
  onClick
}) => {
  const colorClasses = {
    default: 'border-gray-200',
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
    blue: 'border-blue-200 bg-blue-50'
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${colorClasses[color]} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center text-xs mt-2">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            ) : (
              <div className="h-3 w-3 bg-gray-400 rounded-full mr-1" />
            )}
            <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ====================================================
// Main SEO Dashboard Component
// ====================================================

export const SEODashboard: React.FC<SEODashboardProps> = ({
  initialMetadata = {},
  autoRefresh = true,
  refreshInterval = 30000,
  compact = false,
  onScoreChange,
  onIssuesDetected
}) => {
  const {
    analysis,
    score,
    isAnalyzing,
    runAnalysis,
    webVitals,
    vitalsScore,
    trackingEnabled,
    setTrackingEnabled,
    metaTags,
    structuredDataValid,
    performanceMetrics,
    previewSEO
  } = useSEO(initialMetadata, {
    enableTracking: autoRefresh,
    trackingInterval: refreshInterval,
    enableAnalysis: true,
    enableWebVitals: true
  });

  const [activeTab, setActiveTab] = useState('overview');

  // Notify parent components of changes
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(score);
    }
  }, [score, onScoreChange]);

  useEffect(() => {
    if (onIssuesDetected && analysis && analysis.issues) {
      onIssuesDetected(analysis.issues);
    }
  }, [onIssuesDetected, analysis]);

  // ====================================================
  // Computed Values
  // ====================================================

  const vitalsData = useMemo(() => {
    const lcp = webVitals['LCP']?.value || null;
    const fid = webVitals['FID']?.value || null;
    const cls = webVitals['CLS']?.value || null;
    const fcp = webVitals['FCP']?.value || null;
    const ttfb = webVitals['TTFB']?.value || null;

    return {
      lcp: {
        value: lcp,
        status: getVitalStatus(lcp, { good: 2500, poor: 4000 }),
        label: 'Largest Contentful Paint',
        unit: 'ms'
      },
      fid: {
        value: fid,
        status: getVitalStatus(fid, { good: 100, poor: 300 }),
        label: 'First Input Delay',
        unit: 'ms'
      },
      cls: {
        value: cls,
        status: getVitalStatus(cls, { good: 0.1, poor: 0.25 }),
        label: 'Cumulative Layout Shift',
        unit: ''
      },
      fcp: {
        value: fcp,
        status: getVitalStatus(fcp, { good: 1800, poor: 3000 }),
        label: 'First Contentful Paint',
        unit: 'ms'
      },
      ttfb: {
        value: ttfb,
        status: getVitalStatus(ttfb, { good: 800, poor: 1800 }),
        label: 'Time to First Byte',
        unit: 'ms'
      }
    };
  }, [webVitals]);

  const issuesByCategory = useMemo(() => {
    if (!analysis) return {};
    return analysis.issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [analysis]);

  const scoreHistory = useMemo(() => {
    return performanceMetrics.scoreHistory.map(item => ({
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
      score: item.score,
      date: item.timestamp
    }));
  }, [performanceMetrics.scoreHistory]);

  // ====================================================
  // Render Methods
  // ====================================================

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Main Score and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall SEO Score"
          value={`${score}/100`}
          description="Combined SEO performance rating"
          icon={Target}
          color={score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red'}
          trend={scoreHistory.length > 1 ? (
            (scoreHistory[scoreHistory.length - 1]?.score || 0) > (scoreHistory[scoreHistory.length - 2]?.score || 0) ? 'up' : 'down'
          ) : 'stable'}
          trendValue={scoreHistory.length > 1 ? `${Math.abs((scoreHistory[scoreHistory.length - 1]?.score || 0) - (scoreHistory[scoreHistory.length - 2]?.score || 0))} pts` : undefined}
        />
        
        <MetricCard
          title="Core Web Vitals"
          value={`${vitalsScore}/100`}
          description="Performance metrics score"
          icon={Zap}
          color={vitalsScore >= 90 ? 'green' : vitalsScore >= 70 ? 'yellow' : 'red'}
        />
        
        <MetricCard
          title="Issues Found"
          value={analysis?.issues.length || 0}
          description="Total SEO issues detected"
          icon={AlertTriangle}
          color={!analysis?.issues.length ? 'green' : analysis.issues.filter(i => i.type === 'error').length > 0 ? 'red' : 'yellow'}
        />
        
        <MetricCard
          title="Meta Tags"
          value={`${metaTags.length}`}
          description="Total meta tags found"
          icon={Globe}
          color={structuredDataValid ? 'green' : 'yellow'}
        />
      </div>

      {/* Score Trend Chart */}
      {scoreHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              SEO Score Trend
            </CardTitle>
            <CardDescription>
              Performance over the last {scoreHistory.length} analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value) => [`${value} pts`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Issues Breakdown */}
      {analysis && analysis.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Issues by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(issuesByCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="capitalize font-medium">{category}</div>
                  <Badge variant={count > 5 ? 'destructive' : count > 2 ? 'secondary' : 'outline'}>
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderWebVitals = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(vitalsData).map(([key, vital]) => (
          <Card key={key} className={`border-l-4 ${
            vital.status === 'good' ? 'border-l-green-500' : 
            vital.status === 'needs-improvement' ? 'border-l-yellow-500' : 
            vital.status === 'poor' ? 'border-l-red-500' : 'border-l-gray-300'
          }`}>
            <CardHeader>
              <CardTitle className="text-sm">{vital.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vital.value !== null ? `${formatNumber(vital.value, key === 'cls' ? 3 : 0)}${vital.unit}` : 'N/A'}
              </div>
              <Badge 
                variant={vital.status === 'good' ? 'default' : vital.status === 'needs-improvement' ? 'secondary' : 'destructive'}
                className="mt-2"
              >
                {vital.status === 'good' ? 'Good' : vital.status === 'needs-improvement' ? 'Needs Improvement' : vital.status === 'poor' ? 'Poor' : 'Unknown'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Recommendations */}
      {analysis?.coreWebVitals && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vitalsData.lcp.status !== 'good' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Largest Contentful Paint:</strong> Optimize image loading, improve server response times, and eliminate render-blocking resources.
                  </AlertDescription>
                </Alert>
              )}
              {vitalsData.fid.status !== 'good' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>First Input Delay:</strong> Reduce JavaScript execution time and break up long tasks.
                  </AlertDescription>
                </Alert>
              )}
              {vitalsData.cls.status !== 'good' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cumulative Layout Shift:</strong> Set size attributes for images and avoid inserting content above existing content.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderIssues = () => (
    <div className="space-y-4">
      {analysis?.issues.map((issue, index) => (
        <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
          {issue.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">{issue.message}</div>
              <div className="text-sm text-muted-foreground">{issue.recommendation}</div>
              <div className="flex gap-2">
                <Badge variant="outline">{issue.category}</Badge>
                <Badge variant={issue.impact === 'high' ? 'destructive' : issue.impact === 'medium' ? 'secondary' : 'outline'}>
                  {issue.impact} impact
                </Badge>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )) || (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Issues Found</h3>
          <p className="text-muted-foreground">Your SEO implementation looks great!</p>
        </div>
      )}
    </div>
  );

  const renderMetaTags = () => (
    <div className="space-y-4">
      {metaTags.length > 0 ? (
        <div className="grid gap-4">
          {metaTags.map((tag, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {tag.name || tag.property}
                    </code>
                    <Badge variant="outline">
                      {tag.name ? 'name' : 'property'}
                    </Badge>
                  </div>
                  <p className="text-sm">{tag.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Meta Tags Found</h3>
          <p className="text-muted-foreground">Consider adding essential meta tags for better SEO.</p>
        </div>
      )}
    </div>
  );

  const renderPreview = () => {
    const previews = previewSEO();
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Google Search Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {previews.googlePreview}
              </pre>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Twitter Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-blue-50">
                <pre className="whitespace-pre-wrap text-sm">
                  {previews.twitterPreview}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Facebook Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-blue-50">
                <pre className="whitespace-pre-wrap text-sm">
                  {previews.facebookPreview}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <CardTitle>SEO Score</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getScoreBadgeVariant(score)} className="text-lg px-3 py-1">
                {score}/100
              </Badge>
              {isAnalyzing && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={score} className="mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{analysis?.issues.length || 0} issues</span>
            <span>{vitalsScore}/100 vitals</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SEO Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and optimize your website's search engine performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAnalysis()}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTrackingEnabled(!trackingEnabled)}
          >
            <Activity className={`h-4 w-4 mr-2 ${trackingEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            {trackingEnabled ? 'Live' : 'Paused'}
          </Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          {renderWebVitals()}
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          {renderIssues()}
        </TabsContent>

        <TabsContent value="meta" className="space-y-4">
          {renderMetaTags()}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {renderPreview()}
        </TabsContent>
      </Tabs>

      {/* Performance Metrics Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Last Analysis: {new Date(performanceMetrics.lastAnalysisTime).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span>Total Analyses: {performanceMetrics.totalAnalyses}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>Average Score: {performanceMetrics.averageScore}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Structured Data: {structuredDataValid ? 'Valid' : 'Issues'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEODashboard;
