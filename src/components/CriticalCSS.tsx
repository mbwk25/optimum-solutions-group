import { useEffect } from 'react';

const CriticalCSS = () => {
  useEffect(() => {
    // Critical CSS for above-the-fold content
    const criticalStyles = `
      /* Critical hero styles */
      .hero-gradient {
        background: linear-gradient(135deg, hsl(220 13% 9%) 0%, hsl(220 13% 12%) 50%, hsl(0 84% 60%) 100%);
        position: relative;
      }
      
      .fade-in-up {
        opacity: 0;
        transform: translateY(32px);
        animation: fadeInUp 0.8s ease-out forwards;
      }
      
      .btn-hero {
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, hsl(0 84% 60%), hsl(0 84% 70%));
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      @keyframes fadeInUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    // Only inject if not already present
    if (!document.querySelector('#critical-css')) {
      const style = document.createElement('style');
      style.id = 'critical-css';
      style.textContent = criticalStyles;
      document.head.appendChild(style);
    }
  }, []);

  return null;
};

export default CriticalCSS;