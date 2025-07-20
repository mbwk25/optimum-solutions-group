import { useEffect } from 'react';

const ResourcePrefetcher = () => {
  useEffect(() => {
    // Prefetch critical resources when page becomes idle
    const prefetchCriticalResources = () => {
      // Prefetch images that will likely be needed
      const imagesToPrefetch = [
        '/assets/portfolio-preview.jpg',
        '/assets/services-icons.jpg'
      ];

      imagesToPrefetch.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = src;
        link.as = 'image';
        document.head.appendChild(link);
      });

      // Prefetch fonts if not already loaded
      const fontsToPreload = [
        'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
        'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFRD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xNzj5c.woff2'
      ];

      fontsToPreload.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };

    // Use requestIdleCallback for optimal timing
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetchCriticalResources, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(prefetchCriticalResources, 1000);
    }

    // Prefetch next page content based on user interaction
    const prefetchOnHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement;
      
      if (link) {
        const section = link.getAttribute('href')?.substring(1);
        if (section && ['services', 'portfolio', 'about', 'contact'].includes(section)) {
          // Prefetch section-specific resources
          console.log(`Prefetching resources for ${section} section`);
        }
      }
    };

    document.addEventListener('mouseover', prefetchOnHover, { passive: true });

    return () => {
      document.removeEventListener('mouseover', prefetchOnHover);
    };
  }, []);

  return null;
};

export default ResourcePrefetcher;