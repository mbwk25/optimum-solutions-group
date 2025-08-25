/**
 * Core Web Vitals Context Hook
 * Separated from components to fix React Fast Refresh warnings
 */

import { useContext } from 'react';
import { CoreWebVitalsContext } from '../contexts/CoreWebVitalsContext';

/**
 * Hook to use Core Web Vitals context
 */
export function useCoreWebVitalsContext() {
  const context = useContext(CoreWebVitalsContext);
  if (!context) {
    throw new Error('useCoreWebVitalsContext must be used within a CoreWebVitalsProvider');
  }
  return context;
}
