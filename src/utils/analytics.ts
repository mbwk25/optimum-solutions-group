interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface PerformanceMetric {
  metric: string;
  value: number;
  budget: number;
  passed: boolean;
}

class Analytics {
  private isProduction = process.env.NODE_ENV === 'production';
  private queue: AnalyticsEvent[] = [];

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now()
    };

    if (this.isProduction) {
      // In production, send to your analytics service
      this.sendEvent(event);
    } else {
      // In development, just log
      console.log('Analytics Event:', event);
    }
  }

  trackPerformance(metric: PerformanceMetric) {
    this.track('performance_metric', metric);
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  track404(path: string) {
    this.track('404_error', { path });
  }

  private sendEvent(event: AnalyticsEvent) {
    // Queue events for batch sending
    this.queue.push(event);
    
    // Send in batches of 10 or after 5 seconds
    if (this.queue.length >= 10) {
      this.flush();
    } else {
      setTimeout(() => this.flush(), 5000);
    }
  }

  private flush() {
    if (this.queue.length === 0) return;

    // Here you would send to your analytics service
    // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(this.queue) })
    
    this.queue = [];
  }
}

export const analytics = new Analytics();
export default analytics;