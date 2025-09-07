import React, { useEffect, useRef } from 'react';
import { useAccessibilityContext } from './AccessibilityProvider';

interface AccessibilityEnhancementsProps {
  children: React.ReactNode;
  skipLinksEnabled?: boolean;
  keyboardNavigationEnabled?: boolean;
}

export const AccessibilityEnhancements: React.FC<AccessibilityEnhancementsProps> = ({
  children,
  skipLinksEnabled = true,
  keyboardNavigationEnabled = true,
}) => {
  const { prefersReducedMotion } = useAccessibilityContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!keyboardNavigationEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab navigation enhancement
      if (event.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
      
      // Escape key handling for modals/dropdowns
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.classList.contains('modal-trigger')) {
          activeElement.click();
        }
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('using-keyboard');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [keyboardNavigationEnabled]);

  // Apply reduced motion preferences
  useEffect(() => {
    if (prefersReducedMotion) {
      document.body.classList.add('prefers-reduced-motion');
    } else {
      document.body.classList.remove('prefers-reduced-motion');
    }
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className="accessibility-enhanced">
      {skipLinksEnabled && <SkipLinks />}
      {children}
      <FocusTrapManager />
    </div>
  );
};

// Skip navigation links component
const SkipLinks: React.FC = () => {
  return (
    <div className="skip-links sr-only-focusable" role="navigation" aria-label="Skip navigation">
      <a 
        href="#main" 
        className="skip-link focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="skip-link focus:not-sr-only focus:absolute focus:top-2 focus:left-32 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to navigation
      </a>
      <a 
        href="#footer" 
        className="skip-link focus:not-sr-only focus:absolute focus:top-2 focus:left-64 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to footer
      </a>
    </div>
  );
};

// Focus trap manager for modals
const FocusTrapManager: React.FC = () => {
  useEffect(() => {
    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const modal = document.querySelector('[role="dialog"]:not([hidden])') as HTMLElement;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, []);

  return null;
};

// ARIA live region for dynamic content announcements
export const LiveRegion: React.FC<{
  message: string;
  politeness?: 'polite' | 'assertive';
  atomic?: boolean;
}> = ({ message, politeness = 'polite', atomic = true }) => {
  return (
    <div
      className="sr-only"
      aria-live={politeness}
      aria-atomic={atomic}
      role="status"
    >
      {message}
    </div>
  );
};

// Accessible heading component with proper hierarchy
export const AccessibleHeading: React.FC<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ level, children, className = '', id }) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <HeadingTag 
      className={`heading-${level} ${className}`}
      id={id}
    >
      {children}
    </HeadingTag>
  );
};

export default AccessibilityEnhancements;