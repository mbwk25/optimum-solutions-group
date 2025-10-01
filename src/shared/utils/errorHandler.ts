// Comprehensive error handler with advanced features
import { ErrorContext } from '../types/errorContext';
import { compositeErrorHandler } from '../factories/errorHandlerFactory';
import { eventBus, EVENT_TYPES } from '../services/eventBus';

export interface ErrorInfo {
  componentStack: string;
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

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError('Unhandled Promise Rejection', {
        reason: event.reason,
        component: 'Global'
      });
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleError(event.message, {
        error: event.error,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        component: 'Global'
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'IMG' || target.tagName === 'LINK' || target.tagName === 'SCRIPT')) {
        this.handleResourceError(target as HTMLImageElement | HTMLLinkElement | HTMLScriptElement);
      }
    }, true); // Use capture phase to catch resource errors
  }

  handleError(error: Error, errorInfo?: ErrorInfo, context?: ErrorContext): void;
  handleError(message: string, context?: ErrorContext): void;
  handleError(errorOrMessage: Error | string, errorInfoOrContext?: ErrorInfo | ErrorContext, context?: ErrorContext): void {
    if (typeof errorOrMessage === 'string') {
      // String message overload
      const message = errorOrMessage;
      const errorContext = errorInfoOrContext as ErrorContext || {};
      
      if (!this.shouldLogError(message)) {
        return; // Prevent error spam
      }

      const errorInfo: ErrorContext = {
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...errorContext
      };

      // Use composite error handler for proper categorization
      const error = new Error(message);
      compositeErrorHandler.handle(error, errorInfo);

      // Emit event for other components
      eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
        type: 'application',
        message,
        context: errorInfo,
      });
    } else {
      // Error object overload
      const error = errorOrMessage;
      const errorInfo = errorInfoOrContext as ErrorInfo;
      const errorContext = context || {};
      
      // Use composite error handler
      compositeErrorHandler.handle(error, errorContext);

      // Emit event for other components
      eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
        type: 'application',
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        context: errorContext,
      });
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

  // Handle resource loading errors
  private handleResourceError(element: HTMLImageElement | HTMLLinkElement | HTMLScriptElement): void {
    const resourceUrl = 'src' in element ? element.src : ('href' in element ? element.href : '');
    
    const errorInfo: ErrorContext = {
      message: `Resource loading error: ${element.tagName} - ${resourceUrl}`,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      component: 'ResourceLoader'
    };

    // Use composite error handler
    const error = new Error(`Resource loading failed: ${element.tagName}`);
    compositeErrorHandler.handle(error, errorInfo);

    // Emit event for other components
    eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
      type: 'resource',
      message: errorInfo.message,
      context: errorInfo,
    });
  }

  // Error persistence is now handled by the composite error handler
  // and error reporting service through the repository pattern

  // Utility method to wrap async functions with error handling
  async wrapAsync<T>(fn: () => Promise<T>, context?: ErrorContext): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.handleError(errorMessage, context);
      return null;
    }
  }

  // Utility method to wrap synchronous functions with error handling
  wrapSync<T>(fn: () => T, context?: ErrorContext): T | null {
    try {
      return fn();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.handleError(errorMessage, context);
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
