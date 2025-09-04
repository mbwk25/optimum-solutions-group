import { useEffect, useCallback } from 'react';
import { errorHandler } from '@/shared/utils/errorHandler';

export interface ErrorHandlerOptions {
  component?: string;
  action?: string;
  context?: Record<string, unknown>;
  onError?: (error: Error) => void;
}

/**
 * Hook for handling errors in functional components
 * Provides both synchronous and asynchronous error handling utilities
 */
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { component = 'UnknownComponent', action, context, onError } = options;

  // Handle synchronous errors
  const handleError = useCallback((error: Error | string, additionalContext?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorObj = error instanceof Error ? error : new Error(error);
    
    errorHandler.handleError(errorMessage, {
      component,
      action: action || 'unknown',
      error: errorObj.message,
      ...context,
      ...additionalContext,
    });
    
    onError?.(errorObj);
  }, [component, action, context, onError]);

  // Handle asynchronous operations with error boundary
  const handleAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    actionName?: string,
    additionalContext?: Record<string, unknown>
  ): Promise<T | null> => {
    return errorHandler.wrapAsync(asyncFn, {
      component,
      action: actionName || action || 'async_operation',
      ...context,
      ...additionalContext,
    });
  }, [component, action, context]);

  // Handle synchronous operations with error boundary
  const handleSync = useCallback(<T>(
    syncFn: () => T,
    actionName?: string,
    additionalContext?: Record<string, unknown>
  ): T | null => {
    return errorHandler.wrapSync(syncFn, {
      component,
      action: actionName || action || 'sync_operation',
      ...context,
      ...additionalContext,
    });
  }, [component, action, context]);

  // Set up global error listeners for this component
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { source: 'unhandledrejection' }
      );
    };

    const handleGlobalError = (event: ErrorEvent) => {
      handleError(event.error || new Error(event.message), {
        source: 'globalerror',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    // Only add listeners in development or if explicitly requested
    if (import.meta.env.MODE === 'development') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleGlobalError);

      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleGlobalError);
      };
    }
    
    return undefined;
  }, [handleError]);

  return {
    handleError,
    handleAsync,
    handleSync,
    // Expose error handler utilities
    getStoredErrors: errorHandler.getStoredErrors.bind(errorHandler),
    clearStoredErrors: errorHandler.clearStoredErrors.bind(errorHandler),
  };
};

/**
 * Hook for retrying failed operations with exponential backoff
 */
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
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return retry(operation, retryCount + 1);
    }
  }, [maxRetries, baseDelay]);

  return { retry };
};

export default useErrorHandler;
