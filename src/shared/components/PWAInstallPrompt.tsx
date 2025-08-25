/**
 * PWA Install Prompt Component
 * 
 * Handles PWA installation prompts, user engagement, and provides
 * a native app-like installation experience
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { 
  Smartphone, 
  Download, 
  X, 
  CheckCircle, 
  Zap, 
  Wifi, 
  Bell,
  Home,
  Layers,
  ArrowDown
} from 'lucide-react';
import { useAnalytics } from '@/shared/hooks/useAnalytics';

// =========================== TYPES ===========================

interface BeforeInstallPromptEvent extends Event {
  platforms: string[];
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  className?: string;
  variant?: 'banner' | 'card' | 'modal' | 'floating';
  autoShow?: boolean;
  showDelay?: number;
  hideAfterInstall?: boolean;
  customTrigger?: React.ReactNode;
  onInstall?: () => void;
  onDismiss?: () => void;
}

interface PWACapabilities {
  isStandalone: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  supportsNotifications: boolean;
  supportsOffline: boolean;
  supportsPush: boolean;
  hasServiceWorker: boolean;
}

// =========================== MAIN COMPONENT ===========================

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className = '',
  variant = 'banner',
  autoShow = true,
  showDelay = 3000,
  hideAfterInstall = true,
  customTrigger,
  onInstall,
  onDismiss,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isStandalone: false,
    canInstall: false,
    isInstalled: false,
    supportsNotifications: false,
    supportsOffline: false,
    supportsPush: false,
    hasServiceWorker: false,
  });

  const { trackEvent } = useAnalytics({
    pageCategory: 'pwa',
    customProperties: {
      component: 'PWAInstallPrompt',
      variant,
    },
  });

  // =========================== PWA CAPABILITY DETECTION ===========================

  const detectCapabilities = useCallback((): PWACapabilities => {
    if (typeof window === 'undefined') {
      return {
        isStandalone: false,
        canInstall: false,
        isInstalled: false,
        supportsNotifications: false,
        supportsOffline: false,
        supportsPush: false,
        hasServiceWorker: false,
      };
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
                        document.referrer.includes('android-app://');

    return {
      isStandalone,
      canInstall: !!deferredPrompt,
      isInstalled: isStandalone || localStorage.getItem('pwa-installed') === 'true',
      supportsNotifications: 'Notification' in window,
      supportsOffline: 'serviceWorker' in navigator && 'caches' in window,
      supportsPush: 'serviceWorker' in navigator && 'PushManager' in window,
      hasServiceWorker: !!navigator.serviceWorker?.controller,
    };
  }, [deferredPrompt]);

  // =========================== EVENT HANDLERS ===========================

  const handleBeforeInstallPrompt = useCallback((e: Event) => {
    const event = e as BeforeInstallPromptEvent;
    
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    setDeferredPrompt(event);
    
    trackEvent('pwa', 'install_prompt_available', 'beforeinstallprompt');
    
    // Show prompt after delay if autoShow is enabled
    // Check installation status at runtime to avoid dependency
    if (autoShow) {
      const isInstalled = localStorage.getItem('pwa-installed') === 'true' ||
                         window.matchMedia('(display-mode: standalone)').matches;
      
      if (!isInstalled) {
        setTimeout(() => {
          setIsVisible(true);
          trackEvent('pwa', 'install_prompt_shown', `auto_${variant}`);
        }, showDelay);
      }
    }
  }, [autoShow, showDelay, trackEvent, variant]);

  const handleAppInstalled = useCallback(() => {
    trackEvent('pwa', 'app_installed', 'appinstalled_event');
    
    localStorage.setItem('pwa-installed', 'true');
    setInstallResult('success');
    setIsVisible(false);
    
    onInstall?.();

    // Show success message briefly
    setTimeout(() => {
      setInstallResult(null);
    }, 3000);
  }, [trackEvent, onInstall]);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    trackEvent('pwa', 'install_clicked', variant);

    try {
      await deferredPrompt.prompt();
      
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        trackEvent('pwa', 'install_accepted', choiceResult.platform);
        localStorage.setItem('pwa-installed', 'true');
        setInstallResult('success');
        
        if (hideAfterInstall) {
          setIsVisible(false);
        }
      } else {
        trackEvent('pwa', 'install_dismissed', 'user_choice');
        setInstallResult('dismissed');
      }
    } catch (error) {
      console.error('PWA installation error:', error);
      trackEvent('pwa', 'install_error', String(error));
      setInstallResult('error');
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      
      // Clear result message after delay
      setTimeout(() => {
        setInstallResult(null);
      }, 3000);
    }
  }, [deferredPrompt, trackEvent, variant, hideAfterInstall]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setDeferredPrompt(null);
    
    trackEvent('pwa', 'install_prompt_dismissed', variant);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    
    onDismiss?.();
  }, [trackEvent, variant, onDismiss]);

  const showPrompt = useCallback(() => {
    // Check installation status at runtime to avoid dependency
    const isInstalled = localStorage.getItem('pwa-installed') === 'true' ||
                       window.matchMedia('(display-mode: standalone)').matches;
    
    if (isInstalled || sessionStorage.getItem('pwa-prompt-dismissed')) {
      return;
    }
    
    setIsVisible(true);
    trackEvent('pwa', 'install_prompt_shown', `manual_${variant}`);
  }, [trackEvent, variant]);

  // =========================== EFFECTS ===========================

  useEffect(() => {
    const newCapabilities = detectCapabilities();
    setCapabilities(newCapabilities);
  }, [detectCapabilities]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // PWA installation events
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      setCapabilities(prev => ({ ...prev, isStandalone: mediaQuery.matches }));
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, [handleBeforeInstallPrompt, handleAppInstalled]);

  // =========================== RENDER HELPERS ===========================

  const renderFeatureList = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Wifi className="h-4 w-4 text-blue-500" />
        <span>Works offline</span>
        <Badge variant="outline" className="text-xs">
          {capabilities.supportsOffline ? 'Supported' : 'Limited'}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Zap className="h-4 w-4 text-green-500" />
        <span>Fast loading</span>
        <Badge variant="outline" className="text-xs">Cached</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Bell className="h-4 w-4 text-yellow-500" />
        <span>Push notifications</span>
        <Badge variant="outline" className="text-xs">
          {capabilities.supportsNotifications ? 'Available' : 'Not supported'}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Home className="h-4 w-4 text-purple-500" />
        <span>Add to home screen</span>
        <Badge variant="outline" className="text-xs">Native feel</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Layers className="h-4 w-4 text-indigo-500" />
        <span>App-like experience</span>
        <Badge variant="outline" className="text-xs">Full screen</Badge>
      </div>
    </div>
  );

  const renderInstallButton = () => (
    <Button
      onClick={handleInstallClick}
      disabled={isInstalling || !deferredPrompt}
      className="w-full sm:w-auto"
      size="lg"
    >
      {isInstalling ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Installing...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Install App
        </>
      )}
    </Button>
  );

  const renderTriggerButton = () => (
    <Button
      onClick={showPrompt}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Smartphone className="h-4 w-4" />
      Install App
    </Button>
  );

  // =========================== RENDER VARIANTS ===========================

  if (capabilities.isInstalled && hideAfterInstall) {
    return null;
  }

  // Custom trigger mode
  if (customTrigger) {
    return (
      <div onClick={showPrompt} className="cursor-pointer">
        {customTrigger}
      </div>
    );
  }

  // Floating trigger when not visible
  if (!isVisible && variant === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {renderTriggerButton()}
      </div>
    );
  }

  // Success/Error states
  if (installResult) {
    const messages = {
      success: { icon: CheckCircle, text: 'App installed successfully!', color: 'text-green-600' },
      dismissed: { icon: X, text: 'Installation cancelled', color: 'text-gray-600' },
      error: { icon: X, text: 'Installation failed', color: 'text-red-600' },
    };

    const result = messages[installResult as keyof typeof messages];
    const Icon = result.icon;

    return (
      <Alert className={`${className} ${result.color}`}>
        <Icon className="h-4 w-4" />
        <AlertDescription>{result.text}</AlertDescription>
      </Alert>
    );
  }

  if (!isVisible) {
    return null;
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Smartphone className="h-6 w-6" />
            <div>
              <p className="font-medium">Install Optimum Solutions Group</p>
              <p className="text-sm opacity-90">Get the full app experience with offline access and notifications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderInstallButton()}
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Install Our App</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Get the best experience with our Progressive Web App
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderFeatureList()}
          <div className="pt-2">
            {renderInstallButton()}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Modal variant
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className={`w-full max-w-md ${className}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Install OSG App</CardTitle>
                  <CardDescription>Add to your device for quick access</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <ArrowDown className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Tap the install button to add our app to your home screen
              </p>
            </div>
            
            {renderFeatureList()}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDismiss} className="flex-1">
                Maybe Later
              </Button>
              {renderInstallButton()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

// Note: The usePWAStatus hook has been moved to src/shared/hooks/usePWAStatus.ts
// to fix React Fast Refresh warnings.

export default PWAInstallPrompt;
