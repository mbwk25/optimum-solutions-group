/**
 * @fileoverview Event Bus for Loose Coupling
 * @description Centralized event system for component communication
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

export type EventCallback<T = unknown> = (data: T) => void;
export type EventUnsubscribe = () => void;

export interface EventBusEvent<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
  source?: string | undefined;
}

export class EventBus {
  private listeners = new Map<string, Set<EventCallback<unknown>>>();
  private eventHistory: EventBusEvent[] = [];
  private readonly maxHistorySize = 100;

  /**
   * Subscribe to an event
   */
  on<T = unknown>(eventType: string, callback: EventCallback<T>): EventUnsubscribe {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const wrappedCallback: EventCallback<unknown> = (data: unknown) => {
      try {
        callback(data as T);
      } catch (error) {
        console.error(`Error in event callback for ${eventType}:`, error);
      }
    };

    this.listeners.get(eventType)!.add(wrappedCallback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(wrappedCallback);
      if (this.listeners.get(eventType)?.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Subscribe to an event only once
   */
  once<T = unknown>(eventType: string, callback: EventCallback<T>): EventUnsubscribe {
    const unsubscribe = this.on(eventType, (data: T) => {
      callback(data);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Emit an event
   */
  emit<T = unknown>(eventType: string, data: T, source?: string): void {
    const event: EventBusEvent<T> = {
      type: eventType,
      data,
      timestamp: Date.now(),
      source: source || undefined,
    };

    // Add to history
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
    }

    // Notify listeners
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data as unknown);
        } catch (error) {
          console.error(`Error in event callback for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event type
   */
  off(eventType: string): void {
    this.listeners.delete(eventType);
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
  }

  /**
   * Get event history
   */
  getHistory(eventType?: string): EventBusEvent[] {
    if (eventType) {
      return this.eventHistory.filter(event => event.type === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Get active event types
   */
  getActiveEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listener count for an event type
   */
  getListenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.size || 0;
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Common event types
export const EVENT_TYPES = {
  ERROR_OCCURRED: 'error:occurred',
  ERROR_RESOLVED: 'error:resolved',
  USER_ACTION: 'user:action',
  PERFORMANCE_METRIC: 'performance:metric',
  SEO_ANALYSIS_COMPLETE: 'seo:analysis:complete',
  COMPONENT_MOUNTED: 'component:mounted',
  COMPONENT_UNMOUNTED: 'component:unmounted',
  ROUTE_CHANGED: 'route:changed',
  THEME_CHANGED: 'theme:changed',
  LANGUAGE_CHANGED: 'language:changed',
} as const;

// Type-safe event emitter helper
export function createTypedEventEmitter<T extends Record<string, unknown>>() {
  return {
    emit: <K extends keyof T>(eventType: K, data: T[K], source?: string) => {
      eventBus.emit(eventType as string, data, source);
    },
    on: <K extends keyof T>(eventType: K, callback: EventCallback<T[K]>) => {
      return eventBus.on(eventType as string, callback);
    },
    once: <K extends keyof T>(eventType: K, callback: EventCallback<T[K]>) => {
      return eventBus.once(eventType as string, callback);
    },
  };
}
