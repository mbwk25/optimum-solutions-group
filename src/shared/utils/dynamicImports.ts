import { lazy, ComponentType } from 'react';

// Simple lazy loading with retry functionality
export const lazyWithRetry = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries: number = 2,
  delay: number = 1000
) => {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await importFunc();
      } catch (error) {
        lastError = error as Error;
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  });
};

// Simple lazy loading with metrics (simplified version)
export const lazyWithMetrics = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string
) => {
  return lazy(async () => {
    try {
      const module = await importFunc();
      return module;
    } catch (error) {
      console.error(`Failed to load ${componentName}:`, error);
      throw error;
    }
  });
};