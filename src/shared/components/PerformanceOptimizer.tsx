import { useEffect } from 'react';
import { type Metric } from 'web-vitals';

// Lightweight web-vitals based performance monitoring
const PerformanceOptimizer = () => {
  useEffect(() => {
    // Load web-vitals for both development and production
    const loadWebVitals = async () => {
      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');
        
        // Report to analytics service (can be customized)
        const reportMetric = (metric: Metric) => {
          if (import.meta.env.MODE === 'development') {
            console.log(`${metric.name}: ${metric.value}`);
          } else {
            // In production, send to your analytics service
            // Example: analytics.track('web_vital', metric);
          }
        };

        // Initialize all web vitals
        onCLS(reportMetric);
        onINP(reportMetric); // Replaced onFID with onINP (Interaction to Next Paint)
        onFCP(reportMetric);
        onLCP(reportMetric);
        
        // Only include TTFB in production for performance
        if (import.meta.env.MODE === 'production') {
          onTTFB(reportMetric);
        }
      } catch (error) {
        console.warn('Failed to load web-vitals:', error);
      }
    };

    loadWebVitals();

    // Optimize images loading (keep this lightweight optimization)
    const images = document.querySelectorAll('img[loading="lazy"]') as NodeListOf<HTMLImageElement>;
    images.forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      }
    });
  }, []);

  return null;
};

export default PerformanceOptimizer;