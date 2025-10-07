import { useEffect } from 'react';

// Lightweight performance monitoring
// DISABLED: Web Vitals monitoring temporarily disabled to prevent errors
const PerformanceOptimizer = () => {
  useEffect(() => {
    console.log('Performance optimization active (web-vitals disabled)');

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