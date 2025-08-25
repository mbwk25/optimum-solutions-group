/**
 * Advanced SEO Utilities
 * Comprehensive SEO analysis, meta tag validation, and structured data handling
 */

import { WebVital } from 'web-vitals';
import { Thing, WithContext, Organization, WebPage, Article } from 'schema-dts';

// ====================================================
// Types and Interfaces
// ====================================================

export interface SEOMetaTag {
  name?: string;
  property?: string;
  content: string;
  required?: boolean;
}

export interface SEOAnalysisResult {
  score: number;
  maxScore: number;
  issues: SEOIssue[];
  recommendations: string[];
  metaTags: {
    found: SEOMetaTag[];
    missing: SEOMetaTag[];
    invalid: SEOMetaTag[];
  };
  structuredData: {
    valid: boolean;
    schemas: string[];
    errors: string[];
  };
  coreWebVitals: {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    fcp: number | null;
    ttfb: number | null;
  };
  accessibility: {
    score: number;
    issues: string[];
  };
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: 'meta' | 'content' | 'technical' | 'performance' | 'accessibility';
  message: string;
  element?: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle?: string;
  facebookAppId?: string;
  organization: Organization;
}

export interface StructuredDataItem {
  '@context'?: string;
  '@type'?: string;
  [key: string]: unknown;
}

// ====================================================
// SEO Configuration
// ====================================================

export const SEO_CONFIG: SEOConfig = {
  siteName: 'Optimum Solutions Group',
  siteUrl: 'https://optimum-solutions-group.vercel.app',
  defaultTitle: 'Optimum Solutions Group - Digital Innovation & Excellence',
  defaultDescription: 'Leading digital solutions provider specializing in web development, cloud architecture, and digital transformation. Delivering innovative technology solutions for modern businesses.',
  defaultImage: '/images/og-image.jpg',
  twitterHandle: '@optimumsolutions',
  organization: {
    '@type': 'Organization',
    name: 'Optimum Solutions Group',
    url: 'https://optimum-solutions-group.vercel.app',
    logo: 'https://optimum-solutions-group.vercel.app/images/logo.png',
    sameAs: [
      'https://linkedin.com/company/optimum-solutions-group',
      'https://twitter.com/optimumsolutions',
      'https://github.com/optimum-solutions-group'
    ]
  }
};

// ====================================================
// Required Meta Tags
// ====================================================

export const REQUIRED_META_TAGS: SEOMetaTag[] = [
  { name: 'description', content: '', required: true },
  { name: 'viewport', content: 'width=device-width, initial-scale=1', required: true },
  { property: 'og:title', content: '', required: true },
  { property: 'og:description', content: '', required: true },
  { property: 'og:type', content: 'website', required: true },
  { property: 'og:url', content: '', required: true },
  { property: 'og:image', content: '', required: true },
  { name: 'twitter:card', content: 'summary_large_image', required: true },
  { name: 'twitter:title', content: '', required: true },
  { name: 'twitter:description', content: '', required: true },
  { name: 'twitter:image', content: '', required: true }
];

// ====================================================
// Meta Tag Validation
// ====================================================

export const validateMetaTags = (document: Document): {
  found: SEOMetaTag[];
  missing: SEOMetaTag[];
  invalid: SEOMetaTag[];
  issues: SEOIssue[];
} => {
  const found: SEOMetaTag[] = [];
  const missing: SEOMetaTag[] = [];
  const invalid: SEOMetaTag[] = [];
  const issues: SEOIssue[] = [];

  // Get all meta tags
  const metaTags = document.querySelectorAll('meta');
  
  metaTags.forEach(tag => {
    const name = tag.getAttribute('name');
    const property = tag.getAttribute('property');
    const content = tag.getAttribute('content') || '';
    
    if (name || property) {
      found.push({ name: name || undefined, property: property || undefined, content });
    }
  });

  // Check for required tags
  REQUIRED_META_TAGS.forEach(requiredTag => {
    const foundTag = found.find(tag => 
      (requiredTag.name && tag.name === requiredTag.name) ||
      (requiredTag.property && tag.property === requiredTag.property)
    );

    if (!foundTag) {
      missing.push(requiredTag);
      issues.push({
        type: 'error',
        category: 'meta',
        message: `Missing required meta tag: ${requiredTag.name || requiredTag.property}`,
        recommendation: `Add <meta ${requiredTag.name ? 'name' : 'property'}="${requiredTag.name || requiredTag.property}" content="..." />`,
        impact: 'high'
      });
    } else {
      // Validate content
      if (!foundTag.content || foundTag.content.trim().length === 0) {
        invalid.push(foundTag);
        issues.push({
          type: 'error',
          category: 'meta',
          message: `Empty content for meta tag: ${foundTag.name || foundTag.property}`,
          recommendation: 'Provide meaningful content for this meta tag',
          impact: 'high'
        });
      } else {
        // Validate length constraints
        if (foundTag.name === 'description' && foundTag.content.length > 160) {
          issues.push({
            type: 'warning',
            category: 'meta',
            message: 'Meta description is too long (>160 characters)',
            recommendation: 'Keep meta description under 160 characters for optimal display',
            impact: 'medium'
          });
        }
        
        if ((foundTag.property === 'og:title' || foundTag.name === 'twitter:title') && foundTag.content.length > 60) {
          issues.push({
            type: 'warning',
            category: 'meta',
            message: 'Social media title is too long (>60 characters)',
            recommendation: 'Keep social media titles under 60 characters',
            impact: 'medium'
          });
        }
      }
    }
  });

  return { found, missing, invalid, issues };
};

