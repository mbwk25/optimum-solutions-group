/**
 * @fileoverview Error Handler Factory Pattern
 * @description Factory for creating specialized error handlers
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import { ErrorContext, isPromiseErrorContext, isResourceErrorContext, isBrowserErrorContext, isUserErrorContext, isNetworkErrorContext } from '../types/errorContext';
import { eventBus, EVENT_TYPES } from '../services/eventBus';
import { errorReportingService, ErrorReport } from '../services/errorReportingService';

export interface ErrorHandler {
  handle(error: Error, context: ErrorContext): void;
  canHandle(context: ErrorContext): boolean;
  getHandlerType(): string;
}

export class BrowserErrorHandler implements ErrorHandler {
  canHandle(context: ErrorContext): boolean {
    return isBrowserErrorContext(context);
  }

  handle(error: Error, context: ErrorContext): void {
    // Type-safe validation using type guard
    if (!isBrowserErrorContext(context)) {
      console.warn('BrowserErrorHandler received non-browser context:', context);
      return;
    }
    // ...
    
    // Now TypeScript knows context is BrowserErrorContext
    // Emit event for other components to react
    eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
      type: 'browser',
      error: error.message,
      filename: context.filename,
      line: context.lineno,
      column: context.colno,
    });

    // Report to analytics
    const report: ErrorReport = errorReportingService.reportError(error, context);
    
    // Log with context (only in non-test environments)
    if (process.env['NODE_ENV'] !== 'test') {
      console.error('Browser Error:', {
        message: error.message,
        filename: context.filename,
        line: context.lineno,
        column: context.colno,
        stack: error.stack,
        reportId: report.id,
      });
    }
  }

  getHandlerType(): string {
    return 'browser';
  }
}

export class UserErrorHandler implements ErrorHandler {
  canHandle(context: ErrorContext): boolean {
    return isUserErrorContext(context);
  }

  handle(error: Error, context: ErrorContext): void {
    // Type-safe validation using type guard
    if (!isUserErrorContext(context)) {
      console.warn('UserErrorHandler received non-user context:', context);
      return;
    }
    
    // Now TypeScript knows context is UserErrorContext
    // Emit event for user experience tracking
    eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
      type: 'user',
      error: error.message,
      userId: context.userId,
      action: context.action,
    });

    // Report to analytics
    const report: ErrorReport = errorReportingService.reportError(error, context);
    
    // Log with user context (only in non-test environments)
    if (process.env['NODE_ENV'] !== 'test') {
      console.error('User Error:', {
        message: error.message,
        userId: context.userId,
        action: context.action,
        sessionId: context.sessionId,
        reportId: report.id,
      });
    }
  }

  getHandlerType(): string {
    return 'user';
  }
}

export class NetworkErrorHandler implements ErrorHandler {
  canHandle(context: ErrorContext): boolean {
    return isNetworkErrorContext(context);
  }

  handle(error: Error, context: ErrorContext): void {
    // Type-safe validation using type guard
    if (!isNetworkErrorContext(context)) {
      console.warn('NetworkErrorHandler received non-network context:', context);
      return;
    }
    
    // Now TypeScript knows context is NetworkErrorContext
    // Emit event for network monitoring
    eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
      type: 'network',
      error: error.message,
      url: context.url,
      method: context.method,
      statusCode: context.statusCode,
      responseTime: context.responseTime,
    });

    // Report to analytics
    const report: ErrorReport = errorReportingService.reportError(error, context);
    
    // Log with network context (only in non-test environments)
    if (process.env['NODE_ENV'] !== 'test') {
      console.error('Network Error:', {
        message: error.message,
        url: context.url,
        method: context.method,
        statusCode: context.statusCode,
        responseTime: context.responseTime,
        reportId: report.id,
      });
    }
  }

  getHandlerType(): string {
    return 'network';
  }
}

export class PromiseErrorHandler implements ErrorHandler {
  canHandle(context: ErrorContext): boolean {
    return isPromiseErrorContext(context);
  }
  
  handle(error: Error, context: ErrorContext): void {
    // Type-safe validation using type guard
    if (!isPromiseErrorContext(context)) {
      console.warn('PromiseErrorHandler received non-promise context:', context);
      return;
    }
    
    // Now TypeScript knows context is PromiseErrorContext
    // Emit event for promise monitoring
    eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
      type: 'promise',
      error: error.message,
      reason: context.reason,
    });

    // Report to analytics
    const report: ErrorReport = errorReportingService.reportError(error, context);
    
    // Log promise rejection (only in non-test environments)
    if (process.env['NODE_ENV'] !== 'test') {
      console.error('Promise Error:', {
        message: error.message,
        reason: context.reason,
        reportId: report.id,
      });
    }
  }

  getHandlerType(): string {
    return 'promise';
  }
}

export class ResourceErrorHandler implements ErrorHandler {
  canHandle(context: ErrorContext): boolean {
    return isResourceErrorContext(context);
  }

  handle(error: Error, context: ErrorContext): void {
    // Type-safe validation using type guard
    if (!isResourceErrorContext(context)) {
      console.warn('ResourceErrorHandler received non-resource context:', context);
      return;
    }
    
    // Now TypeScript knows context is ResourceErrorContext
    // Emit event for resource monitoring
    eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
      type: 'resource',
      error: error.message,
      resourceType: context.resourceType,
      resourceUrl: context.resourceUrl,
    });

    // Report to analytics
    const report: ErrorReport = errorReportingService.reportError(error, context);
    
    // Log resource error (only in non-test environments)
    if (process.env['NODE_ENV'] !== 'test') {
      console.error('Resource Error:', {
        message: error.message,
        resourceType: context.resourceType,
        resourceUrl: context.resourceUrl,
        reportId: report.id,
      });
    }
  }

  getHandlerType(): string {
    return 'resource';
  }
}

export class ErrorHandlerFactory {
  private static handlers: ErrorHandler[] = [
    new BrowserErrorHandler(),
    new UserErrorHandler(),
    new NetworkErrorHandler(),
    new PromiseErrorHandler(),
    new ResourceErrorHandler(),
  ];

  /**
   * Get the appropriate handler for the given context
   */
  static getHandler(context: ErrorContext): ErrorHandler | null {
    return this.handlers.find((handler: ErrorHandler) => handler.canHandle(context)) || null;
  }

  /**
   * Get all available handlers
   */
  static getAllHandlers(): ErrorHandler[] {
    return [...this.handlers];
  }

  /**
   * Get handlers by type
   */
  static getHandlersByType(type: string): ErrorHandler[] {
    return this.handlers.filter((handler: ErrorHandler) => handler.getHandlerType() === type);
  }

  /**
   * Register a custom handler
   */
  static registerHandler(handler: ErrorHandler): void {
    this.handlers.unshift(handler); // Add to beginning for priority
  }

  /**
   * Unregister a handler
   */
  static unregisterHandler(handlerType: string): void {
    this.handlers = this.handlers.filter((handler: ErrorHandler) => handler.getHandlerType() !== handlerType);
  }
}

// Composite error handler that uses the factory
export class CompositeErrorHandler {
  handle(error: Error, context: ErrorContext): void {
    const handler: ErrorHandler | null = ErrorHandlerFactory.getHandler(context);
    
    if (handler) {
      handler.handle(error, context);
    } else {
      // Report to analytics even for unhandled errors
      errorReportingService.reportError(error, context);
      
      // Fallback to generic error handling (only in non-test environments)
      if (process.env['NODE_ENV'] !== 'test') {
        console.error('Unhandled Error:', {
          message: error.message,
          context,
          stack: error.stack,
        });
      }
      
      // Emit generic error event
      eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, {
        type: 'unknown',
        error: error.message,
        context,
      });
    }
  }
}

// Singleton instance
export const compositeErrorHandler = new CompositeErrorHandler();
