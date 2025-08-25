/**
 * Advanced SEO React Hook
 * Comprehensive SEO management, meta tag handling, and performance tracking
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  validateMetaTags,
  validateStructuredData,
  calculateSEOScore,
  CoreWebVitalsTracker,
  generateMetaTitle,
  truncateDescription,
  SEO_CONFIG,
  type SEOAnalysisResult,
  type SEOMetaTag,
  type SEOConfig
} from '../utils/seo';
import { WebVital } from 'web-vitals';

// ====================================================
// Types and Interfaces
// ====================================================

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
  structuredData?: any;
}

export interface SEOHookOptions {
  enableTracking?: boolean;
  enableAnalysis?: boolean;
  enableWebVitals?: boolean;
  trackingInterval?: number;
  config?: Partial<SEOConfig>;
}

export interface SEOHookReturn {
  // SEO Management
  updateSEO: (metadata: SEOMetadata) => void;
  resetSEO: () => void;
  
  // Analysis and Scoring
  analysis: SEOAnalysisResult | null;
  score: number;
  isAnalyzing: boolean;
  runAnalysis: () => Promise<void>;
  
  // Core Web Vitals
  webVitals: Record<string, WebVital>;
  vitalsScore: number;
  
  // Real-time Tracking
  trackingEnabled: boolean;
  setTrackingEnabled: (enabled: boolean) => void;
  
  // Current SEO State
  currentMetadata: SEOMetadata;
  metaTags: SEOMetaTag[];
  structuredDataValid: boolean;
  
  // Performance
  performanceMetrics: {
    lastAnalysisTime: number;
    totalAnalyses: number;
    averageScore: number;
    scoreHistory: Array<{ timestamp: number; score: number }>;
  };
  
  // Utilities
  previewSEO: () => {
    googlePreview: string;
    twitterPreview: string;
    facebookPreview: string;
  };
}

// ====================================================
// SEO Hook Implementation
// ====================================================

export const useSEO = (
  initialMetadata: SEOMetadata = {},
  options: SEOHookOptions = {}
): SEOHookReturn => {
  const location = useLocation();
  const {
    enableTracking = true,
    enableAnalysis = true,
    enableWebVitals = true,
    trackingInterval = 30000, // 30 seconds
    config = {}
  } = options;

  // Merge config with defaults
  const seoConfig = useMemo(() => ({ ...SEO_CONFIG, ...config }), [config]);
  
  // State Management
  const [currentMetadata, setCurrentMetadata] = useState<SEOMetadata>(initialMetadata);
  const [analysis, setAnalysis] = useState<SEOAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [webVitals, setWebVitals] = useState<Record<string, WebVital>>({});
  const [trackingEnabled, setTrackingEnabled] = useState(enableTracking);
  const [metaTags, setMetaTags] = useState<SEOMetaTag[]>([]);
  const [structuredDataValid, setStructuredDataValid] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    lastAnalysisTime: 0,
    totalAnalyses: 0,
    averageScore: 0,
    scoreHistory: [] as Array<{ timestamp: number; score: number }>
  });

  // Refs for tracking and cleanup
  const trackingIntervalRef = useRef<NodeJS.Timeout>();
  const webVitalsTracker = useRef<CoreWebVitalsTracker>();
  const analysisCache = useRef<Map<string, SEOAnalysisResult>>(new Map());

  // ====================================================
  // Core Web Vitals Setup
  // ====================================================

  useEffect(() => {
    if (enableWebVitals) {
      webVitalsTracker.current = CoreWebVitalsTracker.getInstance();
      
      const handleVital = (vital: WebVital) => {
        setWebVitals(prev => ({
          ...prev,
          [vital.name]: vital
        }));
      };

      webVitalsTracker.current.subscribe(handleVital);

      // Get current vitals
      const currentVitals = webVitalsTracker.current.getVitals();
      setWebVitals(currentVitals);
    }
  }, [enableWebVitals]);

  // ====================================================
  // SEO Metadata Management
  // ====================================================

  const updateSEO = useCallback((metadata: SEOMetadata) => {
    const updatedMetadata = {
      ...currentMetadata,
      ...metadata,
      // Auto-generate missing fields
      url: metadata.url || `${seoConfig.siteUrl}${location.pathname}`,
      siteName: metadata.siteName || seoConfig.siteName
    };

    setCurrentMetadata(updatedMetadata);
    
    // Update document metadata
    updateDocumentMetadata(updatedMetadata, seoConfig);
    
    // Clear analysis cache for this page
    const cacheKey = location.pathname;
    analysisCache.current.delete(cacheKey);
    
    // Run analysis if enabled
    if (enableAnalysis) {
      setTimeout(() => runAnalysis(), 100); // Slight delay for DOM updates
    }
  }, [currentMetadata, seoConfig, location.pathname, enableAnalysis]);

  const resetSEO = useCallback(() => {
    setCurrentMetadata(initialMetadata);
    updateDocumentMetadata(initialMetadata, seoConfig);
    setAnalysis(null);
    analysisCache.current.clear();
  }, [initialMetadata, seoConfig]);

  // ====================================================
  // SEO Analysis
  // ====================================================

  const runAnalysis = useCallback(async (): Promise<void> => {
    if (isAnalyzing || !enableAnalysis) return;

    const cacheKey = location.pathname;
    const cached = analysisCache.current.get(cacheKey);
    
    if (cached && Date.now() - performanceMetrics.lastAnalysisTime < 10000) {
      setAnalysis(cached);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const startTime = performance.now();
      
      // Get current document state
      const metaAnalysis = validateMetaTags(document);
      const structuredDataAnalysis = validateStructuredData(document);
      const vitalsTracker = webVitalsTracker.current || CoreWebVitalsTracker.getInstance();
      
      // Calculate SEO score
      const result = calculateSEOScore(
        metaAnalysis,
        structuredDataAnalysis,
        vitalsTracker,
        document
      );

      const analysisTime = performance.now() - startTime;
      
      // Update state
      setAnalysis(result);
      setMetaTags(metaAnalysis.found);
      setStructuredDataValid(structuredDataAnalysis.valid);
      
      // Update performance metrics
      setPerformanceMetrics(prev => {
        const newHistory = [
          ...prev.scoreHistory.slice(-19), // Keep last 19 entries
          { timestamp: Date.now(), score: result.score }
        ];
        
        const averageScore = newHistory.reduce((sum, item) => sum + item.score, 0) / newHistory.length;
        
        return {
          lastAnalysisTime: Date.now(),
          totalAnalyses: prev.totalAnalyses + 1,
          averageScore: Math.round(averageScore),
          scoreHistory: newHistory
        };
      });
      
      // Cache the result
      analysisCache.current.set(cacheKey, result);
      
      // Log performance if in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`SEO Analysis completed in ${analysisTime.toFixed(2)}ms`, result);
      }
      
    } catch (error) {
      console.error('SEO Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, enableAnalysis, location.pathname, performanceMetrics.lastAnalysisTime]);

  // ====================================================
  // Real-time Tracking
  // ====================================================

  useEffect(() => {
    if (trackingEnabled && enableAnalysis) {
      trackingIntervalRef.current = setInterval(() => {
        runAnalysis();
      }, trackingInterval);

      return () => {
        if (trackingIntervalRef.current) {
          clearInterval(trackingIntervalRef.current);
        }
      };
    }
  }, [trackingEnabled, enableAnalysis, trackingInterval, runAnalysis]);

  // ====================================================
  // Route Change Handling
  // ====================================================

  useEffect(() => {
    // Update URL in metadata when route changes
    const updatedMetadata = {
      ...currentMetadata,
      url: `${seoConfig.siteUrl}${location.pathname}`
    };
    
    setCurrentMetadata(updatedMetadata);
    updateDocumentMetadata(updatedMetadata, seoConfig);
    
    // Run analysis for new page
    if (enableAnalysis) {
      setTimeout(() => runAnalysis(), 500); // Delay for route transition
    }
  }, [location.pathname]);

  // ====================================================
  // Computed Values
  // ====================================================

  const score = useMemo(() => analysis?.score || 0, [analysis]);
  
  const vitalsScore = useMemo(() => {
    const vitals = Object.values(webVitals);
    if (vitals.length === 0) return 0;
    
    let score = 0;
    const lcp = webVitals.LCP?.value;
    const fid = webVitals.FID?.value;
    const cls = webVitals.CLS?.value;
    
    if (lcp && lcp <= 2500) score += 33;
    if (fid && fid <= 100) score += 33;
    if (cls && cls <= 0.1) score += 34;
    
    return Math.round(score);
  }, [webVitals]);

  // ====================================================
  // Preview Utilities
  // ====================================================

  const previewSEO = useCallback(() => {
    const title = currentMetadata.title || seoConfig.defaultTitle;
    const description = currentMetadata.description || seoConfig.defaultDescription;
    const image = currentMetadata.image || seoConfig.defaultImage;
    const url = currentMetadata.url || `${seoConfig.siteUrl}${location.pathname}`;

    return {
      googlePreview: `${title}\n${url}\n${truncateDescription(description, 160)}`,
      twitterPreview: `${title}\n${truncateDescription(description, 200)}\n${url}`,
      facebookPreview: `${title}\n${description}\n${url}\nImage: ${image}`
    };
  }, [currentMetadata, seoConfig, location.pathname]);

  // ====================================================
  // Cleanup
  // ====================================================

  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  // ====================================================
  // Return Hook Interface
  // ====================================================

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

// ====================================================
// Document Metadata Update Helper
// ====================================================

const updateDocumentMetadata = (metadata: SEOMetadata, config: SEOConfig) => {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    locale = 'en_US',
    author,
    publishedTime,
    modifiedTime,
    twitterCard = 'summary_large_image',
    twitterSite,
    twitterCreator,
    canonicalUrl,
    robots = 'index, follow',
    structuredData
  } = metadata;

  // Update title
  if (title) {
    document.title = generateMetaTitle(title, config.siteName);
  }

  // Helper to set meta tag
  const setMetaTag = (selector: string, content: string) => {
    if (!content) return;
    
    let tag = document.querySelector(selector) as HTMLMetaElement;
    if (!tag) {
      tag = document.createElement('meta');
      if (selector.includes('property')) {
        tag.setAttribute('property', selector.split('property="')[1].split('"')[0]);
      } else {
        tag.setAttribute('name', selector.split('name="')[1].split('"')[0]);
      }
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  // Helper to set link tag
  const setLinkTag = (rel: string, href: string) => {
    if (!href) return;
    
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
  };

  // Basic meta tags
  if (description) setMetaTag('meta[name="description"]', truncateDescription(description));
  if (keywords.length > 0) setMetaTag('meta[name="keywords"]', keywords.join(', '));
  if (author) setMetaTag('meta[name="author"]', author);
  setMetaTag('meta[name="robots"]', robots);

  // Open Graph tags
  if (title) setMetaTag('meta[property="og:title"]', title);
  if (description) setMetaTag('meta[property="og:description"]', truncateDescription(description));
  if (image) setMetaTag('meta[property="og:image"]', image.startsWith('http') ? image : `${config.siteUrl}${image}`);
  if (url) setMetaTag('meta[property="og:url"]', url);
  setMetaTag('meta[property="og:type"]', type);
  setMetaTag('meta[property="og:site_name"]', config.siteName);
  setMetaTag('meta[property="og:locale"]', locale);
  if (publishedTime) setMetaTag('meta[property="article:published_time"]', publishedTime);
  if (modifiedTime) setMetaTag('meta[property="article:modified_time"]', modifiedTime);

  // Twitter Card tags
  setMetaTag('meta[name="twitter:card"]', twitterCard);
  if (title) setMetaTag('meta[name="twitter:title"]', title);
  if (description) setMetaTag('meta[name="twitter:description"]', truncateDescription(description, 200));
  if (image) setMetaTag('meta[name="twitter:image"]', image.startsWith('http') ? image : `${config.siteUrl}${image}`);
  if (twitterSite || config.twitterHandle) setMetaTag('meta[name="twitter:site"]', twitterSite || config.twitterHandle || '');
  if (twitterCreator) setMetaTag('meta[name="twitter:creator"]', twitterCreator);

  // Canonical URL
  if (canonicalUrl || url) setLinkTag('canonical', canonicalUrl || url || '');

  // Structured Data
  if (structuredData) {
    let script = document.querySelector('script[type="application/ld+json"][data-react-seo]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-react-seo', 'true');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData, null, 2);
  }
};

// ====================================================
// Additional Utility Hooks
// ====================================================

export const useSEOScore = (metadata: SEOMetadata) => {
  const { score, analysis, runAnalysis } = useSEO(metadata, { enableTracking: false });
  
  useEffect(() => {
    runAnalysis();
  }, [metadata, runAnalysis]);
  
  return { score, analysis };
};

export const useWebVitals = () => {
  const [vitals, setVitals] = useState<Record<string, WebVital>>({});
  
  useEffect(() => {
    const tracker = CoreWebVitalsTracker.getInstance();
    
    const handleVital = (vital: WebVital) => {
      setVitals(prev => ({ ...prev, [vital.name]: vital }));
    };
    
    tracker.subscribe(handleVital);
    setVitals(tracker.getVitals());
  }, []);
  
  return vitals;
};

export const useSEOPreview = (metadata: SEOMetadata) => {
  return useMemo(() => {
    const title = metadata.title || SEO_CONFIG.defaultTitle;
    const description = metadata.description || SEO_CONFIG.defaultDescription;
    const image = metadata.image || SEO_CONFIG.defaultImage;
    const url = metadata.url || window.location.href;

    return {
      google: {
        title: generateMetaTitle(title),
        url,
        description: truncateDescription(description, 160)
      },
      twitter: {
        title: truncateDescription(title, 60),
        description: truncateDescription(description, 200),
        image
      },
      facebook: {
        title,
        description,
        image,
        url
      }
    };
  }, [metadata]);
};

export default useSEO;
