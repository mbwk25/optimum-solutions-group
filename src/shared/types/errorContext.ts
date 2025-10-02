/**
 * @fileoverview Error context types following Interface Segregation Principle
 * @description Focused interfaces for different error contexts
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

// Base error context interface
export interface BaseErrorContext {
  component?: string;
  message?: string;
  timestamp?: string;
}

// Browser-specific error context
export interface BrowserErrorContext extends BaseErrorContext {
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  userAgent?: string;
  url?: string;
}

// User action error context
export interface UserErrorContext extends BaseErrorContext {
  userId?: string;
  action?: string;
  sessionId?: string;
}

// Network error context
export interface NetworkErrorContext extends BaseErrorContext {
  url?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
}

// Promise rejection error context
export interface PromiseErrorContext extends BaseErrorContext {
  reason?: unknown;
  promise?: Promise<unknown>;
}

// Resource loading error context
export interface ResourceErrorContext extends BaseErrorContext {
  resourceType?: 'image' | 'script' | 'stylesheet' | 'font' | 'other';
  resourceUrl?: string;
  loadTime?: number;
}

// Union type for all error contexts
export type ErrorContext = 
  | BrowserErrorContext 
  | UserErrorContext 
  | NetworkErrorContext 
  | PromiseErrorContext 
  | ResourceErrorContext;

// Type guards for error context discrimination
export const isBrowserErrorContext = (context: ErrorContext): context is BrowserErrorContext => {
  return (
    ('filename' in context && typeof context.filename === 'string' && context.filename.length > 0) ||
    ('lineno' in context && typeof context.lineno === 'number' && !isNaN(context.lineno)) ||
    ('colno' in context && typeof context.colno === 'number' && !isNaN(context.colno))
  ) && (
    !('userId' in context) && 
    !('action' in context) && 
    !('method' in context) && 
    !('statusCode' in context) && 
    !('responseTime' in context) && 
    !('reason' in context) && 
    !('promise' in context) && 
    !('resourceType' in context) && 
    !('resourceUrl' in context)
  );
};

export const isUserErrorContext = (context: ErrorContext): context is UserErrorContext => {
  return (
    ('userId' in context && typeof context.userId === 'string') ||
    ('sessionId' in context && typeof context.sessionId === 'string') ||
    ('action' in context && typeof context.action === 'string' && context.action.length > 0)
  ) && (
    !('filename' in context) && 
    !('lineno' in context) && 
    !('colno' in context) && 
    !('method' in context) && 
    !('statusCode' in context) && 
    !('responseTime' in context) && 
    !('reason' in context) && 
    !('promise' in context) && 
    !('resourceType' in context) && 
    !('resourceUrl' in context)
  );
};

export const isNetworkErrorContext = (context: ErrorContext): context is NetworkErrorContext => {
  return (
    ('method' in context && typeof context.method === 'string' && context.method.length > 0) ||
    ('statusCode' in context && typeof context.statusCode === 'number' && !isNaN(context.statusCode)) ||
    ('responseTime' in context && typeof context.responseTime === 'number' && !isNaN(context.responseTime))
  ) && (
    !('filename' in context) && 
    !('lineno' in context) && 
    !('colno' in context) && 
    !('userId' in context) && 
    !('action' in context) && 
    !('reason' in context) && 
    !('promise' in context) && 
    !('resourceType' in context) && 
    !('resourceUrl' in context)
  );
};

export const isPromiseErrorContext = (context: ErrorContext): context is PromiseErrorContext => {
  return (
    ('reason' in context && context.reason !== undefined) ||
    ('promise' in context && (
      context.promise instanceof Promise ||
      (typeof context.promise === 'object' && context.promise !== null && typeof (context.promise as any).then === 'function')
    ))
  ) && (
    !('filename' in context) && 
    !('lineno' in context) && 
    !('colno' in context) && 
    !('userId' in context) && 
    !('action' in context) && 
    !('method' in context) && 
    !('statusCode' in context) && 
    !('responseTime' in context) && 
    !('resourceType' in context) && 
    !('resourceUrl' in context)
  );
};

export const isResourceErrorContext = (context: ErrorContext): context is ResourceErrorContext => {
  return (
    ('resourceType' in context && typeof context.resourceType === 'string' && context.resourceType.length > 0) ||
    ('resourceUrl' in context && typeof context.resourceUrl === 'string' && context.resourceUrl.length > 0)
  ) && (
    !('filename' in context) && 
    !('lineno' in context) && 
    !('colno' in context) && 
    !('userId' in context) && 
    !('action' in context) && 
    !('method' in context) && 
    !('statusCode' in context) && 
    !('responseTime' in context) && 
    !('reason' in context) && 
    !('promise' in context)
  );
};
