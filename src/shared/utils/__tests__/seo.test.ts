/**
 * SEO Utilities Tests
 * Comprehensive testing for SEO utility functions
 */

import { 
  generateStructuredData, 
  updateMetaTags, 
  SEO_CONFIG,
  type SEOMetaTag,
  type SEOData 
} from '../seo';

// Mock window.location.href for tests that need it

describe('SEO Utilities', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.head.innerHTML = '';
    document.title = '';
  });

  describe('SEO_CONFIG', () => {
    it('should have correct default values', () => {
      expect(SEO_CONFIG.defaultTitle).toBe('Optimum Solutions Group');
      expect(SEO_CONFIG.defaultDescription).toBe('Professional services and solutions');
      expect(SEO_CONFIG.siteName).toBe('Optimum Solutions Group');
      expect(SEO_CONFIG.siteUrl).toBe('https://example.com');
      expect(SEO_CONFIG.twitterHandle).toBe('@optimumsolutions');
    });
  });

  describe('generateStructuredData', () => {
    it('should generate basic structured data', () => {
      const data = {
        siteName: 'Test Site',
        url: 'https://test.com'
      };

      const result = generateStructuredData(data);

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Test Site',
        siteName: 'Test Site',
        url: 'https://test.com'
      });
    });

    it('should use default values when not provided', () => {
      const data = {};

      const result = generateStructuredData(data);

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Website',
        url: window.location.href
      });
    });

    it('should include additional properties', () => {
      const data = {
        siteName: 'Test Site',
        url: 'https://test.com',
        description: 'Test description',
        author: 'Test Author'
      };

      const result = generateStructuredData(data);

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Test Site',
        siteName: 'Test Site',
        url: 'https://test.com',
        description: 'Test description',
        author: 'Test Author'
      });
    });

    it('should handle complex nested data', () => {
      const data = {
        siteName: 'Test Site',
        url: 'https://test.com',
        organization: {
          name: 'Test Org',
          address: {
            streetAddress: '123 Test St',
            city: 'Test City'
          }
        }
      };

      const result = generateStructuredData(data);

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Test Site',
        siteName: 'Test Site',
        url: 'https://test.com',
        organization: {
          name: 'Test Org',
          address: {
            streetAddress: '123 Test St',
            city: 'Test City'
          }
        }
      });
    });
  });

  describe('updateMetaTags', () => {
    it('should update document title', () => {
      const seoData: SEOData = {
        title: 'Test Page Title'
      };

      updateMetaTags(seoData);

      expect(document.title).toBe('Test Page Title');
    });

    it('should create and update meta description', () => {
      const seoData: SEOData = {
        description: 'Test meta description'
      };

      updateMetaTags(seoData);

      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc).toBeTruthy();
      expect(metaDesc?.getAttribute('content')).toBe('Test meta description');
    });

    it('should update existing meta description', () => {
      // Create existing meta description
      const existingMeta = document.createElement('meta');
      existingMeta.setAttribute('name', 'description');
      existingMeta.setAttribute('content', 'Old description');
      document.head.appendChild(existingMeta);

      const seoData: SEOData = {
        description: 'New meta description'
      };

      updateMetaTags(seoData);

      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc?.getAttribute('content')).toBe('New meta description');
    });

    it('should handle both title and description', () => {
      const seoData: SEOData = {
        title: 'Test Title',
        description: 'Test Description'
      };

      updateMetaTags(seoData);

      expect(document.title).toBe('Test Title');
      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc?.getAttribute('content')).toBe('Test Description');
    });

    it('should not create meta description if not provided', () => {
      const seoData: SEOData = {
        title: 'Test Title'
      };

      updateMetaTags(seoData);

      expect(document.title).toBe('Test Title');
      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc).toBeNull();
    });

    it('should not update title if not provided', () => {
      const originalTitle = document.title;
      const seoData: SEOData = {
        description: 'Test Description'
      };

      updateMetaTags(seoData);

      expect(document.title).toBe(originalTitle);
      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc?.getAttribute('content')).toBe('Test Description');
    });

    it('should handle empty seoData object', () => {
      const originalTitle = document.title;
      const seoData: SEOData = {};

      updateMetaTags(seoData);

      expect(document.title).toBe(originalTitle);
      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc).toBeNull();
    });

    it('should handle undefined values gracefully', () => {
      // Test with empty object (no properties)
      const seoData: SEOData = {};

      expect(() => updateMetaTags(seoData)).not.toThrow();
    });
  });

  describe('Type Definitions', () => {
    it('should have correct SEOMetaTag interface structure', () => {
      const metaTag: SEOMetaTag = {
        name: 'description',
        content: 'Test content'
      };

      expect(metaTag.name).toBe('description');
      expect(metaTag.content).toBe('Test content');
      expect(metaTag.property).toBeUndefined();
    });

    it('should have correct SEOMetaTag with property', () => {
      const metaTag: SEOMetaTag = {
        property: 'og:title',
        content: 'Test content'
      };

      expect(metaTag.property).toBe('og:title');
      expect(metaTag.content).toBe('Test content');
      expect(metaTag.name).toBeUndefined();
    });

    it('should have correct SEOData interface structure', () => {
      const seoData: SEOData = {
        title: 'Test Title',
        description: 'Test Description',
        keywords: ['test', 'seo'],
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/test'
      };

      expect(seoData.title).toBe('Test Title');
      expect(seoData.description).toBe('Test Description');
      expect(seoData.keywords).toEqual(['test', 'seo']);
      expect(seoData.image).toBe('https://example.com/image.jpg');
      expect(seoData.url).toBe('https://example.com/test');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in title', () => {
      const seoData: SEOData = {
        title: 'Test & Title <with> "special" characters'
      };

      updateMetaTags(seoData);

      expect(document.title).toBe('Test & Title <with> "special" characters');
    });

    it('should handle special characters in description', () => {
      const seoData: SEOData = {
        description: 'Test & Description <with> "special" characters'
      };

      updateMetaTags(seoData);

      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc?.getAttribute('content')).toBe('Test & Description <with> "special" characters');
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);
      const seoData: SEOData = {
        title: longTitle
      };

      updateMetaTags(seoData);

      expect(document.title).toBe(longTitle);
    });

    it('should handle very long description', () => {
      const longDescription = 'A'.repeat(2000);
      const seoData: SEOData = {
        description: longDescription
      };

      updateMetaTags(seoData);

      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc?.getAttribute('content')).toBe(longDescription);
    });

    it('should handle empty strings', () => {
      const seoData: SEOData = {
        title: '',
        description: ''
      };

      updateMetaTags(seoData);

      expect(document.title).toBe('');
      // Empty description should not create a meta tag
      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc).toBeNull();
    });
  });
});
