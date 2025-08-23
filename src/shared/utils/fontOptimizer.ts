/**
 * Font and Asset Optimization System
 * Handles font loading strategies, asset compression, and CDN integration
 */

// FontFaceObserver type for font loading monitoring
interface FontFaceObserver {
  load(): Promise<void>;
}

export interface FontConfig {
  family: string;
  weights: number[];
  styles: string[];
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload?: boolean;
  fallback?: string;
  unicodeRange?: string;
}

export interface AssetOptimizationConfig {
  enableWebP: boolean;
  enableAVIF: boolean;
  compressionLevel: number;
  lazyLoading: boolean;
  criticalImages: string[];
}

class FontOptimizer {
  private loadedFonts: Set<string> = new Set();
  private fontObserver: FontFaceObserver | null = null;
  private preloadedFonts: Set<string> = new Set();

  /**
   * Initialize font optimization
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Preload critical fonts
    this.preloadCriticalFonts();
    
    // Set up font display optimization
    this.optimizeFontDisplay();
    
    // Monitor font loading performance
    this.monitorFontLoading();
    
    console.log('[Font Optimizer] Initialized');
  }

  /**
   * Preload critical fonts for better performance
   */
  preloadCriticalFonts(): void {
    // Use simplified approach to avoid compilation issues
    this.loadGoogleFontsCSS();
  }

