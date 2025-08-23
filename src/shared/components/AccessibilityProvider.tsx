import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { 
  globalLiveRegionManager, 
  reducedMotion, 
  highContrastMode,
  FocusTrap
} from '../utils/accessibility';
import { useUserPreferences } from '../hooks/useAccessibility';

// ========== ACCESSIBILITY CONTEXT ==========

interface AccessibilityContextType {
  // User preferences
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  
  // Screen reader announcements
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  
  // Focus management
  currentFocusTrap: FocusTrap | null;
  setCurrentFocusTrap: (trap: FocusTrap | null) => void;
  
  // Skip links
  skipLinks: Array<{ id: string; label: string; target: string }>;
  addSkipLink: (id: string, label: string, target: string) => void;
  removeSkipLink: (id: string) => void;
  
  // Accessibility settings
  settings: {
    announcePageChanges: boolean;
    announceFormErrors: boolean;
    announceLoadingStates: boolean;
  };
  updateSettings: (settings: Partial<AccessibilityContextType['settings']>) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// ========== ACCESSIBILITY PROVIDER ==========

interface AccessibilityProviderProps {
  children: ReactNode;
  settings?: Partial<AccessibilityContextType['settings']>;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ 
  children, 
  settings: initialSettings = {} 
}) => {
  const { prefersReducedMotion, prefersHighContrast } = useUserPreferences();
  const [currentFocusTrap, setCurrentFocusTrap] = useState<FocusTrap | null>(null);
  const [skipLinks, setSkipLinks] = useState<Array<{ id: string; label: string; target: string }>>([]);
  
  const [settings] = useState<AccessibilityContextType['settings']>(() => ({
    announcePageChanges: true,
    announceFormErrors: true,
    announceLoadingStates: false,
    ...initialSettings
  }));

  // Use refs to store stable function references
  const announceRef = useRef<(message: string, priority?: 'polite' | 'assertive') => void>();
  const addSkipLinkRef = useRef<(id: string, label: string, target: string) => void>();
  const removeSkipLinkRef = useRef<(id: string) => void>();
  const updateSettingsRef = useRef<(settings: Partial<AccessibilityContextType['settings']>) => void>();

  // Initialize stable function references once
  if (!announceRef.current) {
    announceRef.current = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      globalLiveRegionManager.announce(message, priority);
    };
  }

  if (!addSkipLinkRef.current) {
    addSkipLinkRef.current = (id: string, label: string, target: string) => {
      setSkipLinks(prev => {
        const filtered = prev.filter(link => link.id !== id);
        return [...filtered, { id, label, target }];
      });
    };
  }

  if (!removeSkipLinkRef.current) {
    removeSkipLinkRef.current = (id: string) => {
      setSkipLinks(prev => prev.filter(link => link.id !== id));
    };
  }

  if (!updateSettingsRef.current) {
    updateSettingsRef.current = () => {
      // Settings are now immutable to prevent re-renders
      console.warn('Settings updates are disabled to prevent infinite re-renders');
    };
  }

  // Create stable context value
  const contextValue = useRef<AccessibilityContextType>();
  if (!contextValue.current) {
    contextValue.current = {
      prefersReducedMotion,
      prefersHighContrast,
      announce: announceRef.current!,
      currentFocusTrap,
      setCurrentFocusTrap,
      skipLinks,
      addSkipLink: addSkipLinkRef.current!,
      removeSkipLink: removeSkipLinkRef.current!,
      settings,
      updateSettings: updateSettingsRef.current!
    };
  } else {
    // Only update the values that actually change
    contextValue.current.prefersReducedMotion = prefersReducedMotion;
    contextValue.current.prefersHighContrast = prefersHighContrast;
    contextValue.current.currentFocusTrap = currentFocusTrap;
    contextValue.current.skipLinks = skipLinks;
  }

  // Initialize accessibility features on mount only
  useEffect(() => {
    // Add CSS classes for user preferences
    document.documentElement.classList.toggle('prefers-reduced-motion', prefersReducedMotion);
    document.documentElement.classList.toggle('prefers-high-contrast', prefersHighContrast);
  }, [prefersReducedMotion, prefersHighContrast]);

  // Separate effect for page load announcement - run only once
  useEffect(() => {
    if (settings.announcePageChanges) {
      const timer = setTimeout(() => {
        if (announceRef.current) {
          announceRef.current('Page loaded', 'polite');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [settings.announcePageChanges]); // Include dependency

  return (
    <AccessibilityContext.Provider value={contextValue.current}>
      <SkipLinks skipLinks={skipLinks} />
      {children}
    </AccessibilityContext.Provider>
  );
};

// ========== SKIP LINKS COMPONENT ==========

interface SkipLinksProps {
  skipLinks: Array<{ id: string; label: string; target: string }>;
}

const SkipLinks: React.FC<SkipLinksProps> = ({ skipLinks }) => {
  const handleSkipClick = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();
    
    const targetElement = document.querySelector(target) as HTMLElement;
    if (targetElement) {
      // Make target focusable if it's not already
      if (targetElement.tabIndex < 0) {
        targetElement.tabIndex = -1;
      }
      
      targetElement.focus({ preventScroll: false });
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Remove focus outline after a short delay
      setTimeout(() => {
        if (targetElement.tabIndex === -1) {
          targetElement.removeAttribute('tabindex');
        }
      }, 100);
    }
  };

  if (skipLinks.length === 0) return null;

  return (
    <nav className="skip-links" aria-label="Skip links">
      {skipLinks.map(({ id, label, target }) => (
        <a
          key={id}
          href={target}
          className="skip-link"
          onClick={(e) => handleSkipClick(e, target)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSkipClick(e as React.MouseEvent<HTMLAnchorElement>, target);
            }
          }}
        >
          {label}
        </a>
      ))}
    </nav>
  );
};

// ========== HOOK TO USE ACCESSIBILITY CONTEXT ==========

export const useAccessibilityContext = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  
  return context;
};

// ========== ACCESSIBILITY ANNOUNCEMENT COMPONENT ==========

interface AnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
}

export const Announcement: React.FC<AnnouncementProps> = ({ 
  message, 
  priority = 'polite', 
  delay = 0 
}) => {
  const { announce } = useAccessibilityContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      announce(message, priority);
    }, delay);

    return () => clearTimeout(timer);
  }, [message, priority, delay, announce]);

  return null; // This component doesn't render anything
};

// ========== PAGE TITLE ANNOUNCER ==========

interface PageTitleAnnouncerProps {
  title: string;
  announce?: boolean;
}

export const PageTitleAnnouncer: React.FC<PageTitleAnnouncerProps> = ({ 
  title, 
  announce: shouldAnnounce = true 
}) => {
  const { announce, settings } = useAccessibilityContext();

  useEffect(() => {
    // Set document title
    document.title = title;

    // Announce page title change if enabled
    if (shouldAnnounce && settings.announcePageChanges) {
      announce(`Page changed to ${title}`, 'polite');
    }
  }, [title, shouldAnnounce, announce, settings.announcePageChanges]);

  return null;
};
