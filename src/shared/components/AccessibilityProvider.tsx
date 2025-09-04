import React, { createContext, useContext } from 'react';

interface AccessibilityContextType {
  announceMessage: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const announceMessage = (message: string) => {
    // Simple screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = message;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return (
    <AccessibilityContext.Provider value={{ announceMessage }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Simple component for page title announcements
export const PageTitleAnnouncer: React.FC<{ title: string }> = ({ title }) => {
  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
};