  /**
   * Load Google Fonts CSS in a simple, reliable way
   */
  private loadGoogleFontsCSS(): void {
    // Combined Inter and Playfair Display in single request
    const fontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400&display=swap';
    
    // Check if already loaded
    if (document.querySelector(`link[href="${fontUrl}"]`)) {
      console.log('[Font Optimizer] Fonts already loaded');
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.media = 'print';
    link.onload = function() {
      this.media = 'all';
      console.log('[Font Optimizer] Google Fonts loaded successfully');
    };
    
    // Add error handling
    link.onerror = () => {
      console.warn('[Font Optimizer] Could not load Google Fonts, using system fonts');
    };

    document.head.appendChild(link);
  }

  /**
   * Load fonts in batches to reduce individual requests
   */
  private loadFontsAsBatch(fonts: FontConfig[]): void {
    // Group fonts by family to create combined requests
    const fontGroups = fonts.reduce((groups, font) => {
      if (!groups[font.family]) {
        groups[font.family] = { weights: new Set(), styles: new Set(), config: font };
      }
      font.weights.forEach(weight => groups[font.family].weights.add(weight));
      font.styles.forEach(style => groups[font.family].styles.add(style));
      return groups;
    }, {} as Record<string, { weights: Set<number>; styles: Set<string>; config: FontConfig }>);

    // Load each font family as a batch
    Object.entries(fontGroups).forEach(([family, group]) => {
      this.loadFontFamilyBatch(group.config, Array.from(group.weights), Array.from(group.styles));
    });
  }

  /**
   * Load all variants of a font family in a single request
   */
  private loadFontFamilyBatch(font: FontConfig, weights: number[], styles: string[]): void {
    const fontUrl = this.generateBatchFontUrl(font, weights, styles);
    const fontKey = `${font.family}-batch`;
    
    if (this.preloadedFonts.has(fontKey)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.media = 'print';
    link.onload = function() {
      this.media = 'all';
    };
    
    // Add error handling with less verbose logging
    link.onerror = () => {
      if (import.meta.env?.MODE === 'development') {
        console.warn(`[Font Optimizer] Could not load ${font.family} fonts, falling back to system fonts`);
      }
    };

    document.head.appendChild(link);
    this.preloadedFonts.add(fontKey);
    
    console.log(`[Font Optimizer] Loading ${font.family} batch with ${weights.length} weights`);
  }

  /**
   * Generate URL for batch loading multiple font variants
   */
  private generateBatchFontUrl(font: FontConfig, weights: number[], styles: string[]): string {
    const baseUrl = 'https://fonts.googleapis.com/css2';
    const fontFamily = font.family.replace(/\s+/g, '+');
    
    // Create font specification for multiple weights and styles
    let fontSpec = `${fontFamily}:`;
    
    const hasItalic = styles.includes('italic');
    const hasNormal = styles.includes('normal');
    
    if (hasItalic && hasNormal) {
      // Both normal and italic
      const weightList = weights.join(';');
      fontSpec += `ital,wght@0,${weightList};1,${weightList}`;
    } else if (hasItalic) {
      // Only italic
      fontSpec += `ital,wght@1,${weights.join(';1,')}`;
    } else {
      // Only normal
      fontSpec += `wght@${weights.join(';')}`;
    }
    
    const params = new URLSearchParams({
      family: fontSpec,
      display: font.display,
    });

    if (font.unicodeRange) {
      params.append('subset', font.unicodeRange);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Preload a specific font by loading CSS properly
   */
  preloadFont(font: FontConfig): void {
    font.weights.forEach(weight => {
      font.styles.forEach(style => {
        const fontKey = `${font.family}-${weight}-${style}`;
        
        if (this.preloadedFonts.has(fontKey)) return;

        // Load font CSS instead of trying to preload as font file
        this.loadFontCSS(font, weight, style);
        this.preloadedFonts.add(fontKey);

        console.log(`[Font Optimizer] Preloaded: ${fontKey}`);
      });
    });
  }

  /**
   * Load font CSS dynamically
   */
  private loadFontCSS(font: FontConfig, weight: number, style: string): void {
    const fontUrl = this.generateFontUrl(font, weight, style);
    
    // Check if this CSS is already loaded
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.media = 'print';
    link.onload = function() {
      this.media = 'all';
    };
    
    // Add error handling
    link.onerror = (error) => {
      console.error(`[Font Optimizer] Failed to load font CSS: ${fontUrl}`, error);
    };

    document.head.appendChild(link);
  }

  /**
   * Generate optimized font URL (Google Fonts with optimization parameters)
   */
  private generateFontUrl(font: FontConfig, weight: number, style: string): string {
    const baseUrl = 'https://fonts.googleapis.com/css2';
    const fontFamily = font.family.replace(/\s+/g, '+');
    
    // Proper Google Fonts API v2 format - fixed URL generation
    let fontSpec: string;
    
    if (style === 'italic') {
      fontSpec = `${fontFamily}:ital,wght@1,${weight}`;
    } else {
      fontSpec = `${fontFamily}:wght@${weight}`;
    }
    
    const params = new URLSearchParams({
      family: fontSpec,
      display: font.display,
    });

    if (font.unicodeRange) {
      params.append('subset', font.unicodeRange);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Optimize font display strategy
   */
  private optimizeFontDisplay(): void {
    // Add CSS for font-display optimization
    const style = document.createElement('style');
    style.textContent = `
      /* Font display optimization */
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Playfair Display';
        font-display: swap;
      }
      
      /* System font fallbacks for better FOUT handling */
      .font-inter {
        font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      }
      
      .font-playfair {
        font-family: 'Playfair Display', ui-serif, Georgia, Cambria, serif;
      }
      
      /* Prevent layout shift during font loading */
      body {
        font-feature-settings: "kern" 1;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Monitor font loading performance
   */
  private monitorFontLoading(): void {
    if (!('fonts' in document)) return;

    document.fonts.ready.then(() => {
      console.log('[Font Optimizer] All fonts loaded');
      
      // Report font loading metrics
      if (import.meta.env?.MODE === 'development') {
        document.fonts.forEach(font => {
          console.log(`[Font Optimizer] Font loaded: ${font.family} ${font.weight} ${font.style}`);
        });
      }
    });

    // Monitor individual font loads
    document.fonts.addEventListener('loadingdone', (event) => {
      event.fontfaces.forEach(font => {
        const fontKey = `${font.family}-${font.weight}-${font.style}`;
        if (!this.loadedFonts.has(fontKey)) {
          this.loadedFonts.add(fontKey);
          console.log(`[Font Optimizer] Font loaded: ${fontKey}`);
        }
      });
    });

    document.fonts.addEventListener('loadingerror', (event) => {
      event.fontfaces.forEach(font => {
        console.error(`[Font Optimizer] Font failed to load: ${font.family}`);
      });
    });
  }

  /**
   * Get font loading status
   */
  getFontStatus(): { loaded: string[]; pending: number } {
    return {
      loaded: Array.from(this.loadedFonts),
      pending: document.fonts?.size || 0,
    };
  }
}

/**
 * Asset Optimization utilities
 */
class AssetOptimizer {
  private supportedFormats: {
    webp: boolean;
    avif: boolean;
  } = {
    webp: false,
    avif: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectImageSupport();
    }
  }

  /**
   * Detect browser support for modern image formats
   */
  private async detectImageSupport(): Promise<void> {
    // Test WebP support
    const webpSupport = await this.testImageSupport('webp', 'data:image/webp;base64,UklGRhIAAABXRUJQVlA4TAYAAAAvQUxHAAAA');
    this.supportedFormats.webp = webpSupport;

    // Test AVIF support
    const avifSupport = await this.testImageSupport('avif', 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQ==');
    this.supportedFormats.avif = avifSupport;

    console.log('[Asset Optimizer] Image format support:', this.supportedFormats);
  }

  /**
   * Test if browser supports a specific image format
   */
  private testImageSupport(format: string, testImage: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width > 0 && img.height > 0);
      img.onerror = () => resolve(false);
      img.src = testImage;
    });
  }

  /**
   * Get optimized image URL based on browser support
   */
  getOptimizedImageUrl(originalUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}): string {
    const { width, height, quality = 85, format = 'auto' } = options;

    // For development, return original URL
    if (import.meta.env?.MODE === 'development') {
      return originalUrl;
    }

    // Determine best format
    let targetFormat = format;
    if (format === 'auto') {
      if (this.supportedFormats.avif) {
        targetFormat = 'avif';
      } else if (this.supportedFormats.webp) {
        targetFormat = 'webp';
      } else {
        targetFormat = 'jpeg';
      }
    }

    // Build optimized URL (this would integrate with your CDN/image service)
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    if (targetFormat !== 'auto') params.append('f', targetFormat);

    return `${originalUrl}?${params.toString()}`;
  }

  /**
   * Generate responsive image srcset
   */
  generateSrcSet(originalUrl: string, sizes: number[] = [400, 800, 1200, 1600]): string {
    return sizes
      .map(size => `${this.getOptimizedImageUrl(originalUrl, { width: size })} ${size}w`)
      .join(', ');
  }

  /**
   * Compress and optimize assets at build time
   */
  optimizeAssets(assets: string[]): Promise<{ original: string; optimized: string; savings: number }[]> {
    return Promise.all(assets.map(async (asset) => {
      // This would integrate with build-time asset optimization
      const originalSize = 1000; // Mock size
      const optimizedSize = 600; // Mock optimized size
      
      return {
        original: asset,
        optimized: this.getOptimizedImageUrl(asset),
        savings: ((originalSize - optimizedSize) / originalSize) * 100,
      };
    }));
  }

  /**
   * Get current format support status
   */
  getFormatSupport(): typeof this.supportedFormats {
    return { ...this.supportedFormats };
  }
}

/**
 * CDN Integration utilities
 */
class CDNOptimizer {
  private cdnBaseUrl: string;
  private enabledFeatures: {
    compression: boolean;
    imageOptimization: boolean;
    caching: boolean;
  };

  constructor(cdnBaseUrl: string = '') {
    this.cdnBaseUrl = cdnBaseUrl;
    this.enabledFeatures = {
      compression: true,
      imageOptimization: true,
      caching: true,
    };
  }

  /**
   * Get CDN optimized URL for assets
   */
  getCDNUrl(assetPath: string, options: {
    compression?: boolean;
    cacheTime?: number;
  } = {}): string {
    if (!this.cdnBaseUrl) return assetPath;

    const { compression = true, cacheTime = 31536000 } = options; // 1 year default

    const url = new URL(assetPath, this.cdnBaseUrl);
    
    if (compression) {
      url.searchParams.append('compress', 'true');
    }
    
    url.searchParams.append('cache', cacheTime.toString());
    
    return url.toString();
  }

  /**
   * Preconnect to CDN domains for better performance
   */
  preconnectToCDN(): void {
    if (!this.cdnBaseUrl || typeof document === 'undefined') return;

    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = new URL(this.cdnBaseUrl).origin;
    preconnectLink.crossOrigin = 'anonymous';
    
    document.head.appendChild(preconnectLink);

    console.log(`[CDN Optimizer] Preconnected to: ${this.cdnBaseUrl}`);
  }
}

// Singleton instances
export const fontOptimizer = new FontOptimizer();
export const assetOptimizer = new AssetOptimizer();
export const cdnOptimizer = new CDNOptimizer(import.meta.env?.VITE_CDN_BASE_URL || '');

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  fontOptimizer.init();
  cdnOptimizer.preconnectToCDN();
}

export { FontOptimizer, AssetOptimizer, CDNOptimizer };
export default { fontOptimizer, assetOptimizer, cdnOptimizer };
