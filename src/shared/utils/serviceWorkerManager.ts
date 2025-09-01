import { logger } from './logger';

/**
 * Service Worker Manager
 * Handles registration, updates, and communication with service worker
 */

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdating: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

export interface ServiceWorkerConfig {
  swPath: string;
  scope: string;
  updateCheckInterval: number;
  enableNotifications: boolean;
  enableBackgroundSync: boolean;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig;
  private updateCheckInterval: number | null = null;
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();

  constructor(config: Partial<ServiceWorkerConfig> = {}) {
    this.config = {
      swPath: '/sw.js',
      scope: '/',
      updateCheckInterval: 60000, // 1 minute
      enableNotifications: true,
      enableBackgroundSync: true,
      ...config,
    };
  }

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerStatus> {
    if (!this.isSupported()) {
      return this.getStatus();
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        this.config.swPath,
        { scope: this.config.scope }
      );

      console.log('[SW Manager] Service worker registered:', this.registration.scope);

      // Set up event listeners
      this.setupEventListeners();

      // Start periodic update checks
      this.startUpdateChecks();

      // Emit registration event
      this.emit('registered', this.registration);

      return this.getStatus();
    } catch (error) {
      logger.error('[SW Manager] Service worker registration failed:', error);
      this.emit('error', error);
      return this.getStatus();
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const result: boolean = await this.registration.unregister();
      this.stopUpdateChecks();
      this.registration = null;

      console.log('[SW Manager] Service worker unregistered');
      this.emit('unregistered');

      return result;
    } catch (error) {
      logger.error('[SW Manager] Service worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Update the service worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      await this.registration.update();
      console.log('[SW Manager] Service worker update requested');
    } catch (error) {
      logger.error('[SW Manager] Service worker update failed:', error);
      throw error;
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) {
      throw new Error('No service worker waiting');
    }

    // Send message to skip waiting
    this.postMessage({ type: 'SKIP_WAITING' });

    // Wait for the new service worker to take control
    return new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        resolve();
      }, { once: true });
    });
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      return !!this.registration.waiting;
    } catch (error) {
      logger.error('[SW Manager] Update check failed:', error);
      return false;
    }
  }

  /**
   * Send message to service worker
   */
  postMessage(message: Record<string, unknown>): void {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  /**
   * Request persistent notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'granted') {
      return Notification.permission;
    }

    const permission: NotificationPermission = await Notification.requestPermission();
    console.log('[SW Manager] Notification permission:', permission);

    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      const applicationServerKey: ArrayBuffer = this.urlB64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer;
      const subscription: PushSubscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log('[SW Manager] Push subscription created');
      return subscription;
    } catch (error) {
      logger.error('[SW Manager] Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Get current service worker status
   */
  getStatus(): ServiceWorkerStatus {
    return {
      isSupported: this.isSupported(),
      isRegistered: !!this.registration,
      isUpdating: !!this.registration?.installing,
      hasUpdate: !!this.registration?.waiting,
      registration: this.registration,
    };
  }

  /**
   * Check if service workers are supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: unknown[]) => void): void {
    const eventListeners: Array<(...args: unknown[]) => void> | undefined = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, ...args: unknown[]): void {
    const eventListeners: Array<(...args: unknown[]) => void> | undefined = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }

  /**
   * Set up service worker event listeners
   */
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Handle service worker updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker: ServiceWorker | null = this.registration!.installing;
      if (newWorker) {
        console.log('[SW Manager] New service worker installing');
        this.emit('installing', newWorker);

        newWorker.addEventListener('statechange', () => {
          console.log('[SW Manager] Service worker state changed:', newWorker.state);

          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW Manager] New service worker available');
            this.emit('updateavailable', newWorker);
          }
        });
      }
    });

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[SW Manager] Message from service worker:', event.data);
      this.emit('message', event.data);
    });

    // Handle controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Manager] Service worker controller changed');
      this.emit('controllerchange');
    });
  }

  /**
   * Start periodic update checks
   */
  private startUpdateChecks(): void {
    if (this.updateCheckInterval) return;

    this.updateCheckInterval = window.setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateCheckInterval);
  }

  /**
   * Stop periodic update checks
   */
  private stopUpdateChecks(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }

  /**
   * Convert VAPID key to Uint8Array (with ArrayBuffer)
   */
  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding: string = '='.repeat((4 - base64String.length % 4) % 4);
    const base64: string = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData: string = window.atob(base64);
    const buffer: ArrayBuffer = new ArrayBuffer(rawData.length);
    const outputArray: Uint8Array = new Uint8Array(buffer);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Singleton instance
export const serviceWorkerManager: ServiceWorkerManager = new ServiceWorkerManager();

// Auto-register in production
if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    serviceWorkerManager.register().then((status) => {
      if (status.isRegistered) {
        console.log('[SW Manager] Service worker registered successfully');
      }
    });
  });
}

export default serviceWorkerManager;
