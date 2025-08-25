/**
 * Core Web Vitals Higher-Order Component
 * Separated from components to fix React Fast Refresh warnings
 */

import React from 'react';
import { useCoreWebVitals } from '../hooks/useCoreWebVitals';
import { CoreWebVitalsOptions } from '../types/coreWebVitals';

/**
 * Higher-order component for automatic Core Web Vitals monitoring
 */
export function withCoreWebVitals<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: CoreWebVitalsOptions = {}
) {
  const WithCoreWebVitalsComponent = (props: T) => {
    const webVitals = useCoreWebVitals(options);
    
    return <WrappedComponent {...props} webVitals={webVitals} />;
  };

  WithCoreWebVitalsComponent.displayName = 
    `withCoreWebVitals(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithCoreWebVitalsComponent;
}