// ====================================================
// Structured Data Validation
// ====================================================

export const validateStructuredData = (document: Document): {
  valid: boolean;
  schemas: string[];
  errors: string[];
  data: StructuredDataItem[];
} => {
  const schemas: string[] = [];
  const errors: string[] = [];
  const data: StructuredDataItem[] = [];
  let valid = true;

  // Find all JSON-LD scripts
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  
  jsonLdScripts.forEach((script, index) => {
    try {
      const jsonData = JSON.parse(script.textContent || '');
      data.push(jsonData);
      
      // Detect schema types
      if (jsonData['@type']) {
        schemas.push(jsonData['@type']);
      } else if (Array.isArray(jsonData)) {
        jsonData.forEach(item => {
          if (item['@type']) schemas.push(item['@type']);
        });
      }

      // Basic validation
      if (!jsonData['@context']) {
        errors.push(`JSON-LD script ${index + 1} missing @context`);
        valid = false;
      }
      
      if (!jsonData['@type']) {
        errors.push(`JSON-LD script ${index + 1} missing @type`);
        valid = false;
      }

    } catch (error) {
      errors.push(`Invalid JSON-LD syntax in script ${index + 1}: ${error}`);
      valid = false;
    }
  });

  return { valid, schemas: [...new Set(schemas)], errors, data };
};

// ====================================================
// Core Web Vitals Tracking
// ====================================================

export class CoreWebVitalsTracker {
  private static instance: CoreWebVitalsTracker;
  private vitals: Map<string, WebVital> = new Map();
  private callbacks: Array<(vital: WebVital) => void> = [];

  static getInstance(): CoreWebVitalsTracker {
    if (!CoreWebVitalsTracker.instance) {
      CoreWebVitalsTracker.instance = new CoreWebVitalsTracker();
    }
    return CoreWebVitalsTracker.instance;
  }

  private constructor() {
    this.initializeWebVitals();
  }

  private async initializeWebVitals() {
    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

      getCLS(this.handleVital.bind(this));
      getFID(this.handleVital.bind(this));
      getFCP(this.handleVital.bind(this));
      getLCP(this.handleVital.bind(this));
      getTTFB(this.handleVital.bind(this));
    } catch (error) {
      console.warn('Web Vitals library not available:', error);
    }
  }

  private handleVital(vital: WebVital) {
    this.vitals.set(vital.name, vital);
    this.callbacks.forEach(callback => callback(vital));
    
    // Send to analytics if configured
    if (typeof gtag !== 'undefined') {
      gtag('event', vital.name, {
        value: Math.round(vital.name === 'CLS' ? vital.value * 1000 : vital.value),
        event_category: 'Web Vitals',
        event_label: vital.id,
        non_interaction: true,
      });
    }
  }

  public subscribe(callback: (vital: WebVital) => void) {
    this.callbacks.push(callback);
  }

  public getVitals() {
    return Object.fromEntries(this.vitals);
  }

  public getVitalValue(name: string): number | null {
    const vital = this.vitals.get(name);
    return vital ? vital.value : null;
  }
}

// ====================================================
// SEO Score Calculation
// ====================================================

