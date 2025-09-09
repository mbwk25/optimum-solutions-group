import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Eye, EyeOff } from 'lucide-react';

/**
 * High contrast mode toggle for improved accessibility
 */
export const HighContrastModeToggle: React.FC = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check if user has previously enabled high contrast mode
    const savedPreference = localStorage.getItem('high-contrast-mode');
    if (savedPreference === 'true') {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }

    // Check system preference for high contrast
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    if (mediaQuery.matches && !savedPreference) {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !localStorage.getItem('high-contrast-mode')) {
        setIsHighContrast(true);
        document.documentElement.classList.add('high-contrast');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    const newState = !isHighContrast;
    setIsHighContrast(newState);
    
    if (newState) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('high-contrast-mode', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('high-contrast-mode', 'false');
    }

    // Announce the change to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = `High contrast mode ${newState ? 'enabled' : 'disabled'}`;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleHighContrast}
      aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
      className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent/80"
      title={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode for better visibility`}
    >
      {isHighContrast ? (
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only">
        {isHighContrast ? 'Disable' : 'Enable'} high contrast mode
      </span>
    </Button>
  );
};

export default HighContrastModeToggle;