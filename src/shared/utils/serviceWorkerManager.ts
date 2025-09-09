// Simplified service worker manager
export class ServiceWorkerManager {
  async register() {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered');
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();