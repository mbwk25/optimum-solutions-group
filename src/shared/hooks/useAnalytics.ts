/**
 * React Hook for Analytics Integration
 * 
 * Provides easy-to-use analytics functionality for React components
 * with automatic tracking of page views, user interactions, and performance
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import analytics, { type UserSession } from '@/shared/services/analytics';
// Import will be resolved from the existing hooks
// Note: For now, we'll create a simplified integration

// =========================== TYPES ===========================

export interface AnalyticsHookConfig {
  // Tracking preferences
  trackPageViews?: boolean;
  trackPerformance?: boolean;
  trackScrollDepth?: boolean;
  trackClicks?: boolean;
  trackErrors?: boolean;
  
  // Page-specific settings
  pageTitle?: string;
  pageCategory?: string;
  customProperties?: Record<string, unknown>;
  
  // Performance integration
  enableWebVitals?: boolean;
  
  // Goals and conversion tracking
  goals?: string[];
  conversionEvents?: string[];
}

export interface AnalyticsHookReturn {
  // Basic tracking methods
  trackEvent: (category: string, action: string, label?: string, value?: number) => void;
  trackClick: (element: string, url?: string, properties?: Record<string, unknown>) => void;
  trackPageView: (url?: string, title?: string) => void;
  trackGoal: (goalId: string, value?: number, properties?: Record<string, unknown>) => void;
  trackTiming: (category: string, variable: string, time: number, label?: string) => void;
  
  // User identification
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  setUserProperty: (key: string, value: unknown) => void;
  
  // A/B Testing
  setExperiment: (experimentId: string, variant: string) => void;
  getExperiment: (experimentId: string) => string | null;
  
  // Session management
  getSession: () => UserSession;
  
  // Utility
  isEnabled: () => boolean;
  flush: () => Promise<void>;
}

// =========================== MAIN HOOK ===========================

export function useAnalytics(config: AnalyticsHookConfig = {}): AnalyticsHookReturn {
  const location = useLocation();
  const previousLocation = useRef(location.pathname);
  
  // Web Vitals integration (simplified for now)
  useEffect(() => {
    if (config.trackPerformance !== false && config.enableWebVitals) {
      // Simple performance metrics collection
      const collectBasicMetrics = () => {
        if (typeof window !== 'undefined' && window.performance) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            analytics.trackPerformance({
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            });
          }
        }
      };
      
      // Collect metrics after page load
      if (document.readyState === 'complete') {
        collectBasicMetrics();
      } else {
        const handleLoad = () => {
          collectBasicMetrics();
          window.removeEventListener('load', handleLoad);
        };
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
    return undefined;
  }, [config.trackPerformance, config.enableWebVitals]);

  // Track page views on route changes
  useEffect(() => {
    if (config.trackPageViews !== false && location.pathname !== previousLocation.current) {
      const title = config.pageTitle || document.title;
      analytics.trackPageView(location.pathname + location.search, title);
      previousLocation.current = location.pathname;
    }
  }, [location, config.trackPageViews, config.pageTitle]);

  // Track scroll depth
  useEffect(() => {
    if (config.trackScrollDepth === false) return;

    let maxScrollDepth = 0;
    let ticking = false;

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        
        // Track milestone scroll depths
        const milestones = [25, 50, 75, 100];
        const milestone = milestones.find(m => scrollPercent >= m && maxScrollDepth < scrollPercent);
        
        if (milestone) {
          analytics.trackEvent('engagement', 'scroll_depth', `${milestone}%`, milestone);
        }
      }
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(trackScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [config.trackScrollDepth]);

  // Track clicks automatically
  useEffect(() => {
    if (config.trackClicks === false) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Track different element types
      if (target.tagName === 'A') {
        const link = target as HTMLAnchorElement;
        analytics.trackClick(link.href);
      } else if (target.tagName === 'BUTTON') {
        analytics.trackClick(target.textContent || 'button');
      } else if (target.closest('[data-track-click]')) {
        const trackableElement = target.closest('[data-track-click]') as HTMLElement;
        const trackingData = trackableElement.dataset['trackClick'];
        
        analytics.trackClick(trackingData || 'tracked_element');
      }
    };

    document.addEventListener('click', handleClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [config.trackClicks]);

  // Error boundary integration
  useEffect(() => {
    if (config.trackErrors === false) return;

    const handleError = (event: ErrorEvent) => {
      analytics.trackError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
        reason: event.reason,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [config.trackErrors]);

  // =========================== RETURN METHODS ===========================

  const trackEvent = useCallback((
    category: string,
    action: string,
    label?: string,
    value?: number
  ) => {
    analytics.trackEvent(category, action, label, value);
  }, []);

  const trackClick = useCallback((
    element: string,
    url?: string,
    properties?: Record<string, unknown>
  ) => {
    analytics.track({
      type: 'interaction',
      category: 'engagement',
      action: 'click',
      label: element,
      properties: {
        targetUrl: url,
        elementType: element,
        pageCategory: config.pageCategory,
        ...config.customProperties,
        ...properties,
      },
    });
  }, [config.pageCategory, config.customProperties]);

  const trackPageView = useCallback((url?: string, title?: string) => {
    analytics.trackPageView(url, title);
  }, []);

  const trackGoal = useCallback((
    goalId: string,
    value?: number,
    properties?: Record<string, unknown>
  ) => {
    if (value !== undefined) {
      analytics.track({
        type: 'goal',
        category: 'conversion',
        action: 'goal_completed',
        label: goalId,
        value,
        properties: {
          goalId,
          pageCategory: config.pageCategory,
          ...config.customProperties,
          ...properties,
        },
      });
    }
  }, [config.pageCategory, config.customProperties]);

  const trackTiming = useCallback((
    category: string,
    variable: string,
    time: number,
    label?: string
  ) => {
    analytics.trackTiming(category, variable, time, label);
  }, []);

  const identify = useCallback((userId: string, properties?: Record<string, unknown>) => {
    analytics.identify(userId, {
      ...config.customProperties,
      ...properties,
    });
  }, [config.customProperties]);

  const setUserProperty = useCallback((key: string, value: unknown) => {
    analytics.setUserProperty(key, value);
  }, []);

  const setExperiment = useCallback((experimentId: string, variant: string) => {
    analytics.setExperiment(experimentId, variant);
  }, []);

  const getExperiment = useCallback((experimentId: string) => {
    return analytics.getExperiment(experimentId);
  }, []);

  const getSession = useCallback(() => {
    return analytics.getSession();
  }, []);

  const isEnabled = useCallback(() => {
    return analytics.isEnabled();
  }, []);

  const flush = useCallback(async () => {
    await analytics.forceFlush();
  }, []);

  return {
    trackEvent,
    trackClick,
    trackPageView,
    trackGoal,
    trackTiming,
    identify,
    setUserProperty,
    setExperiment,
    getExperiment,
    getSession,
    isEnabled,
    flush,
  };
}

// =========================== SPECIALIZED HOOKS ===========================

/**
 * Hook for tracking form interactions
 */
