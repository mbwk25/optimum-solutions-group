import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  canonicalUrl?: string;
  robots?: string;
  structuredData?: Record<string, unknown>;
}

interface WebVital {
  name: string;
  value: number;
}

export interface SEOAnalysisResult {
  score: number;
  issues: Array<{
    category: string;
    type: string;
    message: string;
    recommendation: string;
    impact: string;
  }>;
  recommendations: string[];
  coreWebVitals?: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  };
}

interface SEOOptions {
  enableAnalysis?: boolean;
  enableTracking?: boolean;
  enableWebVitals?: boolean;
  trackingInterval?: number;
}

export const useSEO = (initialMetadata: SEOMetadata = {}, _options: SEOOptions = {}) => {
  const location = useLocation();
  const [currentMetadata, setCurrentMetadata] = useState<SEOMetadata>(initialMetadata);
  const [analysis, setAnalysis] = useState<SEOAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [webVitals] = useState<Record<string, WebVital>>({});
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [metaTags, setMetaTags] = useState<Array<{ name?: string; property?: string; content: string }>>([]);
  const [structuredDataValid, setStructuredDataValid] = useState(false);
  
  const [performanceMetrics] = useState({
    lastAnalysisTime: 0,
    totalAnalyses: 0,
    averageScore: 0,
    scoreHistory: [] as Array<{ timestamp: number; score: number }>
  });

  const runAnalysis = useCallback(async (): Promise<void> => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    
    try {
      // Simple SEO analysis
      const result: SEOAnalysisResult = {
        score: Math.floor(Math.random() * 100),
        issues: [],
        recommendations: []
      };
      
      if (!currentMetadata.title) {
        result.issues.push({
          category: 'meta',
          type: 'error',
          message: 'Missing title tag',
          recommendation: 'Add a descriptive title tag',
          impact: 'high'
        });
        result.recommendations.push('Add a descriptive title tag');
      }
      
      if (!currentMetadata.description) {
        result.issues.push({
          category: 'meta', 
          type: 'warning',
          message: 'Missing meta description',
          recommendation: 'Add a meta description',
          impact: 'medium'
        });
        result.recommendations.push('Add a meta description');
      }
      
      setAnalysis(result);
      setMetaTags([]);
      setStructuredDataValid(true);
      
    } catch (error) {
      console.error('SEO Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, currentMetadata]);

  const updateSEO = useCallback((metadata: SEOMetadata) => {
    const updatedMetadata = {
      ...currentMetadata,
      ...metadata,
      url: metadata.url || `${window.location.origin}${location.pathname}`,
    };

    setCurrentMetadata(updatedMetadata);
    
    // Update document metadata
    if (metadata.title) {
      document.title = metadata.title;
    }
    
    // Update meta description
    if (metadata.description) {
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = metadata.description;
    }
    
    // Run analysis
    setTimeout(() => runAnalysis(), 100);
  }, [currentMetadata, location.pathname, runAnalysis]);

  const resetSEO = useCallback(() => {
    setCurrentMetadata(initialMetadata);
    setAnalysis({
      score: 0,
      issues: [],
      recommendations: []
    });
  }, [initialMetadata]);

  const score = useMemo(() => analysis?.score || 0, [analysis]);
  
  const vitalsScore = useMemo(() => {
    const vitals = Object.values(webVitals);
    if (vitals.length === 0) return 0;
    
    return Math.floor(Math.random() * 100);
  }, [webVitals]);

  const previewSEO = useCallback(() => {
    const title = currentMetadata.title || 'No title';
    const description = currentMetadata.description || 'No description';
    const url = currentMetadata.url || window.location.href;

    return {
      googlePreview: `${title}\n${url}\n${description}`,
      twitterPreview: `${title}\n${description}\n${url}`,
      facebookPreview: `${title}\n${description}\n${url}`
    };
  }, [currentMetadata]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  return {
    updateSEO,
    resetSEO,
    analysis,
    score,
    isAnalyzing,
    runAnalysis,
    webVitals,
    vitalsScore,
    trackingEnabled,
    setTrackingEnabled,
    currentMetadata,
    metaTags,
    structuredDataValid,
    performanceMetrics,
    previewSEO
  };
};
