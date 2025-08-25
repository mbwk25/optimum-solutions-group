/**
 * Comprehensive Analytics Service
 * 
 * Provides complete analytics tracking including:
 * - Page views and navigation
 * - User interactions and engagement
 * - Performance metrics integration
 * - Custom events and goals
 * - Session management
 * - A/B testing support
 * - Privacy-compliant data collection
 */

// =========================== TYPES ===========================

export interface AnalyticsConfig {
  // Core settings
  enabled: boolean;
  debug: boolean;
  apiEndpoint?: string;
  apiKey?: string;
  
  // Privacy settings
  respectDNT: boolean; // Respect Do Not Track
  anonymizeIP: boolean;
  cookieConsent: boolean;
  
  // Sampling and performance
  sampleRate: number; // 0-1, 1 = track all events
  batchSize: number;
  flushInterval: number; // milliseconds
  
  // Feature flags
  trackPageViews: boolean;
  trackUserInteractions: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
  trackCustomEvents: boolean;
}

export interface AnalyticsEvent {
  // Core event data
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  
  // Context
  timestamp: number;
  sessionId: string;
  userId?: string;
  
  // Page context
  url: string;
  referrer: string;
  title: string;
  
  // User context
  userAgent: string;
  language: string;
  timezone: string;
  screenResolution: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  
  // Custom properties
  properties?: Record<string, unknown>;
  
  // Performance context
  performanceMetrics?: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  };
}

export interface UserSession {
  id: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  interactions: number;
  duration: number;
  isActive: boolean;
  referrer: string;
  landingPage: string;
  
  // Engagement metrics
  scrollDepth: number;
  timeOnPage: number;
  bounceRate: boolean;
  
  // A/B Testing
  experiments?: Record<string, string>;
}

export interface AnalyticsStorage {
  sessionId: string;
  userId?: string;
  experiments: Record<string, string>;
  preferences: {
    cookieConsent: boolean;
    trackingEnabled: boolean;
  };
  firstVisit: number;
  lastVisit: number;
  visitCount: number;
}

// =========================== ANALYTICS SERVICE ===========================

