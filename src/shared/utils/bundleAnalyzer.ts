/**
 * Bundle analyzer utility for development insights
 * Helps identify optimization opportunities and monitor chunk loading
 */

export interface ChunkInfo {
  name: string;
  size?: number;
  loadTime: number;
  timestamp: Date;
  error?: string;
}

export interface BundleStats {
  totalChunks: number;
  totalSize: number;
  averageLoadTime: number;
  failedChunks: number;
  chunks: ChunkInfo[];
}

class BundleAnalyzer {
  private chunks: Map<string, ChunkInfo> = new Map();
  private observers: Set<(stats: BundleStats) => void> = new Set();

  constructor() {
    if (import.meta.env.MODE === 'development') {
      this.setupPerformanceObserver();
      this.logInitialStats();
    }
  }

  /**
   * Record a chunk load event
   */
  recordChunkLoad(name: string, loadTime: number, size?: number, error?: string): void {
    const chunkInfo: ChunkInfo = {
      name,
      size,
      loadTime,
      timestamp: new Date(),
      error,
    };

    this.chunks.set(name, chunkInfo);
    this.notifyObservers();

    if (import.meta.env.MODE === 'development') {
      if (error) {
        console.error(`❌ Chunk load failed: ${name}`, error);
      } else {
        console.log(`✅ Chunk loaded: ${name} (${loadTime.toFixed(2)}ms${size ? `, ${(size / 1024).toFixed(2)}KB` : ''})`);
      }
    }
  }

  /**
   * Get current bundle statistics
   */
  getStats(): BundleStats {
    const chunks = Array.from(this.chunks.values());
    const successfulChunks = chunks.filter(c => !c.error);
    const totalSize = successfulChunks.reduce((sum, chunk) => sum + (chunk.size || 0), 0);
    const averageLoadTime = successfulChunks.length > 0 
      ? successfulChunks.reduce((sum, chunk) => sum + chunk.loadTime, 0) / successfulChunks.length 
      : 0;

    return {
      totalChunks: chunks.length,
      totalSize,
      averageLoadTime,
      failedChunks: chunks.filter(c => c.error).length,
      chunks,
    };
  }

  /**
   * Get performance insights
   */
  getInsights(): {
    slowChunks: ChunkInfo[];
    largeChunks: ChunkInfo[];
    failedChunks: ChunkInfo[];
    recommendations: string[];
  } {
    const stats = this.getStats();
    const slowChunks = stats.chunks
      .filter(c => !c.error && c.loadTime > 1000)
      .sort((a, b) => b.loadTime - a.loadTime);
    
    const largeChunks = stats.chunks
      .filter(c => c.size && c.size > 100 * 1024) // >100KB
      .sort((a, b) => (b.size || 0) - (a.size || 0));
    
    const failedChunks = stats.chunks.filter(c => c.error);

    const recommendations: string[] = [];
    
    if (slowChunks.length > 0) {
      recommendations.push(`Consider optimizing ${slowChunks.length} slow-loading chunks`);
    }
    
    if (largeChunks.length > 0) {
      recommendations.push(`Consider code splitting for ${largeChunks.length} large chunks`);
    }
    
    if (stats.totalSize > 1024 * 1024) { // >1MB
      recommendations.push('Total bundle size is large, consider further code splitting');
    }
    
    if (stats.averageLoadTime > 500) {
      recommendations.push('Average chunk load time is high, check network conditions or chunk sizes');
    }

    return {
      slowChunks,
      largeChunks,
      failedChunks,
      recommendations,
    };
  }

  /**
   * Subscribe to bundle statistics updates
   */
  subscribe(observer: (stats: BundleStats) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  /**
   * Log current statistics to console
   */
  logStats(): void {
    if (import.meta.env.MODE !== 'development') return;

    const stats = this.getStats();
    const insights = this.getInsights();

    console.group('📊 Bundle Analytics');
    console.log(`Total Chunks: ${stats.totalChunks}`);
    console.log(`Total Size: ${(stats.totalSize / 1024).toFixed(2)}KB`);
    console.log(`Average Load Time: ${stats.averageLoadTime.toFixed(2)}ms`);
    console.log(`Failed Chunks: ${stats.failedChunks}`);

    if (insights.slowChunks.length > 0) {
      console.group('🐌 Slow Chunks (>1s)');
      insights.slowChunks.forEach(chunk => {
        console.log(`${chunk.name}: ${chunk.loadTime.toFixed(2)}ms`);
      });
      console.groupEnd();
    }

    if (insights.largeChunks.length > 0) {
      console.group('📦 Large Chunks (>100KB)');
      insights.largeChunks.forEach(chunk => {
        console.log(`${chunk.name}: ${((chunk.size || 0) / 1024).toFixed(2)}KB`);
      });
      console.groupEnd();
    }

    if (insights.recommendations.length > 0) {
      console.group('💡 Recommendations');
      insights.recommendations.forEach(rec => {
        console.log(`• ${rec}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Export stats as JSON for external analysis
   */
  exportStats(): string {
    return JSON.stringify(this.getStats(), null, 2);
  }

  /**
   * Clear all recorded data
   */
  clear(): void {
    this.chunks.clear();
    this.notifyObservers();
  }

  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      // Observe navigation timing
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordChunkLoad(
              'initial-page',
              navEntry.loadEventEnd - navEntry.loadEventStart,
              undefined,
              navEntry.loadEventEnd === 0 ? 'Navigation failed' : undefined
            );
          }
          
          // Track resource loading (for chunk files)
          if (entry.entryType === 'resource' && entry.name.includes('assets/')) {
            const fileName = entry.name.split('/').pop()?.split('-')[0] || 'unknown';
            this.recordChunkLoad(
              fileName,
              entry.duration,
              entry.transferSize
            );
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  private logInitialStats(): void {
    // Log stats after initial page load
    setTimeout(() => {
      this.logStats();
    }, 2000);

    // Log stats periodically in development
    if (import.meta.env.MODE === 'development') {
      setInterval(() => {
        const stats = this.getStats();
        if (stats.totalChunks > 0) {
          console.log(`📊 Bundle Update: ${stats.totalChunks} chunks, ${(stats.totalSize / 1024).toFixed(2)}KB total`);
        }
      }, 30000); // Every 30 seconds
    }
  }

  private notifyObservers(): void {
    const stats = this.getStats();
    this.observers.forEach(observer => observer(stats));
  }
}

// Singleton instance
export const bundleAnalyzer = new BundleAnalyzer();

// Development-only global access
if (import.meta.env.MODE === 'development' && typeof window !== 'undefined') {
  (window as Record<string, unknown>).__bundleAnalyzer = bundleAnalyzer;
  console.log('💡 Bundle analyzer available at window.__bundleAnalyzer');
}

export default bundleAnalyzer;
