/**
 * PWA Status Hook
 * Separated from PWA component to fix React Fast Refresh warnings
 */

import { useState, useEffect } from 'react';

// PWA Status interface
export interface PWACapabilities {
  isStandalone: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  supportsNotifications: boolean;
  supportsOffline: boolean;
  supportsPush: boolean;
  hasServiceWorker: boolean;
}

export const usePWAStatus = () => {
  const [status, setStatus] = useState<PWACapabilities>({
    isStandalone: false,
    canInstall: false,
    isInstalled: false,
    supportsNotifications: false,
    supportsOffline: false,
    supportsPush: false,
    hasServiceWorker: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
                          document.referrer.includes('android-app://');

      setStatus({
        isStandalone,
        canInstall: false, // This would be updated by the install prompt event
        isInstalled: isStandalone || localStorage.getItem('pwa-installed') === 'true',
        supportsNotifications: 'Notification' in window,
        supportsOffline: 'serviceWorker' in navigator && 'caches' in window,
        supportsPush: 'serviceWorker' in navigator && 'PushManager' in window,
        hasServiceWorker: !!navigator.serviceWorker?.controller,
      });
    };

    updateStatus();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateStatus);
      return () => mediaQuery.removeEventListener('change', updateStatus);
    }
  }, []);

  return status;
};
