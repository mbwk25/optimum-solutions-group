import { lazy, ComponentType } from 'react';

// Simple lazy loading with retry functionality
export const lazyWithRetry = <Props = unknown>(
  importFunc: () => Promise<{ default: ComponentType<Props> }>,
  retries: number = 2,
  delay: number = 1000
) => {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    // Clamp retries to at least 0 to ensure the loop runs the expected number of times
    const clampedRetries: number = Math.max(0, retries);
    // Clamp delay to avoid negative waits
    const clampedDelay: number = Math.max(0, delay);
    
    for (let i = 0; i <= clampedRetries; i++) {
      try {
        return await importFunc();
      } catch (error) {
        // Normalize non-Error throwables into Error instances
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < clampedRetries) {
          await new Promise(resolve => setTimeout(resolve, clampedDelay));
        }
      }
    }
    
    // Ensure a non-null Error is thrown if all attempts fail
    throw lastError ?? new Error('Dynamic import failed');
  });
};

// Simple lazy loading with metrics (simplified version)
export const lazyWithMetrics = <Props = unknown>(
  importFunc: () => Promise<{ default: ComponentType<Props> }>,
  componentName: string
) => {
  return lazy(async () => {
    try {
      const module: { default: ComponentType<Props> } = await importFunc();
      return module;
    } catch (error) {
      console.error(`Failed to load ${componentName}:`, error);
      throw error;
    }
  });
};