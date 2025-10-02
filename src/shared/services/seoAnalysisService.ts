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
    if (!metadata || typeof metadata !== 'object') {
      throw new Error('Invalid metadata: expected an object');
    }

    const issues: SEOIssue[] = [];
    let score = 100;

    // Analyze title
    this.analyzeTitle(metadata.title, issues);
    score -= this.calculateTitleScore(metadata.title);

    // Analyze description
    this.analyzeDescription(metadata.description, issues);
    score -= this.calculateDescriptionScore(metadata.description);

    // Analyze keywords
    this.analyzeKeywords(metadata.keywords, issues);
    score -= this.calculateKeywordsScore(metadata.keywords);

    // Analyze image
    this.analyzeImage(metadata.image, issues);
    score -= this.calculateImageScore(metadata.image);

    // Analyze URL
    this.analyzeUrl(metadata.canonicalUrl || metadata.url, issues);
    score -= this.calculateUrlScore(metadata.canonicalUrl || metadata.url);

    // Analyze structured data
    const structuredDataValid: boolean = this.analyzeStructuredData(metadata.structuredData, issues);
    score -= structuredDataValid ? 0 : 10;

    // Analyze meta tags
    const metaTags: Array<{
      name?: string;
      property?: string;
      content: string;
      status: 'present' | 'missing' | 'invalid';
    }> = this.analyzeMetaTags(metadata, issues);
    score -= this.calculateMetaTagsScore(metaTags);

    // Calculate performance and accessibility scores
    const performanceScore: number = this.calculatePerformanceScore(metadata);
    const accessibilityScore: number = this.calculateAccessibilityScore(metadata);

    // Extract recommendations from issues
    const recommendations: string[] = issues.map((issue: SEOIssue) => issue.recommendation);

    const result: SEOAnalysisResult = {
      score: Math.max(0, Math.min(100, score)),
      issues: issues.slice(),
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
      criticalIssues: issues.filter((i: SEOIssue) => i.impact === 'critical').length,
    });

    return result;
  }

  private analyzeTitle(title: string | undefined, issues: SEOIssue[]): void {
    if (!title) {
      issues.push({
        category: 'meta',
        type: 'error',
        message: 'Missing title tag',
        recommendation: 'Add a descriptive title tag',
        impact: 'critical',
        element: 'title',
      });
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

  private analyzeDescription(description: string | undefined, issues: SEOIssue[]): void {
    if (!description) {
      issues.push({
        category: 'meta',
        type: 'error',
        message: 'Missing meta description',
        recommendation: 'Add a compelling meta description',
        impact: 'high',
        element: 'meta[name="description"]',
      });
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
    }
  }

  private analyzeKeywords(keywords: string[] | undefined, issues: SEOIssue[]): void {
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
    }

    // Check for keyword stuffing
    const totalLength: number = keywords.join(' ').length;
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

  private analyzeImage(image: string | undefined, issues: SEOIssue[]): void {
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

    // Validate URL format
    try {
      new URL(image);
    } catch {
      issues.push({
        category: 'meta',
        type: 'error',
        message: 'Invalid image URL format',
        recommendation: 'Use a valid URL format for the Open Graph image',
        impact: 'high',
        element: 'meta[property="og:image"]',
        value: image,
      });
    }

    // Check for image dimension parameters in URL
    const hasWidthParam: boolean = image.includes('width=') || image.includes('w=');
    const hasHeightParam: boolean = image.includes('height=') || image.includes('h=');
    if (!hasWidthParam && !hasHeightParam) {
      issues.push({
        category: 'meta',
        type: 'info',
        message: 'Image dimensions not specified in URL',
        recommendation: 'Add width and height parameters to image URL for better performance',
        impact: 'low',
        element: 'meta[property="og:image"]',
        value: image,
      });
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

    let structuredDataValid = true;

    if (!structuredData['@context']) {
      structuredDataValid = false;
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
      structuredDataValid = false;
      issues.push({
        category: 'structured-data',
        type: 'warning',
        message: 'Missing @type in structured data',
        recommendation: 'Add @type property to structured data',
        impact: 'medium',
        element: 'script[type="application/ld+json"]',
      });
    }

    return structuredDataValid;
  }

  private analyzeMetaTags(metadata: SEOMetadata, issues: SEOIssue[]): Array<{
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
    const essentialTags: Array<{ name?: string; property?: string; content: string }> = [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: metadata.title || '' },
      { property: 'og:description', content: metadata.description || '' },
      { property: 'og:type', content: metadata.type || 'website' },
      { property: 'og:url', content: metadata.url || '' },
      { name: 'twitter:card', content: metadata.twitterCard || 'summary' },
    ];

    essentialTags.forEach((tag: { name?: string; property?: string; content: string }) => {
      const status: 'present' | 'missing' | 'invalid' = tag.content ? 'present' : 'missing';
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
    const missingTags: number = metaTags.filter((tag: { status: string }) => tag.status === 'missing').length;
    return missingTags * 5;
  }

  private calculatePerformanceScore(metadata: SEOMetadata): number {
    let score = 100;

    // Check for performance-related issues
    if (metadata.image) {
      const hasWidthParam: boolean = metadata.image.includes('width=') || metadata.image.includes('w=');
      const hasHeightParam: boolean = metadata.image.includes('height=') || metadata.image.includes('h=');
      if (!hasWidthParam || !hasHeightParam) score -= 10;
    }
    if (metadata.structuredData && Object.keys(metadata.structuredData).length > 20) score -= 5;

    return Math.max(0, score);
  }

  private calculateAccessibilityScore(metadata: SEOMetadata): number {
    let score = 100;

    // Check for accessibility-related issues
    if (!metadata.title) score -= 20;
    if (!metadata.description) score -= 15;
    if (metadata.title && metadata.title.length > this.MAX_TITLE_LENGTH) score -= 5;
    if (metadata.description && metadata.description.length > this.MAX_DESCRIPTION_LENGTH) score -= 5;

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
