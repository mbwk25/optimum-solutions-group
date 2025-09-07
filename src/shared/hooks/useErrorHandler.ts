import { useCallback } from 'react';

export interface ErrorHandlerOptions {
  component?: string;
  action?: string;
  context?: Record<string, unknown>;
  onError?: (error: Error) => void;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const handleError = (error: Error | string) => {
    // Only log in development or if explicitly requested
    if (process.env['NODE_ENV'] === 'development' || options.onError) {
      console.error('Error:', error);
    }
    options.onError?.(error instanceof Error ? error : new Error(String(error)));
  };
  return { handleError };
};

export const useRetry = (maxRetries = 3, baseDelay = 1000) => {
  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return retry(operation, retryCount + 1);
    }
  }, [maxRetries, baseDelay]);

  return { retry };
};

export default useErrorHandler;