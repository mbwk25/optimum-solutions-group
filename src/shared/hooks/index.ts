// Barrel exports for hooks
export { default as useScrollAnimation } from './useScrollAnimation';
export { default as usePerformanceMonitor } from './usePerformanceMonitor';
export { default as useServiceWorker } from './useServiceWorker';
export { useToast, toast } from './use-toast';
export { useIsMobile } from './use-mobile';
export { useErrorHandler, useRetry } from './useErrorHandler';

// Accessibility hooks
export {
  useAccessibility,
  useFocusTrap,
  useFocusManagement,
  useAriaAttributes,
  useKeyboardNavigation,
  useScreenReaderAnnouncements,
  useUserPreferences,
  useAccessibilityValidation,
  useRovingTabIndex,
  useSkipLinks,
  useLandmarks
} from './useAccessibility';

// Performance benchmark hooks
export {
  usePerformanceBenchmark,
  useAutomatedPerformanceTesting,
  useCoreWebVitalsMonitor,
  usePerformanceRegressionDetector,
  usePerformanceMetrics
} from './usePerformanceBenchmark';
