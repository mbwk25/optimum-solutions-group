import { useEffect } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const PerformanceOptimizer = () => {
  usePerformanceMonitor();

  useEffect(() => {
    // Optimize images loading
    const images = document.querySelectorAll('img[loading="lazy"]') as NodeListOf<HTMLImageElement>;
    images.forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      }
    });

    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'font';
    preloadLink.href = '/fonts/inter-var.woff2';
    preloadLink.crossOrigin = 'anonymous';
    document.head.appendChild(preloadLink);

    // Clean up on unmount
    return () => {
      if (document.head.contains(preloadLink)) {
        document.head.removeChild(preloadLink);
      }
    };
  }, []);

  return null;
};

export default PerformanceOptimizer;