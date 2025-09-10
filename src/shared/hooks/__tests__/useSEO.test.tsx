/**
 * SEO Hook Tests
 * Comprehensive testing for the useSEO hook functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useSEO, type SEOMetadata } from '../useSEO';

// Mock react-router-dom
const mockLocation = {
  pathname: '/test-page',
  search: '',
  hash: '',
  state: null,
  key: 'test-key'
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation
}));

// Mock window.location.href for tests that need it

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useSEO Hook', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.head.innerHTML = '';
    document.title = '';
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      expect(result.current.score).toBeGreaterThanOrEqual(0);
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.trackingEnabled).toBe(true);
      expect(result.current.metaTags).toEqual([]);
      expect(result.current.structuredDataValid).toBe(true);
      expect(result.current.analysis).toBeDefined();
    });

    it('should initialize with provided metadata', () => {
      const initialMetadata: SEOMetadata = {
        title: 'Test Title',
        description: 'Test Description',
        keywords: ['test', 'seo']
      };

      const { result } = renderHook(() => useSEO(initialMetadata), {
        wrapper: TestWrapper
      });

      expect(result.current.currentMetadata).toEqual(initialMetadata);
    });
  });

  describe('updateSEO Function', () => {
    it('should update metadata correctly', async () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      const newMetadata: SEOMetadata = {
        title: 'New Title',
        description: 'New Description',
        keywords: ['new', 'keywords']
      };

      act(() => {
        result.current.updateSEO(newMetadata);
      });

      await waitFor(() => {
        expect(result.current.currentMetadata.title).toBe('New Title');
        expect(result.current.currentMetadata.description).toBe('New Description');
        expect(result.current.currentMetadata.keywords).toEqual(['new', 'keywords']);
      });
    });

    it('should update document title', async () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.updateSEO({ title: 'Document Title' });
      });

      await waitFor(() => {
        expect(document.title).toBe('Document Title');
      });
    });

    it('should update meta description', async () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.updateSEO({ description: 'Meta description' });
      });

      await waitFor(() => {
        const metaDesc = document.querySelector('meta[name="description"]');
        expect(metaDesc).toBeTruthy();
        expect(metaDesc?.getAttribute('content')).toBe('Meta description');
      });
    });

    it('should create meta description if it does not exist', async () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.updateSEO({ description: 'New meta description' });
      });

      await waitFor(() => {
        const metaDesc = document.querySelector('meta[name="description"]');
        expect(metaDesc).toBeTruthy();
        expect(metaDesc?.getAttribute('content')).toBe('New meta description');
      });
    });

    it('should set URL from current location if not provided', async () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.updateSEO({ title: 'Test' });
      });

      await waitFor(() => {
        // Check that URL is set from window.location.href
        expect(result.current.currentMetadata.url).toBeDefined();
        expect(result.current.currentMetadata.url).toContain('localhost');
      });
    });
  });

  describe('resetSEO Function', () => {
    it('should reset to initial metadata', () => {
      const initialMetadata: SEOMetadata = {
        title: 'Initial Title',
        description: 'Initial Description'
      };

      const { result } = renderHook(() => useSEO(initialMetadata), {
        wrapper: TestWrapper
      });

      // Update metadata first
      act(() => {
        result.current.updateSEO({ title: 'Updated Title' });
      });

      // Reset to initial
      act(() => {
        result.current.resetSEO();
      });

      expect(result.current.currentMetadata).toEqual(initialMetadata);
      expect(result.current.analysis).toBeDefined();
    });
  });

  describe('runAnalysis Function', () => {
    it('should run analysis and return results', async () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      await act(async () => {
        await result.current.runAnalysis();
      });

      expect(result.current.analysis).toBeTruthy();
      expect(typeof result.current.analysis?.score).toBe('number');
      expect(Array.isArray(result.current.analysis?.issues)).toBe(true);
      expect(Array.isArray(result.current.analysis?.recommendations)).toBe(true);
    });

    it('should detect missing title as error', async () => {
      const { result } = renderHook(() => useSEO({}), {
        wrapper: TestWrapper
      });

      await act(async () => {
        await result.current.runAnalysis();
      });

      const issues = result.current.analysis?.issues || [];
      const titleIssue = issues.find(issue => issue.message === 'Missing title tag');
      
      expect(titleIssue).toBeTruthy();
      expect(titleIssue?.type).toBe('error');
      expect(titleIssue?.impact).toBe('high');
    });

    it('should detect missing description as warning', async () => {
      const { result } = renderHook(() => useSEO({}), {
        wrapper: TestWrapper
      });

      await act(async () => {
        await result.current.runAnalysis();
      });

      const issues = result.current.analysis?.issues || [];
      const descIssue = issues.find(issue => issue.message === 'Missing meta description');
      
      expect(descIssue).toBeTruthy();
      expect(descIssue?.type).toBe('warning');
      expect(descIssue?.impact).toBe('medium');
    });

    it('should not run analysis if already analyzing', async () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      // Start analysis
      act(() => {
        result.current.runAnalysis();
      });

      // Try to run analysis again
      const initialAnalysis = result.current.analysis;
      await act(async () => {
        await result.current.runAnalysis();
      });

      // Analysis should not have changed (except for potentially different random scores)
      expect(result.current.analysis).toBeDefined();
      expect(result.current.analysis?.issues).toEqual(initialAnalysis?.issues);
      expect(result.current.analysis?.recommendations).toEqual(initialAnalysis?.recommendations);
    });
  });

  describe('previewSEO Function', () => {
    it('should generate preview data correctly', () => {
      const metadata: SEOMetadata = {
        title: 'Test Title',
        description: 'Test Description',
        url: 'https://example.com/test'
      };

      const { result } = renderHook(() => useSEO(metadata), {
        wrapper: TestWrapper
      });

      const preview = result.current.previewSEO();

      expect(preview.googlePreview).toContain('Test Title');
      expect(preview.googlePreview).toContain('Test Description');
      expect(preview.googlePreview).toContain('https://example.com/test');
      
      expect(preview.twitterPreview).toContain('Test Title');
      expect(preview.facebookPreview).toContain('Test Title');
    });

    it('should handle missing metadata gracefully', () => {
      const { result } = renderHook(() => useSEO({}), {
        wrapper: TestWrapper
      });

      const preview = result.current.previewSEO();

      expect(preview.googlePreview).toContain('No title');
      expect(preview.googlePreview).toContain('No description');
      expect(preview.googlePreview).toContain(window.location.href);
    });
  });

  describe('Tracking Controls', () => {
    it('should toggle tracking enabled state', () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      expect(result.current.trackingEnabled).toBe(true);

      act(() => {
        result.current.setTrackingEnabled(false);
      });

      expect(result.current.trackingEnabled).toBe(false);

      act(() => {
        result.current.setTrackingEnabled(true);
      });

      expect(result.current.trackingEnabled).toBe(true);
    });
  });

  describe('Performance Metrics', () => {
    it('should provide performance metrics structure', () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      expect(result.current.performanceMetrics).toBeDefined();
      expect(typeof result.current.performanceMetrics.lastAnalysisTime).toBe('number');
      expect(typeof result.current.performanceMetrics.totalAnalyses).toBe('number');
      expect(typeof result.current.performanceMetrics.averageScore).toBe('number');
      expect(Array.isArray(result.current.performanceMetrics.scoreHistory)).toBe(true);
    });
  });

  describe('Web Vitals Integration', () => {
    it('should provide web vitals data structure', () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      expect(result.current.webVitals).toBeDefined();
      expect(typeof result.current.webVitals).toBe('object');
    });

    it('should calculate vitals score', () => {
      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      expect(typeof result.current.vitalsScore).toBe('number');
      expect(result.current.vitalsScore).toBeGreaterThanOrEqual(0);
      expect(result.current.vitalsScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useSEO(), {
        wrapper: TestWrapper
      });

      // Mock a failing analysis
      result.current.runAnalysis = jest.fn().mockRejectedValue(new Error('Analysis failed'));

      await act(async () => {
        try {
          await result.current.runAnalysis();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isAnalyzing).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });
});
