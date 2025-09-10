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
  return 'filename' in context || 'lineno' in context || 'colno' in context;
};

export const isUserErrorContext = (context: ErrorContext): context is UserErrorContext => {
  return 'userId' in context || 'action' in context;
};

export const isNetworkErrorContext = (context: ErrorContext): context is NetworkErrorContext => {
  return 'method' in context || 'statusCode' in context || 'responseTime' in context;
};

export const isPromiseErrorContext = (context: ErrorContext): context is PromiseErrorContext => {
  return 'reason' in context || 'promise' in context;
};

export const isResourceErrorContext = (context: ErrorContext): context is ResourceErrorContext => {
  return 'resourceType' in context || 'resourceUrl' in context;
};
