import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('SW registered: ', registration);
            }
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available - could show update notification
                    if (process.env.NODE_ENV === 'development') {
                      console.log('New version available! Please refresh.');
                    }
                  }
                });
              }
            });
          })
          .catch((registrationError) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('SW registration failed: ', registrationError);
            }
          });
      });
    }
  }, []);
};

export default useServiceWorker;