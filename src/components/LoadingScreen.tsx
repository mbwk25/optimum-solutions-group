import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="relative animate-pulse">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img 
              src={logo} 
              alt="Optimum Solutions Group"
              className="h-16 w-16 animate-spin"
              style={{ animationDuration: '3s' }}
            />
            <div className="font-bold text-2xl tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Optimum
              </span>
              <span className="text-foreground ml-1 font-light">
                Solutions
              </span>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                GROUP
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const usePageLoad = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return isLoading;
};

export { LoadingScreen, usePageLoad };