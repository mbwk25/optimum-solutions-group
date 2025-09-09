// Comprehensive error handler with advanced features
export interface ErrorInfo {
  componentStack: string;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  message?: string;
  timestamp?: string;
  url?: string;
  userAgent?: string;
  error?: string;
}

class ErrorHandler {
  private errorCount = new Map<string, number>();
  private readonly MAX_ERRORS_PER_MINUTE = 10;

  private static instance: ErrorHandler;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Overloaded handleError method to handle both Error objects and string messages
  handleError(error: Error, errorInfo?: ErrorInfo, context?: ErrorContext): void;
  handleError(message: string, context?: ErrorContext): void;
  handleError(errorOrMessage: Error | string, errorInfoOrContext?: ErrorInfo | ErrorContext, context?: ErrorContext): void {
    // Handle Error object case
    if (errorOrMessage instanceof Error) {
      const error = errorOrMessage;
      const errorInfo = errorInfoOrContext as ErrorInfo;
      // Only log errors in development
      if (process.env['NODE_ENV'] === 'development') {
        console.error('Error caught:', error);
        if (errorInfo) {
          console.error('Component stack:', errorInfo.componentStack);
        }
        if (context) {
          console.error('Context:', context);
        }
      }
      return;
    }

    // Handle string message case
    const message = errorOrMessage;
    const contextParam = errorInfoOrContext as ErrorContext || {};
    
    if (!this.shouldLogError(message)) {
      return; // Prevent error spam
    }

    const errorInfo: ErrorContext = {
      message,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...contextParam
    };

    // Log in development
    if (process.env["NODE_ENV"] === 'development') {
      console.error('Application Error:', errorInfo);
    } else {
      // In production, send to error tracking service
      this.sendToErrorService(errorInfo);
    }
  }

  private shouldLogError(errorType: string): boolean {
    const now: number = Date.now();
    const currentMinute: number = Math.floor(now / 60000);
    const minuteAgo: number = currentMinute - 1;
    
    // Clean old entries (remove keys from previous minutes)
    for (const [key] of this.errorCount.entries()) {
      const keyMinute: number = parseInt(key.split('_').pop() || '0');
      if (keyMinute < minuteAgo) {
        this.errorCount.delete(key);
      }
    }

    const key: string = `${errorType}_${currentMinute}`;
    const count: number = this.errorCount.get(key) || 0;
    
    if (count >= this.MAX_ERRORS_PER_MINUTE) {
      return false;
    }

    this.errorCount.set(key, count + 1);
    return true;
  }

  private sendToErrorService(errorInfo: ErrorContext): void {
    // Here you would integrate with your error tracking service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    
    // For now, we'll just store in localStorage for debugging
    try {
      const errors: ErrorContext[] = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorInfo);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  // Utility method to wrap async functions with error handling
  async wrapAsync<T>(fn: () => Promise<T>, context?: ErrorContext): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handleError('Async Function Error', {
        ...context,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  // Utility method to wrap synchronous functions with error handling
  wrapSync<T>(fn: () => T, context?: ErrorContext): T | null {
    try {
      return fn();
    } catch (error) {
      this.handleError('Sync Function Error', {
        ...context,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  // Get stored errors for debugging
  getStoredErrors(): ErrorContext[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored errors
  clearStoredErrors(): void {
    try {
      localStorage.removeItem('app_errors');
    } catch {
      // Silently fail
    }
  }
}

// Export singleton instance
export const errorHandler: ErrorHandler = ErrorHandler.getInstance();

// Export utility functions
export const handleError: (message: string, context?: ErrorContext) => void = (message: string, context?: ErrorContext): void => 
  errorHandler.handleError(message, context);

export const wrapAsync: <T>(fn: () => Promise<T>, context?: ErrorContext) => Promise<T | null> = <T>(fn: () => Promise<T>, context?: ErrorContext): Promise<T | null> => 
  errorHandler.wrapAsync(fn, context);

export const wrapSync: <T>(fn: () => T, context?: ErrorContext) => T | null = <T>(fn: () => T, context?: ErrorContext): T | null => 
  errorHandler.wrapSync(fn, context);

export const getStoredErrors: () => ErrorContext[] = (): ErrorContext[] => 
  errorHandler.getStoredErrors();

export const clearStoredErrors: () => void = (): void => 
  errorHandler.clearStoredErrors();

export default errorHandler;