export const calculateSEOScore = (
  metaAnalysis: ReturnType<typeof validateMetaTags>,
  structuredDataAnalysis: ReturnType<typeof validateStructuredData>,
  coreWebVitals: CoreWebVitalsTracker,
  document: Document
): SEOAnalysisResult => {
  let score = 0;
  const maxScore = 100;
  const recommendations: string[] = [];
  const allIssues = [...metaAnalysis.issues];

  // Meta tags scoring (30 points)
  const metaScore = Math.max(0, 30 - (metaAnalysis.missing.length * 5) - (metaAnalysis.invalid.length * 3));
  score += metaScore;

  // Structured data scoring (20 points)
  let structuredDataScore = 0;
  if (structuredDataAnalysis.schemas.length > 0) {
    structuredDataScore = structuredDataAnalysis.valid ? 20 : 10;
  }
  score += structuredDataScore;

  // Content analysis (25 points)
  const title = document.querySelector('title')?.textContent || '';
  const h1Elements = document.querySelectorAll('h1');
  const imgElements = document.querySelectorAll('img');
  
  let contentScore = 0;
  
  // Title analysis
  if (title.length > 0 && title.length <= 60) {
    contentScore += 5;
  } else {
    allIssues.push({
      type: title.length === 0 ? 'error' : 'warning',
      category: 'content',
      message: title.length === 0 ? 'Missing page title' : 'Page title too long (>60 characters)',
      recommendation: 'Provide a concise, descriptive title (30-60 characters)',
      impact: 'high'
    });
  }

  // H1 analysis
  if (h1Elements.length === 1) {
    contentScore += 5;
  } else {
    allIssues.push({
      type: h1Elements.length === 0 ? 'error' : 'warning',
      category: 'content',
      message: h1Elements.length === 0 ? 'Missing H1 tag' : 'Multiple H1 tags found',
      recommendation: 'Use exactly one H1 tag per page for optimal SEO',
      impact: 'medium'
    });
  }

  // Image alt text analysis
  const imagesWithoutAlt = Array.from(imgElements).filter(img => !img.getAttribute('alt'));
  if (imagesWithoutAlt.length === 0 && imgElements.length > 0) {
    contentScore += 5;
  } else if (imagesWithoutAlt.length > 0) {
    allIssues.push({
      type: 'warning',
      category: 'accessibility',
      message: `${imagesWithoutAlt.length} images missing alt text`,
      recommendation: 'Add descriptive alt text to all images for accessibility and SEO',
      impact: 'medium'
    });
  }

  // Content length check
  const bodyText = document.body?.textContent || '';
  if (bodyText.length >= 300) {
    contentScore += 10;
  } else {
    allIssues.push({
      type: 'warning',
      category: 'content',
      message: 'Page content is too short (<300 characters)',
      recommendation: 'Add more meaningful content to improve SEO value',
      impact: 'medium'
    });
  }

  score += contentScore;

  // Technical SEO (15 points)
  let technicalScore = 0;
  
  // Check for robots meta tag
  const robotsMeta = document.querySelector('meta[name="robots"]');
  if (robotsMeta && !robotsMeta.getAttribute('content')?.includes('noindex')) {
    technicalScore += 3;
  }

  // Check for canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    technicalScore += 3;
  } else {
    allIssues.push({
      type: 'warning',
      category: 'technical',
      message: 'Missing canonical URL',
      recommendation: 'Add a canonical link to prevent duplicate content issues',
      impact: 'medium'
    });
  }

  // Check for language declaration
  const htmlLang = document.documentElement.getAttribute('lang');
  if (htmlLang) {
    technicalScore += 2;
  } else {
    allIssues.push({
      type: 'warning',
      category: 'technical',
      message: 'Missing language declaration',
      recommendation: 'Add lang attribute to <html> element',
      impact: 'low'
    });
  }

  // Check for SSL (assume HTTPS in production)
  if (window.location.protocol === 'https:') {
    technicalScore += 2;
  }

  // Mobile-friendly viewport
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport?.getAttribute('content')?.includes('width=device-width')) {
    technicalScore += 5;
  }

  score += technicalScore;

  // Core Web Vitals scoring (10 points)
  const vitals = coreWebVitals.getVitals();
  let performanceScore = 0;
  
  const lcp = vitals.LCP?.value || null;
  const fid = vitals.FID?.value || null;
  const cls = vitals.CLS?.value || null;
  const fcp = vitals.FCP?.value || null;
  const ttfb = vitals.TTFB?.value || null;

  if (lcp && lcp <= 2500) performanceScore += 3;
  if (fid && fid <= 100) performanceScore += 3;
  if (cls && cls <= 0.1) performanceScore += 4;

  score += performanceScore;

  // Generate recommendations
  if (metaAnalysis.missing.length > 0) {
    recommendations.push('Add missing required meta tags for better social sharing');
  }
  if (!structuredDataAnalysis.valid || structuredDataAnalysis.schemas.length === 0) {
    recommendations.push('Implement structured data markup to enhance search results');
  }
  if (performanceScore < 10) {
    recommendations.push('Improve Core Web Vitals metrics for better user experience and rankings');
  }
  if (contentScore < 20) {
    recommendations.push('Enhance content quality and optimize HTML structure');
  }

  return {
    score: Math.round(score),
    maxScore,
    issues: allIssues,
    recommendations,
    metaTags: metaAnalysis,
    structuredData: structuredDataAnalysis,
    coreWebVitals: {
      lcp,
      fid,
      cls,
      fcp,
      ttfb
    },
    accessibility: {
      score: imagesWithoutAlt.length === 0 ? 100 : Math.max(0, 100 - (imagesWithoutAlt.length * 10)),
      issues: imagesWithoutAlt.length > 0 ? [`${imagesWithoutAlt.length} images missing alt text`] : []
    }
  };
};

