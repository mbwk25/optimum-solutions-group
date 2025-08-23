import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { bundleAnalyzer } from './bundleAnalyzer';

/**
 * Enhanced lazy loading with retry capability and better error handling
 */
export const lazyWithRetry = <T extends ComponentType<Record<string, unknown>>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3,
  retryDelay = 1000
): LazyExoticComponent<T> => {
  return lazy(async () => {
    let lastError: Error;
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (i === retries) {
          throw lastError;
        }
        
        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, i) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.warn(`Retry ${i + 1}/${retries} for lazy component import:`, error);
      }
    }
    
    throw lastError!;
  });
};

/**
 * Preload a component for better user experience
 */
export const preloadComponent = <T extends ComponentType<Record<string, unknown>>>(
  componentImport: () => Promise<{ default: T }>
): Promise<{ default: T }> => {
  const modulePromise = componentImport();
  
  // Cache the promise to avoid duplicate imports
  return modulePromise.catch(error => {
    console.error('Failed to preload component:', error);
    throw error;
  });
};

/**
 * Create a lazy component with preloading capabilities
 */
export const lazyWithPreload = <T extends ComponentType<Record<string, unknown>>>(
  componentImport: () => Promise<{ default: T }>,
  preloadCondition?: () => boolean
) => {
  let modulePromise: Promise<{ default: T }> | null = null;
  
  const LazyComponent = lazy(() => {
    if (!modulePromise) {
      modulePromise = componentImport();
    }
    return modulePromise;
  });
  
  // Preload function
  const preload = () => {
    if (!modulePromise) {
      modulePromise = componentImport();
    }
    return modulePromise;
  };
  
  // Auto-preload based on condition
  if (preloadCondition && preloadCondition()) {
    preload();
  }
  
  // Attach preload method to component
  (LazyComponent as Record<string, unknown>).preload = preload;
  
  return LazyComponent;
};

/**
 * Route-based code splitting helper
 */
export const createRouteComponent = <T extends ComponentType<Record<string, unknown>>>(
  importPath: string,
  routeName: string
) => {
  return lazyWithRetry(
    () => import(/* @vite-ignore */ importPath).then(
      module => ({ default: module.default }),
      error => {
        console.error(`Failed to load route component for ${routeName}:`, error);
        throw error;
      }
    ),
    2, // 2 retries for routes
    1500 // Longer delay for routes
  );
};

/**
 * Feature-based code splitting with intelligent preloading
 */
export const createFeatureComponent = <T extends ComponentType<Record<string, unknown>>>(
  featureName: string,
  componentName: string,
  preloadStrategy: 'immediate' | 'hover' | 'viewport' | 'none' = 'none'
) => {
  const importPath = `../../features/${featureName}/${componentName}`;
  
  const LazyComponent = lazyWithPreload(
    () => import(/* @vite-ignore */ importPath),
    preloadStrategy === 'immediate'
  );
  
  // Add metadata for debugging
  (LazyComponent as Record<string, unknown>).displayName = `Lazy${componentName}`;
  (LazyComponent as Record<string, unknown>)._featureName = featureName;
  (LazyComponent as Record<string, unknown>)._componentName = componentName;
  (LazyComponent as Record<string, unknown>)._preloadStrategy = preloadStrategy;
  
  return LazyComponent;
};

/**
 * Bundle analyzer helper - logs chunk information in development
 */
export const logChunkInfo = (chunkName: string, size?: number) => {
  if (import.meta.env.MODE === 'development') {
    console.group(`📦 Chunk Loaded: ${chunkName}`);
    if (size) {
      console.log(`Size: ${(size / 1024).toFixed(2)}KB`);
    }
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.groupEnd();
  }
};

/**
 * Performance-aware lazy loading with metrics
 */
export const lazyWithMetrics = <T extends ComponentType<Record<string, unknown>>>(
  componentImport: () => Promise<{ default: T }>,
  chunkName: string
) => {
  return lazy(async () => {
    const startTime = performance.now();
    
    try {
      const module = await componentImport();
      const loadTime = performance.now() - startTime;
      
      // Record with bundle analyzer
      bundleAnalyzer.recordChunkLoad(chunkName, loadTime);
      
      // Log performance metrics
      if (import.meta.env.MODE === 'development') {
        logChunkInfo(chunkName);
        console.log(`⏱️ Load time: ${loadTime.toFixed(2)}ms`);
      }
      
      // Report to performance monitoring (if available)
      if (typeof window !== 'undefined' && (window as Record<string, unknown>).gtag) {
        (window as Record<string, unknown>).gtag('event', 'chunk_load', {
          chunk_name: chunkName,
          load_time: Math.round(loadTime),
        });
      }
      
      return module;
    } catch (error) {
      const loadTime = performance.now() - startTime;
      
      // Record error with bundle analyzer
      bundleAnalyzer.recordChunkLoad(chunkName, loadTime, undefined, (error as Error).message);
      
      console.error(`Failed to load chunk ${chunkName}:`, error);
      
      // Report error to monitoring
      if (typeof window !== 'undefined' && (window as Record<string, unknown>).gtag) {
        (window as Record<string, unknown>).gtag('event', 'chunk_load_error', {
          chunk_name: chunkName,
          error_message: (error as Error).message,
        });
      }
      
      throw error;
    }
  });
};

/**
 * Utility to get current bundle stats (development only)
 */
export const getBundleStats = () => {
  if (import.meta.env.MODE !== 'development') {
    return null;
  }
  
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const links = Array.from(document.querySelectorAll('link[href]'));
  
  return {
    scripts: scripts.map(script => ({
      src: (script as HTMLScriptElement).src,
      async: (script as HTMLScriptElement).async,
      defer: (script as HTMLScriptElement).defer,
    })),
    stylesheets: links
      .filter(link => (link as HTMLLinkElement).rel === 'stylesheet')
      .map(link => ({
        href: (link as HTMLLinkElement).href,
      })),
    totalScripts: scripts.length,
    totalStylesheets: links.filter(link => (link as HTMLLinkElement).rel === 'stylesheet').length,
  };
};

export default {
  lazyWithRetry,
  preloadComponent,
  lazyWithPreload,
  createRouteComponent,
  createFeatureComponent,
  lazyWithMetrics,
  getBundleStats,
};
