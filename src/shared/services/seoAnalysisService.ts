/**
 * @fileoverview SEO Analysis Domain Service
 * @description Business logic for SEO analysis and optimization
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import { eventBus, EVENT_TYPES } from './eventBus';

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

export interface SEOIssue {
  category: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  element?: string;
  value?: string;
  expected?: string;
}

export interface SEOAnalysisResult {
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
  metaTags: Array<{
    name?: string;
    property?: string;
    content: string;
    status: 'present' | 'missing' | 'invalid';
  }>;
  structuredDataValid: boolean;
  performanceScore: number;
  accessibilityScore: number;
  coreWebVitals?: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  };
}

export class SEOAnalysisService {
  private readonly MIN_TITLE_LENGTH = 30;
  private readonly MAX_TITLE_LENGTH = 60;
  private readonly MIN_DESCRIPTION_LENGTH = 120;
  private readonly MAX_DESCRIPTION_LENGTH = 160;
  private readonly MAX_KEYWORDS = 10;

  /**
   * Analyze SEO metadata and return comprehensive results
   */
  analyze(metadata: SEOMetadata): SEOAnalysisResult {
    const issues: SEOIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Analyze title
    this.analyzeTitle(metadata.title, issues, recommendations);
    score -= this.calculateTitleScore(metadata.title);

    // Analyze description
    this.analyzeDescription(metadata.description, issues, recommendations);
    score -= this.calculateDescriptionScore(metadata.description);

    // Analyze keywords
    this.analyzeKeywords(metadata.keywords, issues, recommendations);
    score -= this.calculateKeywordsScore(metadata.keywords);

    // Analyze image
    this.analyzeImage(metadata.image, issues, recommendations);
    score -= this.calculateImageScore(metadata.image);

    // Analyze URL
    this.analyzeUrl(metadata.url, issues);
    score -= this.calculateUrlScore(metadata.url);

    // Analyze structured data
    const structuredDataValid = this.analyzeStructuredData(metadata.structuredData, issues);
    score -= structuredDataValid ? 0 : 10;

    // Analyze meta tags
    const metaTags = this.analyzeMetaTags(metadata, issues, recommendations);
    score -= this.calculateMetaTagsScore(metaTags);

    // Calculate performance and accessibility scores
    const performanceScore = this.calculatePerformanceScore(metadata);
    const accessibilityScore = this.calculateAccessibilityScore(metadata);

    const result: SEOAnalysisResult = {
      score: Math.max(0, Math.min(100, score)),
      issues,
      recommendations,
      metaTags,
      structuredDataValid,
      performanceScore,
      accessibilityScore,
      coreWebVitals: this.getCoreWebVitals(),
    };

    // Emit analysis complete event
    eventBus.emit(EVENT_TYPES.SEO_ANALYSIS_COMPLETE, {
      score: result.score,
      issuesCount: issues.length,
      criticalIssues: issues.filter(i => i.impact === 'critical').length,
    });

    return result;
  }

  private analyzeTitle(title: string | undefined, issues: SEOIssue[], recommendations: string[]): void {
    if (!title) {
      issues.push({
        category: 'meta',
        type: 'error',
        message: 'Missing title tag',
        recommendation: 'Add a descriptive title tag',
        impact: 'critical',
        element: 'title',
      });
      recommendations.push('Add a descriptive title tag');
      return;
    }

    if (title.length < this.MIN_TITLE_LENGTH) {
      issues.push({
        category: 'meta',
        type: 'warning',
        message: 'Title too short',
        recommendation: `Increase title length to at least ${this.MIN_TITLE_LENGTH} characters`,
        impact: 'medium',
        element: 'title',
        value: title,
        expected: `${this.MIN_TITLE_LENGTH}+ characters`,
      });
      recommendations.push('Make title more descriptive');
    }

    if (title.length > this.MAX_TITLE_LENGTH) {
      issues.push({
        category: 'meta',
        type: 'warning',
        message: 'Title too long',
        recommendation: `Reduce title length to maximum ${this.MAX_TITLE_LENGTH} characters`,
        impact: 'medium',
        element: 'title',
        value: title,
        expected: `${this.MAX_TITLE_LENGTH} characters max`,
      });
      recommendations.push('Shorten title to avoid truncation');
    }

    if (!title.includes(' ')) {
      issues.push({
        category: 'meta',
        type: 'warning',
        message: 'Title appears to be a single word',
        recommendation: 'Use descriptive phrases instead of single words',
        impact: 'low',
        element: 'title',
        value: title,
      });
    }
  }

  private analyzeDescription(description: string | undefined, issues: SEOIssue[], recommendations: string[]): void {
    if (!description) {
      issues.push({
        category: 'meta',
        type: 'error',
        message: 'Missing meta description',
        recommendation: 'Add a compelling meta description',
        impact: 'high',
        element: 'meta[name="description"]',
      });
      recommendations.push('Add a meta description');
      return;
    }

    if (description.length < this.MIN_DESCRIPTION_LENGTH) {
      issues.push({
        category: 'meta',
        type: 'warning',
        message: 'Description too short',
        recommendation: `Increase description length to at least ${this.MIN_DESCRIPTION_LENGTH} characters`,
        impact: 'medium',
        element: 'meta[name="description"]',
        value: description,
        expected: `${this.MIN_DESCRIPTION_LENGTH}+ characters`,
      });
      recommendations.push('Expand meta description');
    }

    if (description.length > this.MAX_DESCRIPTION_LENGTH) {
      issues.push({
        category: 'meta',
        type: 'warning',
        message: 'Description too long',
        recommendation: `Reduce description length to maximum ${this.MAX_DESCRIPTION_LENGTH} characters`,
        impact: 'medium',
        element: 'meta[name="description"]',
        value: description,
        expected: `${this.MAX_DESCRIPTION_LENGTH} characters max`,
      });
      recommendations.push('Shorten meta description');
    }
  }

  private analyzeKeywords(keywords: string[] | undefined, issues: SEOIssue[], recommendations: string[]): void {
    if (!keywords || keywords.length === 0) {
      issues.push({
        category: 'meta',
        type: 'info',
        message: 'No keywords specified',
        recommendation: 'Consider adding relevant keywords',
        impact: 'low',
        element: 'meta[name="keywords"]',
      });
      return;
    }

    if (keywords.length > this.MAX_KEYWORDS) {
      issues.push({
        category: 'meta',
        type: 'warning',
        message: 'Too many keywords',
        recommendation: `Reduce keywords to maximum ${this.MAX_KEYWORDS}`,
        impact: 'low',
        element: 'meta[name="keywords"]',
        value: keywords.join(', '),
        expected: `${this.MAX_KEYWORDS} keywords max`,
      });
      recommendations.push('Focus on most relevant keywords');
    }

    // Check for keyword stuffing
    const totalLength = keywords.join(' ').length;
    if (totalLength > 200) {
      issues.push({
        category: 'meta',
        type: 'warning',
        message: 'Potential keyword stuffing',
        recommendation: 'Reduce keyword density',
        impact: 'medium',
        element: 'meta[name="keywords"]',
        value: keywords.join(', '),
      });
    }
  }

  private analyzeImage(image: string | undefined, issues: SEOIssue[], recommendations: string[]): void {
    if (!image) {
      issues.push({
        category: 'meta',
        type: 'info',
        message: 'No Open Graph image',
        recommendation: 'Add an Open Graph image for social sharing',
        impact: 'low',
        element: 'meta[property="og:image"]',
      });
      return;
    }

    if (!image.startsWith('http')) {
      issues.push({
        category: 'meta',
        type: 'warning',
        message: 'Image URL should be absolute',
        recommendation: 'Use absolute URL for Open Graph image',
        impact: 'medium',
        element: 'meta[property="og:image"]',
        value: image,
        expected: 'Absolute URL starting with http/https',
      });
    }

    // Check image dimensions (would need actual image analysis)
    if (!image.includes('width') && !image.includes('height')) {
      recommendations.push('Specify image dimensions for better performance');
    }
  }

  private analyzeUrl(url: string | undefined, issues: SEOIssue[]): void {
    if (!url) {
      issues.push({
        category: 'meta',
        type: 'warning',
        message: 'No canonical URL',
        recommendation: 'Add canonical URL to prevent duplicate content',
        impact: 'medium',
        element: 'link[rel="canonical"]',
      });
      return;
    }

    if (url.includes('?')) {
      issues.push({
        category: 'meta',
        type: 'info',
        message: 'URL contains query parameters',
        recommendation: 'Consider using clean URLs for better SEO',
        impact: 'low',
        element: 'url',
        value: url,
      });
    }

    if (url.length > 100) {
      issues.push({
        category: 'meta',
        type: 'warning',
        message: 'URL is very long',
        recommendation: 'Consider shortening URL',
        impact: 'low',
        element: 'url',
        value: url,
      });
    }
  }

  private analyzeStructuredData(structuredData: Record<string, unknown> | undefined, issues: SEOIssue[]): boolean {
    if (!structuredData) {
      issues.push({
        category: 'structured-data',
        type: 'info',
        message: 'No structured data',
        recommendation: 'Add structured data for rich snippets',
        impact: 'low',
        element: 'script[type="application/ld+json"]',
      });
      return false;
    }

    if (!structuredData['@context']) {
      issues.push({
        category: 'structured-data',
        type: 'warning',
        message: 'Missing @context in structured data',
        recommendation: 'Add @context property to structured data',
        impact: 'medium',
        element: 'script[type="application/ld+json"]',
      });
    }

    if (!structuredData['@type']) {
      issues.push({
        category: 'structured-data',
        type: 'warning',
        message: 'Missing @type in structured data',
        recommendation: 'Add @type property to structured data',
        impact: 'medium',
        element: 'script[type="application/ld+json"]',
      });
    }

    return true;
  }

  private analyzeMetaTags(metadata: SEOMetadata, issues: SEOIssue[], recommendations: string[]): Array<{
    name?: string;
    property?: string;
    content: string;
    status: 'present' | 'missing' | 'invalid';
  }> {
    const metaTags: Array<{
      name?: string;
      property?: string;
      content: string;
      status: 'present' | 'missing' | 'invalid';
    }> = [];

    // Check essential meta tags
    const essentialTags = [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: metadata.title || '' },
      { property: 'og:description', content: metadata.description || '' },
      { property: 'og:type', content: metadata.type || 'website' },
      { property: 'og:url', content: metadata.url || '' },
      { name: 'twitter:card', content: metadata.twitterCard || 'summary' },
    ];

    essentialTags.forEach(tag => {
      const status = tag.content ? 'present' : 'missing';
      metaTags.push({
        ...tag,
        status,
      });

      if (status === 'missing') {
        issues.push({
          category: 'meta',
          type: 'warning',
          message: `Missing ${tag.name || tag.property} meta tag`,
          recommendation: `Add ${tag.name || tag.property} meta tag`,
          impact: 'medium',
          element: `meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`,
        });
        recommendations.push(`Add ${tag.name || tag.property} meta tag`);
      }
    });

    return metaTags;
  }

  private calculateTitleScore(title: string | undefined): number {
    if (!title) return 30;
    if (title.length < this.MIN_TITLE_LENGTH) return 15;
    if (title.length > this.MAX_TITLE_LENGTH) return 10;
    return 0;
  }

  private calculateDescriptionScore(description: string | undefined): number {
    if (!description) return 25;
    if (description.length < this.MIN_DESCRIPTION_LENGTH) return 10;
    if (description.length > this.MAX_DESCRIPTION_LENGTH) return 5;
    return 0;
  }

  private calculateKeywordsScore(keywords: string[] | undefined): number {
    if (!keywords || keywords.length === 0) return 5;
    if (keywords.length > this.MAX_KEYWORDS) return 10;
    return 0;
  }

  private calculateImageScore(image: string | undefined): number {
    if (!image) return 5;
    if (!image.startsWith('http')) return 3;
    return 0;
  }

  private calculateUrlScore(url: string | undefined): number {
    if (!url) return 10;
    if (url.includes('?')) return 2;
    if (url.length > 100) return 3;
    return 0;
  }

  private calculateMetaTagsScore(metaTags: Array<{ status: string }>): number {
    const missingTags = metaTags.filter(tag => tag.status === 'missing').length;
    return missingTags * 5;
  }

  private calculatePerformanceScore(metadata: SEOMetadata): number {
    let score = 100;
    
    // Check for performance-related issues
    if (metadata.image && !metadata.image.includes('width')) score -= 10;
    if (metadata.structuredData && Object.keys(metadata.structuredData).length > 20) score -= 5;
    
    return Math.max(0, score);
  }

  private calculateAccessibilityScore(metadata: SEOMetadata): number {
    let score = 100;
    
    // Check for accessibility-related issues
    if (!metadata.title) score -= 20;
    if (!metadata.description) score -= 15;
    if (metadata.title && metadata.title.length > this.MAX_TITLE_LENGTH) score -= 5;
    
    return Math.max(0, score);
  }

  private getCoreWebVitals(): { lcp?: number; fid?: number; cls?: number; fcp?: number; ttfb?: number } {
    // This would integrate with actual Core Web Vitals measurement
    return {
      lcp: Math.random() * 2.5,
      fid: Math.random() * 100,
      cls: Math.random() * 0.1,
      fcp: Math.random() * 1.8,
      ttfb: Math.random() * 600,
    };
  }
}

// Singleton instance
export const seoAnalysisService = new SEOAnalysisService();
