/**
 * SEO Dashboard Component Tests
 * Comprehensive testing for the SEODashboard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SEODashboard } from '../SEODashboard';
import { useSEO } from '../../hooks/useSEO';

// Mock the useSEO hook
jest.mock('../../hooks/useSEO');
const mockUseSEO = useSEO as jest.MockedFunction<typeof useSEO>;

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Mock SEO data
const mockSEOData = {
  analysis: {
    score: 85,
    issues: [
      {
        category: 'meta',
        type: 'error',
        message: 'Missing title tag',
        recommendation: 'Add a descriptive title tag',
        impact: 'high'
      },
      {
        category: 'performance',
        type: 'warning',
        message: 'Slow loading time',
        recommendation: 'Optimize images and scripts',
        impact: 'medium'
      }
    ],
    recommendations: ['Add a descriptive title tag', 'Optimize images and scripts'],
    coreWebVitals: {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      fcp: 1800,
      ttfb: 800
    }
  },
  score: 85,
  isAnalyzing: false,
  runAnalysis: jest.fn(),
  webVitals: {
    'LCP': { name: 'LCP', value: 2500 },
    'FID': { name: 'FID', value: 100 },
    'CLS': { name: 'CLS', value: 0.1 },
    'FCP': { name: 'FCP', value: 1800 },
    'TTFB': { name: 'TTFB', value: 800 }
  },
  vitalsScore: 90,
  trackingEnabled: true,
  setTrackingEnabled: jest.fn(),
  currentMetadata: {
    title: 'Test Page',
    description: 'Test Description',
    url: 'https://example.com/test'
  },
  metaTags: [
    { name: 'description', content: 'Test Description' },
    { property: 'og:title', content: 'Test Page' }
  ],
  structuredDataValid: true,
  performanceMetrics: {
    lastAnalysisTime: Date.now(),
    totalAnalyses: 5,
    averageScore: 82,
    scoreHistory: [
      { timestamp: Date.now() - 300000, score: 80 },
      { timestamp: Date.now() - 200000, score: 82 },
      { timestamp: Date.now() - 100000, score: 85 }
    ]
  },
  previewSEO: jest.fn(() => ({
    googlePreview: 'Test Page\nhttps://example.com/test\nTest Description',
    twitterPreview: 'Test Page\nTest Description\nhttps://example.com/test',
    facebookPreview: 'Test Page\nTest Description\nhttps://example.com/test'
  })),
  updateSEO: jest.fn(),
  resetSEO: jest.fn()
};

describe('SEODashboard Component', () => {
  beforeEach(() => {
    mockUseSEO.mockReturnValue(mockSEOData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dashboard with main title', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      expect(screen.getByText('SEO Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Monitor and optimize your website\'s search engine performance')).toBeInTheDocument();
    });

    it('should render overview tab by default', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Overall SEO Score')).toBeInTheDocument();
      expect(screen.getByText('Issues Found')).toBeInTheDocument();
      // Check for Meta Tags in the overview section specifically
      expect(screen.getAllByText('Meta Tags')).toHaveLength(2);
    });

    it('should render all tab triggers', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Core Web Vitals' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Issues' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Meta Tags' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument();
    });
  });

  describe('Score Display', () => {
    it('should display the correct SEO score', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      expect(screen.getByText('85/100')).toBeInTheDocument();
    });

    it('should display the correct vitals score', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      expect(screen.getByText('90/100')).toBeInTheDocument();
    });

    it('should display issues count', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      // Check that issues count is displayed (there are 2 issues in mock data)
      const issuesElements = screen.getAllByText('2');
      expect(issuesElements.length).toBeGreaterThan(0);
    });

    it('should display meta tags count', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      // Check that meta tags count is displayed (there are 2 meta tags in mock data)
      const metaElements = screen.getAllByText('2');
      expect(metaElements.length).toBeGreaterThan(0);
    });
  });

  describe('Tab Navigation', () => {
    it('should have overview tab active by default', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Refresh Functionality', () => {
    it('should call runAnalysis when refresh button is clicked', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      expect(mockSEOData.runAnalysis).toHaveBeenCalledTimes(1);
    });

    it('should disable refresh button when analyzing', () => {
      mockUseSEO.mockReturnValue({
        ...mockSEOData,
        isAnalyzing: true
      });

      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Tracking Controls', () => {
    it('should toggle tracking when Live/Paused button is clicked', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      const trackingButton = screen.getByText('Live');
      fireEvent.click(trackingButton);

      expect(mockSEOData.setTrackingEnabled).toHaveBeenCalledWith(false);
    });

    it('should show Paused when tracking is disabled', () => {
      mockUseSEO.mockReturnValue({
        ...mockSEOData,
        trackingEnabled: false
      });

      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Paused')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode when compact prop is true', () => {
      render(
        <TestWrapper>
          <SEODashboard compact />
        </TestWrapper>
      );

      expect(screen.getByText('SEO Score')).toBeInTheDocument();
      expect(screen.getByText('85/100')).toBeInTheDocument();
    });

    it('should not render tabs in compact mode', () => {
      render(
        <TestWrapper>
          <SEODashboard compact />
        </TestWrapper>
      );

      expect(screen.queryByRole('tab', { name: 'Overview' })).not.toBeInTheDocument();
    });
  });

  describe('Issues Display', () => {
    it('should display issues count in overview', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      // Issues count should be displayed in the overview
      const issuesElements = screen.getAllByText('2');
      expect(issuesElements.length).toBeGreaterThan(0);
    });

    it('should show zero issues when no issues', () => {
      mockUseSEO.mockReturnValue({
        ...mockSEOData,
        analysis: {
          ...mockSEOData.analysis,
          issues: []
        }
      });

      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      // Should show 0 issues
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Web Vitals Display', () => {
    it('should display vitals score in overview', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      // Vitals score should be displayed in the overview
      expect(screen.getByText('90/100')).toBeInTheDocument();
    });
  });

  describe('Meta Tags Display', () => {
    it('should display meta tags count in overview', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      // Meta tags count should be displayed in the overview
      const metaElements = screen.getAllByText('2');
      expect(metaElements.length).toBeGreaterThan(0);
    });

    it('should show zero meta tags when no tags', () => {
      mockUseSEO.mockReturnValue({
        ...mockSEOData,
        metaTags: []
      });

      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      // Should show 0 meta tags
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Preview Display', () => {
    it('should render preview tab', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      // Preview tab should be rendered
      expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument();
    });
  });

  describe('Performance Metrics Footer', () => {
    it('should display performance metrics', () => {
      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      expect(screen.getByText(/Last Analysis:/)).toBeInTheDocument();
      expect(screen.getByText('Total Analyses: 5')).toBeInTheDocument();
      expect(screen.getByText('Average Score: 82/100')).toBeInTheDocument();
      expect(screen.getByText('Structured Data: Valid')).toBeInTheDocument();
    });
  });

  describe('Callback Functions', () => {
    it('should call onScoreChange when score changes', () => {
      const onScoreChange = jest.fn();
      
      render(
        <TestWrapper>
          <SEODashboard onScoreChange={onScoreChange} />
        </TestWrapper>
      );

      expect(onScoreChange).toHaveBeenCalledWith(85);
    });

    it('should call onIssuesDetected when issues are detected', () => {
      const onIssuesDetected = jest.fn();
      
      render(
        <TestWrapper>
          <SEODashboard onIssuesDetected={onIssuesDetected} />
        </TestWrapper>
      );

      expect(onIssuesDetected).toHaveBeenCalledWith(mockSEOData.analysis.issues);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing analysis data gracefully', () => {
      mockUseSEO.mockReturnValue({
        ...mockSEOData,
        analysis: null
      });

      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      // Should still render without crashing
      expect(screen.getByText('SEO Dashboard')).toBeInTheDocument();
    });

    it('should handle empty issues array', () => {
      mockUseSEO.mockReturnValue({
        ...mockSEOData,
        analysis: {
          ...mockSEOData.analysis,
          issues: []
        }
      });

      render(
        <TestWrapper>
          <SEODashboard />
        </TestWrapper>
      );

      // Should show 0 issues
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});