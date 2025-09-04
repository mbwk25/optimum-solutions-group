// Simplified analytics
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: number;
}

export const trackEvent = (name: string, properties: Record<string, unknown> = {}) => {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: Date.now(),
  };
  
  console.log('Analytics event:', event);
};

export const trackPerformance = (data: Record<string, unknown>) => {
  trackEvent('performance', data);
};

export const analytics = {
  track: trackEvent,
  trackPerformance,
  track404: (path: string) => trackEvent('404', { path }),
};