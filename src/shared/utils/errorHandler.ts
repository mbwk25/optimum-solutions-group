// Comprehensive error handler with advanced features
import { ErrorContext } from '../types/errorContext';
import { compositeErrorHandler } from '../factories/errorHandlerFactory';
import { eventBus, EVENT_TYPES } from '../services/eventBus';

export interface ErrorInfo {
  componentStack: string;
}

class ErrorHandler {
  private errorCount: Map<string, number> = new Map<string, number>();
  private readonly MAX_ERRORS_PER_MINUTE = 10;

  private static instance: ErrorHandler;

  constructor() {
    // Keep constructor lightweight
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
      ErrorHandler.instance.setupGlobalErrorHandlers();
    }
    return ErrorHandler.instance;
  }
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: Event & { reason: unknown }) => {
      this.handleError('Unhandled Promise Rejection', {
        reason: event.reason,
        component: 'Global'
      });
    });

    // Handle global errors
    window.addEventListener('error', (event: ErrorEvent) => {
      this.handleError(event.message, {
        error: event.error,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        component: 'Global'
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event: ErrorEvent) => {
      // Early return for non-resource errors to avoid duplicate processing
      const target: HTMLElement = event.target as HTMLElement;
      if (!target || !(target.tagName === 'IMG' || target.tagName === 'LINK' || target.tagName === 'SCRIPT')) {
        return;
      }
      
      this.handleResourceError(target as HTMLImageElement | HTMLLinkElement | HTMLScriptElement);
    }, true); // Use capture phase to catch resource errors
  }

  handleError(error: Error, errorInfo?: ErrorInfo, context?: ErrorContext): void;
  handleError(message: string, context?: ErrorContext): void;
  handleError(errorOrMessage: Error | string, errorInfoOrContext?: ErrorInfo | ErrorContext, context?: ErrorContext): void {
    if (typeof errorOrMessage === 'string') {
      // String message overload
      const message: string = errorOrMessage;
      const errorContext: ErrorContext = errorInfoOrContext as ErrorContext || {};
      
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
      const error: Error = new Error(message);
      compositeErrorHandler.handle(error, errorInfo);

      // Emit event for other components
      eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
        type: 'application',
        message,
        context: errorInfo,
      });
    } else {
      // Error object overload
      const error: Error = errorOrMessage;
      const errorInfo: ErrorInfo = errorInfoOrContext as ErrorInfo;
      const errorContext: ErrorContext = context || {};
      
      if (!this.shouldLogError(error.message)) {
        return; // Prevent error spam
      }

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
    const getResourceType: (tagName: string) => 'image' | 'script' | 'stylesheet' | 'font' | 'other' = (tagName: string): 'image' | 'script' | 'stylesheet' | 'font' | 'other' => {
      switch (tagName) {
        case 'IMG': return 'image';
        case 'SCRIPT': return 'script';
        case 'LINK': return 'stylesheet';
        default: return 'other';
      }
    };

    const getResourceUrl: (element: HTMLImageElement | HTMLLinkElement | HTMLScriptElement) => string = (element: HTMLImageElement | HTMLLinkElement | HTMLScriptElement): string => {
      if ('src' in element) {
        return element.src;
      }
      if ('href' in element) {
        return element.href;
      }
      return '';
    };

    const errorInfo: ErrorContext = {
      message: `Resource loading error: ${element.tagName}`,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      component: 'ResourceLoader',
      resourceType: getResourceType(element.tagName),
      resourceUrl: getResourceUrl(element as HTMLImageElement | HTMLLinkElement | HTMLScriptElement)
    };

    // Build rate limiting key for resource errors
    const rateLimitKey: string = `${element.tagName}:${getResourceUrl(element as HTMLImageElement | HTMLLinkElement | HTMLScriptElement)}`;
    
    // Check if we should log this error (rate limiting)
    if (this.shouldLogError(rateLimitKey)) {
      // Use composite error handler
      const error: Error = new Error(`Resource loading failed: ${element.tagName}`);
      compositeErrorHandler.handle(error, errorInfo);

      // Emit event for other components
      eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
        type: 'resource',
        message: errorInfo.message,
        context: errorInfo,
      });
    } else {
      // Rate limited - use lightweight console.warn instead
      console.warn(`Resource loading error: ${element.tagName} (rate limited)`, errorInfo);
    }
  }

  // Error persistence is now handled by the composite error handler
  // and error reporting service through the repository pattern

  // Utility method to wrap async functions with error handling
  async wrapAsync<T>(fn: () => Promise<T>, context?: ErrorContext): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      const errorToHandle: Error = error instanceof Error ? error : new Error(String(error));
      this.handleError(errorToHandle, undefined, context);
      return null;
    }
  }

  // Utility method to wrap synchronous functions with error handling
  wrapSync<T>(fn: () => T, context?: ErrorContext): T | null {
    try {
      return fn();
    } catch (error) {
      const errorToHandle: Error = error instanceof Error ? error : new Error(String(error));
      this.handleError(errorToHandle, undefined, context);
      return null;
    }
  }

  // Get stored errors for debugging
  getStoredErrors(): ErrorContext[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]') as ErrorContext[] || [];
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
