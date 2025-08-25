/**
 * Core Web Vitals - Hook Exports
 * This file has been refactored to fix React Fast Refresh warnings.
 * Only exports the hook and types/constants.
 * 
 * For React components, import from:
 * - CoreWebVitalsProvider from '../components/CoreWebVitalsProvider'
 */

// Export types and constants
export {
  CWV_THRESHOLDS,
  type WebVitalsMetric,
  type CoreWebVitalsData,
  type CoreWebVitalsOptions,
  type CoreWebVitalsContextType,
} from '../types/coreWebVitals';

// Export the main hook
export { useCoreWebVitals } from './useCoreWebVitals';

// Note: Components have been moved to ../components/CoreWebVitalsProvider.tsx
// to fix React Fast Refresh warnings.
