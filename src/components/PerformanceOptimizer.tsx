import { useEffect } from 'react';

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Optimize animations for better performance
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (reducedMotion) {
      // Disable animations for users who prefer reduced motion
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0s');
    }

    // Optimize images loading based on connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Delay non-critical images on slow connections
        document.documentElement.setAttribute('data-slow-connection', 'true');
      }
    }

    // Preload next section images when user scrolls 75% down
    const preloadNextImages = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercent > 75) {
        // Preload portfolio images
        const portfolioImg = new Image();
        portfolioImg.src = '/assets/portfolio-preview.jpg';
        
        window.removeEventListener('scroll', preloadNextImages);
      }
    };

    window.addEventListener('scroll', preloadNextImages, { passive: true });

    // Resource hints for third-party content
    const addResourceHints = () => {
      // Preconnect to analytics
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = 'https://cdn.gpteng.co';
      document.head.appendChild(preconnect);
    };

    addResourceHints();

    return () => {
      window.removeEventListener('scroll', preloadNextImages);
    };
  }, []);

  return null;
};

export default PerformanceOptimizer;