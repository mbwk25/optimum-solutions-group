/**
 * Comprehensive error handling utility for the application
 * Prevents console errors and provides better error management
 * @module ErrorHandler
 * @description Comprehensive error handling utility for the application
 * @requires ErrorContext
 * @requires ErrorHandler
 * @requires errorHandler
 * @requires handleError
 * @requires wrapAsync
 * @requires wrapSync
 * @requires getStoredErrors
 */

/**
 * Error context interface for error handling
 * @interface ErrorContext
 * @property {string} [message] - Error message
 * @property {string} [timestamp] - Timestamp of the error
 * @property {string} [url] - URL where the error occurred
 * @property {string} [userAgent] - User agent of the browser
 * @property {string} [error] - Error message
 * @property {string} [filename] - Filename where the error occurred
 * @property {number} [lineno] - Line number where the error occurred
 * @property {number} [colno] - Column number where the error occurred
 * @property {string} [component] - Component where the error occurred
 * @property {string} [action] - Action that triggered the error
 * @property {unknown} [data] - Additional data about the error
 * @property {unknown} [reason] - Reason for the error
 */

interface ErrorContext {
  message?: string;
  timestamp?: string;
  url?: string;
  userAgent?: string;
  error?: string;
  filename?: string;
  lineno?: number;
  component?: string;
  action?: string;
  data?: unknown;
  reason?: unknown;
  colno?: number;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount: Map<string, number> = new Map();
  private readonly MAX_ERRORS_PER_MINUTE = 10;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.handleError('Unhandled Promise Rejection', {
        reason: event.reason,
        component: 'Global'
      });
      event.preventDefault();
    });

    // Handle global errors
    window.addEventListener('error', (event: ErrorEvent) => {
      this.handleError('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event: ErrorEvent) => {
      if (event.target && event.target !== window) {
        const target: HTMLElement = event.target as HTMLElement;
        if (target.tagName === 'IMG' || target.tagName === 'LINK' || target.tagName === 'SCRIPT') {
          this.handleResourceError(target as HTMLImageElement | HTMLLinkElement | HTMLScriptElement);
        }
      }
    }, true);
  }

  private handleResourceError(element: HTMLImageElement | HTMLLinkElement | HTMLScriptElement): void {
    const tagName: string = element.tagName.toLowerCase();
    const src: string = (element as HTMLImageElement).src || (element as HTMLLinkElement).href || 'unknown';
    
    // Only log resource errors in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Failed to load ${tagName}: ${src}`);
    }
  }

  private shouldLogError(errorType: string): boolean {
    const now: number = Date.now();
    const minuteAgo: number = now - 60000; // 1 minute ago
    
    // Clean old entries
    for (const [key, timestamp] of this.errorCount.entries()) {
      if (timestamp < minuteAgo) {
        this.errorCount.delete(key);
      }
    }

    const key: string = `${errorType}_${Math.floor(now / 60000)}`; // Group by minute
    const count: number = this.errorCount.get(key) || 0;
    
    if (count >= this.MAX_ERRORS_PER_MINUTE) {
      return false;
    }

    this.errorCount.set(key, count + 1);
    return true;
  }

  handleError(message: string, context: ErrorContext = {}): void {
    if (!this.shouldLogError(message)) {
      return; // Prevent error spam
    }

    const errorInfo: ErrorContext = {
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context
    };

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', errorInfo);
    } else {
      // In production, send to error tracking service
      this.sendToErrorService(errorInfo);
    }
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

export default errorHandler; 