class AnalyticsService {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private session: UserSession;
  private storage: AnalyticsStorage;
  private flushTimer: number | null = null;
  private isInitialized = false;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      debug: false,
      respectDNT: true,
      anonymizeIP: true,
      cookieConsent: false,
      sampleRate: 1.0,
      batchSize: 10,
      flushInterval: 5000,
      trackPageViews: true,
      trackUserInteractions: true,
      trackPerformance: true,
      trackErrors: true,
      trackCustomEvents: true,
      ...config,
    };

    // Initialize storage and session
    this.initializeStorage();
    this.initializeSession();
  }

  // =========================== INITIALIZATION ===========================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check privacy settings
      if (this.shouldRespectPrivacy()) {
        this.config.enabled = false;
        this.log('Analytics disabled due to privacy settings');
        return;
      }

      // Set up automatic event listeners
      this.setupEventListeners();

      // Start flush timer
      this.startFlushTimer();

      // Track initial page view
      if (this.config.trackPageViews) {
        this.trackPageView();
      }

      this.isInitialized = true;
      this.log('Analytics service initialized successfully');

    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
    }
  }

  // =========================== CORE TRACKING METHODS ===========================

  track(event: Partial<AnalyticsEvent>): void {
    if (!this.config.enabled || !this.isInitialized) return;

    // Apply sampling
    if (Math.random() > this.config.sampleRate) return;

    const fullEvent: AnalyticsEvent = {
      type: 'custom',
      category: 'general',
      action: 'unknown',
      ...event,
      timestamp: Date.now(),
      sessionId: this.session.id,
      userId: this.storage.userId,
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      deviceType: this.getDeviceType(),
    };

    // Add performance metrics if available
    if (this.config.trackPerformance) {
      fullEvent.performanceMetrics = this.getPerformanceMetrics();
    }

    this.eventQueue.push(fullEvent);
    this.updateSession();

    this.log('Event tracked:', fullEvent);

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  trackPageView(url?: string, title?: string): void {
    this.track({
      type: 'pageview',
      category: 'navigation',
      action: 'page_view',
      label: title || document.title,
      properties: {
        url: url || window.location.href,
        path: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
    });

    // Update session
    this.session.pageViews++;
    this.updateSession();
  }

  trackEvent(category: string, action: string, label?: string, value?: number): void {
    this.track({
      type: 'event',
      category,
      action,
      label,
      value,
    });
  }

  trackClick(element: string, url?: string): void {
    this.track({
      type: 'interaction',
      category: 'engagement',
      action: 'click',
      label: element,
      properties: {
        targetUrl: url,
        elementType: element,
      },
    });

    this.session.interactions++;
    this.updateSession();
  }

  trackScroll(depth: number): void {
    // Only track significant scroll milestones
    const milestones = [25, 50, 75, 100];
    const milestone = milestones.find(m => depth >= m && this.session.scrollDepth < m);
    
    if (milestone) {
      this.track({
        type: 'interaction',
        category: 'engagement',
        action: 'scroll',
        label: `${milestone}%`,
        value: milestone,
        properties: {
          scrollDepth: depth,
        },
      });

      this.session.scrollDepth = Math.max(this.session.scrollDepth, depth);
      this.updateSession();
    }
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    if (!this.config.trackErrors) return;

    this.track({
      type: 'error',
      category: 'technical',
      action: 'javascript_error',
      label: error.message,
      properties: {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        url: window.location.href,
        ...context,
      },
    });
  }

  trackPerformance(metrics: Record<string, number>): void {
    if (!this.config.trackPerformance) return;

    this.track({
      type: 'performance',
      category: 'technical',
      action: 'web_vitals',
      properties: metrics,
    });
  }

  trackTiming(category: string, variable: string, time: number, label?: string): void {
    this.track({
      type: 'timing',
      category,
      action: 'timing',
      label: `${variable}${label ? `_${label}` : ''}`,
      value: time,
      properties: {
        timingCategory: category,
        timingVar: variable,
        timingValue: time,
      },
    });
  }

  // =========================== A/B TESTING ===========================

  setExperiment(experimentId: string, variant: string): void {
    this.session.experiments = this.session.experiments || {};
    this.session.experiments[experimentId] = variant;
    this.storage.experiments[experimentId] = variant;
    this.saveStorage();

    this.track({
      type: 'experiment',
      category: 'ab_testing',
      action: 'variant_assigned',
      label: experimentId,
      properties: {
        experimentId,
        variant,
      },
    });
  }

  getExperiment(experimentId: string): string | null {
    return this.storage.experiments[experimentId] || null;
  }

  // =========================== USER MANAGEMENT ===========================

  identify(userId: string, properties?: Record<string, unknown>): void {
    this.storage.userId = userId;
    this.saveStorage();

    this.track({
      type: 'identify',
      category: 'user',
      action: 'identify',
      userId,
      properties,
    });
  }

  setUserProperty(key: string, value: unknown): void {
    this.track({
      type: 'user_property',
      category: 'user',
      action: 'set_property',
      label: key,
      properties: {
        [key]: value,
      },
    });
  }

  // =========================== SESSION MANAGEMENT ===========================

  private initializeSession(): void {
    this.session = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      interactions: 0,
      duration: 0,
      isActive: true,
      referrer: document.referrer,
      landingPage: window.location.href,
      scrollDepth: 0,
      timeOnPage: 0,
      bounceRate: false,
      experiments: { ...this.storage.experiments },
    };
  }

  private updateSession(): void {
    const now = Date.now();
    this.session.lastActivity = now;
    this.session.duration = now - this.session.startTime;
    this.session.timeOnPage = now - this.session.startTime;
    
    // Update bounce rate (user interacted meaningfully)
    if (this.session.interactions > 0 || this.session.timeOnPage > 30000) {
      this.session.bounceRate = false;
    }
  }

  endSession(): void {
    if (!this.session.isActive) return;

    this.session.isActive = false;
    this.session.bounceRate = this.session.interactions === 0 && this.session.timeOnPage < 30000;

    this.track({
      type: 'session_end',
      category: 'session',
      action: 'end',
      properties: {
        duration: this.session.duration,
        pageViews: this.session.pageViews,
        interactions: this.session.interactions,
        bounceRate: this.session.bounceRate,
        scrollDepth: this.session.scrollDepth,
      },
    });

    this.flush(); // Ensure session end is recorded
  }

  // =========================== DATA PERSISTENCE ===========================

  private initializeStorage(): void {
    const stored = this.getStoredData();
    const now = Date.now();

    this.storage = {
      sessionId: '',
      experiments: {},
      preferences: {
        cookieConsent: false,
        trackingEnabled: true,
      },
      firstVisit: now,
      lastVisit: now,
      visitCount: 1,
      ...stored,
    };

    // Update visit tracking
    if (stored) {
      this.storage.lastVisit = now;
      this.storage.visitCount++;
    }

    this.saveStorage();
  }

  private getStoredData(): AnalyticsStorage | null {
    try {
      const stored = localStorage.getItem('analytics_data');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveStorage(): void {
    try {
      localStorage.setItem('analytics_data', JSON.stringify(this.storage));
    } catch (error) {
      this.log('Failed to save analytics data:', error);
    }
  }

  // =========================== EVENT LISTENERS ===========================

  private setupEventListeners(): void {
    if (!this.config.trackUserInteractions) return;

    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = (target as HTMLAnchorElement).href;
        this.trackClick('link', href);
      } else if (target.tagName === 'BUTTON') {
        this.trackClick('button', target.textContent || 'unknown');
      }
    }, { passive: true });

    // Scroll tracking (throttled)
    let scrollTimeout: number | null = null;
    document.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        this.trackScroll(Math.min(scrollPercent, 100));
      }, 250);
    }, { passive: true });

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.endSession();
      } else {
        this.initializeSession();
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Error tracking
    if (this.config.trackErrors) {
      window.addEventListener('error', (event) => {
        this.trackError(event.error || new Error(event.message));
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(new Error(`Unhandled Promise Rejection: ${event.reason}`));
      });
    }
  }

  // =========================== DATA TRANSMISSION ===========================

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (this.config.apiEndpoint) {
        await this.sendToAPI(events);
      } else {
        await this.sendToConsole(events);
      }

      this.log(`Flushed ${events.length} events`);
    } catch (error) {
      // Return events to queue on failure
      this.eventQueue.unshift(...events);
      console.error('[Analytics] Failed to flush events:', error);
    }
  }

  private async sendToAPI(events: AnalyticsEvent[]): Promise<void> {
    const response = await fetch(this.config.apiEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        events,
        session: this.session,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
        },
      }),
      keepalive: true, // Important for page unload events
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }
  }

  private async sendToConsole(events: AnalyticsEvent[]): Promise<void> {
    if (this.config.debug) {
      console.group('[Analytics] Events Batch');
      events.forEach(event => console.log(event));
      console.groupEnd();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // =========================== UTILITY METHODS ===========================

  private shouldRespectPrivacy(): boolean {
    if (this.config.respectDNT && navigator.doNotTrack === '1') {
      return true;
    }

    if (this.config.cookieConsent && !this.storage.preferences.cookieConsent) {
      return true;
    }

    return false;
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile';
    }
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    return 'desktop';
  }

  private getPerformanceMetrics(): Record<string, number> | undefined {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics: Record<string, number> = {};
      
      if (navigation) {
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
        metrics.ttfb = navigation.responseStart - navigation.requestStart;
      }
      
      paint.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
        }
      });
      
      return Object.keys(metrics).length > 0 ? metrics : undefined;
    } catch {
      return undefined;
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[Analytics]', ...args);
    }
  }

  // =========================== GDPR/PRIVACY METHODS ===========================

  setCookieConsent(consent: boolean): void {
    this.storage.preferences.cookieConsent = consent;
    this.config.enabled = consent;
    this.saveStorage();

    if (consent && !this.isInitialized) {
      this.initialize();
    } else if (!consent) {
      this.clearData();
    }
  }

  setTrackingEnabled(enabled: boolean): void {
    this.storage.preferences.trackingEnabled = enabled;
    this.config.enabled = enabled;
    this.saveStorage();

    if (!enabled) {
      this.clearData();
    }
  }

  private clearData(): void {
    this.eventQueue = [];
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    try {
      localStorage.removeItem('analytics_data');
    } catch {
      // Ignore storage errors
    }
  }

  // =========================== PUBLIC API ===========================

  getSession(): UserSession {
    return { ...this.session };
  }

  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled && this.isInitialized;
  }

  async forceFlush(): Promise<void> {
    await this.flush();
  }

  destroy(): void {
    this.endSession();
    this.clearData();
    this.isInitialized = false;
  }
}

// =========================== SINGLETON INSTANCE ===========================

export const analytics = new AnalyticsService({
  debug: import.meta.env.MODE === 'development',
  enabled: import.meta.env.MODE === 'production',
  trackPageViews: true,
  trackUserInteractions: true,
  trackPerformance: true,
  trackErrors: true,
});

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  analytics.initialize().catch(console.error);
}

export default analytics;
export { AnalyticsService };
