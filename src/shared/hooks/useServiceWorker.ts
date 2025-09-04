import { useState, useEffect } from 'react';

export const useServiceWorker = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if service workers are supported
    setIsSupported('serviceWorker' in navigator);

    if ('serviceWorker' in navigator && import.meta.env['MODE'] === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(() => setIsRegistered(true))
        .catch(() => setIsRegistered(false));
    }
  }, []);

  const register = () => {
    console.log('Service worker registration triggered');
  };

  const unregister = () => {
    console.log('Service worker unregistration triggered');
  };

  return {
    isRegistered,
    isSupported,
    register,
    unregister
  };
};

export default useServiceWorker;