export function useFormAnalytics(formName: string) {
  const { trackEvent } = useAnalytics();

  const trackFormStart = useCallback(() => {
    trackEvent('form', 'start', formName);
  }, [trackEvent, formName]);

  const trackFormSubmit = useCallback((success: boolean, errors?: string[]) => {
    trackEvent('form', success ? 'submit_success' : 'submit_error', formName);
    
    if (errors && errors.length > 0) {
      trackEvent('form', 'validation_error', formName, errors.length);
    }
  }, [trackEvent, formName]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    trackEvent('form', 'field_focus', `${formName}_${fieldName}`);
  }, [trackEvent, formName]);

  const trackFieldError = useCallback((fieldName: string) => {
    trackEvent('form', 'field_error', `${formName}_${fieldName}`);
  }, [trackEvent, formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldFocus,
    trackFieldError,
  };
}

/**
 * Hook for tracking e-commerce events
 */
export function useEcommerceAnalytics() {
  const { trackEvent } = useAnalytics();

  const trackPurchase = useCallback((
    transactionId: string,
    value: number,
    items: Array<{ id: string; name: string; category: string; quantity: number; price: number }>
  ) => {
    trackEvent('ecommerce', 'purchase', transactionId, value);
    
    // Track individual items
    items.forEach(item => {
      trackEvent('ecommerce', 'purchase_item', `${item.id}_${item.name}`, item.price * item.quantity);
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback((
    itemId: string,
    itemName: string,
    price: number,
    quantity: number = 1
  ) => {
    trackEvent('ecommerce', 'add_to_cart', `${itemId}_${itemName}`, price * quantity);
  }, [trackEvent]);

  const trackRemoveFromCart = useCallback((
    itemId: string,
    itemName: string,
    price: number,
    quantity: number = 1
  ) => {
    trackEvent('ecommerce', 'remove_from_cart', `${itemId}_${itemName}`, price * quantity);
  }, [trackEvent]);

  const trackViewItem = useCallback((itemId: string, itemName: string) => {
    trackEvent('ecommerce', 'view_item', `${itemId}_${itemName}`);
  }, [trackEvent]);

  return {
    trackPurchase,
    trackAddToCart,
    trackRemoveFromCart,
    trackViewItem,
  };
}

/**
 * Hook for tracking media consumption
 */
export function useMediaAnalytics(mediaType: 'video' | 'audio' | 'image' = 'video') {
  const { trackEvent } = useAnalytics();

  const trackPlay = useCallback((mediaId: string, duration?: number) => {
    trackEvent('media', 'play', `${mediaType}_${mediaId}`, duration);
  }, [trackEvent, mediaType]);

  const trackPause = useCallback((mediaId: string, currentTime: number) => {
    trackEvent('media', 'pause', `${mediaType}_${mediaId}`, currentTime);
  }, [trackEvent, mediaType]);

  const trackComplete = useCallback((mediaId: string, duration: number) => {
    trackEvent('media', 'complete', `${mediaType}_${mediaId}`, duration);
  }, [trackEvent, mediaType]);

  const trackSeek = useCallback((mediaId: string, fromTime: number, toTime: number) => {
    trackEvent('media', 'seek', `${mediaType}_${mediaId}`, Math.abs(toTime - fromTime));
  }, [trackEvent, mediaType]);

  return {
    trackPlay,
    trackPause,
    trackComplete,
    trackSeek,
  };
}

export default useAnalytics;