// ====================================================
// Structured Data Generators
// ====================================================

export const generateOrganizationSchema = (config: SEOConfig): WithContext<Organization> => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: config.organization.name,
  url: config.organization.url,
  logo: config.organization.logo,
  sameAs: config.organization.sameAs
});

export const generateWebPageSchema = (
  title: string,
  description: string,
  url: string
): WithContext<WebPage> => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url,
  isPartOf: {
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl
  }
});

export const generateArticleSchema = (
  title: string,
  description: string,
  url: string,
  imageUrl: string,
  publishDate: string,
  modifiedDate?: string
): WithContext<Article> => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  url,
  image: imageUrl,
  datePublished: publishDate,
  dateModified: modifiedDate || publishDate,
  author: {
    '@type': 'Organization',
    name: SEO_CONFIG.organization.name
  },
  publisher: {
    '@type': 'Organization',
    name: SEO_CONFIG.organization.name,
    logo: {
      '@type': 'ImageObject',
      url: SEO_CONFIG.organization.logo
    }
  }
});

// ====================================================
// Legacy Functions (Backward Compatibility)
// ====================================================

export const generateStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Optimum Solutions Group",
  "url": "https://optimum-solutions-group.vercel.app",
  "logo": "https://optimum-solutions-group.vercel.app/images/logo.png",
  "description": "Leading digital solutions provider specializing in web development, cloud architecture, and digital transformation",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "hello@optimumsolutions.dev"
  },
  "sameAs": [
    "https://linkedin.com/company/optimum-solutions-group",
    "https://github.com/optimum-solutions-group"
  ],
  "offers": {
    "@type": "Service",
    "serviceType": [
      "Custom Web Development",
      "Mobile App Development", 
      "IoT Solutions",
      "Digital Transformation",
      "Business Automation"
    ]
  },
  "foundingDate": "2024",
  "numberOfEmployees": "10-50",
  "industry": "Technology Services"
});

export const generateBreadcrumbs = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage", 
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// ====================================================
// Utility Functions
// ====================================================

export const generateMetaTitle = (pageTitle: string, siteName: string = SEO_CONFIG.siteName): string => {
  if (pageTitle === siteName) return pageTitle;
  return `${pageTitle} | ${siteName}`;
};

export const truncateDescription = (description: string, maxLength: number = 160): string => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3).trim() + '...';
};

export const sanitizeUrl = (url: string): string => {
  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
};

export const generateRobotsTxt = (sitemapUrl?: string): string => {
  const rules = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Disallow admin areas',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /_next/',
    '',
    '# Allow important files',
    'Allow: /api/sitemap',
    'Allow: /robots.txt',
    'Allow: /sitemap.xml',
  ];

  if (sitemapUrl) {
    rules.push('', `Sitemap: ${sitemapUrl}`);
  }

  return rules.join('\n');
};

export default {
  validateMetaTags,
  validateStructuredData,
  calculateSEOScore,
  CoreWebVitalsTracker,
  generateOrganizationSchema,
  generateWebPageSchema,
  generateArticleSchema,
  generateMetaTitle,
  truncateDescription,
  sanitizeUrl,
  generateRobotsTxt,
  SEO_CONFIG,
  REQUIRED_META_TAGS,
  // Legacy functions for backward compatibility
  generateStructuredData,
  generateBreadcrumbs,
  generateFAQStructuredData
};
