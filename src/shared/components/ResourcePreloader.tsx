import React, { useEffect } from 'react';

interface ResourcePreloaderProps {
  criticalResources?: string[];
  prefetchResources?: string[];
  enableDnsPrefetch?: boolean;
}

/**
 * Preloads critical resources and prefetches non-critical ones for better performance
 */
export const ResourcePreloader: React.FC<ResourcePreloaderProps> = ({
  criticalResources = [],
  prefetchResources = [],
  enableDnsPrefetch = true,
}) => {
  useEffect(() => {
    // Preload critical resources
    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      // Determine resource type based on file extension
      if (resource.match(/\.(woff2?|ttf|eot)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif|svg)$/)) {
        link.as = 'image';
      } else if (resource.match(/\.(css)$/)) {
        link.as = 'style';
      } else if (resource.match(/\.(js)$/)) {
        link.as = 'script';
      }
      
      document.head.appendChild(link);
    });

    // Prefetch non-critical resources when browser is idle
    if ('requestIdleCallback' in window) {
      const prefetchCallback = () => {
        prefetchResources.forEach((resource) => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = resource;
          document.head.appendChild(link);
        });
      };

      requestIdleCallback(prefetchCallback, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        prefetchResources.forEach((resource) => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = resource;
          document.head.appendChild(link);
        });
      }, 1000);
    }

    // DNS prefetch for external domains
    if (enableDnsPrefetch) {
      const externalDomains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdn.jsdelivr.net',
        'unpkg.com',
      ];

      externalDomains.forEach((domain) => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `https://${domain}`;
        document.head.appendChild(link);
      });
    }

    // Cleanup function to remove added links
    return () => {
      const links = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"], link[rel="dns-prefetch"]');
      links.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [criticalResources, prefetchResources, enableDnsPrefetch]);

  return null; // This component doesn't render anything
};

export default ResourcePreloader;