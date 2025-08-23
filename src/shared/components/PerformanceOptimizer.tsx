import { useEffect } from 'react';

// Lightweight web-vitals based performance monitoring
const PerformanceOptimizer = () => {
  useEffect(() => {
    // Only load web-vitals in production for better performance
    if (process.env.NODE_ENV === 'production') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        // Report to analytics service (can be customized)
        const reportMetric = (metric: any) => {
          // In development, log to console
          if (process.env.NODE_ENV === 'development') {
            console.log(metric.name, metric.value);
          }
          // In production, send to your analytics service
          // Example: analytics.track('web_vital', metric);
        };

        getCLS(reportMetric);
        getFID(reportMetric);
        getFCP(reportMetric);
        getLCP(reportMetric);
        getTTFB(reportMetric);
      });
    } else if (process.env.NODE_ENV === 'development') {
      // Lightweight development monitoring
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP }) => {
        const reportMetric = (metric: any) => {
          console.log(`${metric.name}: ${metric.value}`);
        };

        getCLS(reportMetric);
        getFID(reportMetric);
        getFCP(reportMetric);
        getLCP(reportMetric);
      });
    }

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