/**
 * React Test Utilities for Optimum Solutions Group
 * 
 * Handles JSX-specific test utilities that require .tsx extension
 * 
 * @version 1.0
 * @author Optimum Solutions Group
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Import providers from the application
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Import types from the main utilities file
import type { TestProviderOptions, AccessibilityTestResult } from './testUtils';
import { testAccessibility } from './testUtils';

/**
 * Custom render function with all necessary providers
 * Following the coding standards for TypeScript interfaces and React patterns
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions & TestProviderOptions = {}
): RenderResult => {
  const {
    withRouter = false,
    withAccessibility = false, // Disabled by default since provider might not be available
    withErrorBoundary = true,
    initialRoute = '/',
    ...renderOptions
  } = options;

  // Create providers wrapper following component composition pattern
  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => {
      let wrappedChildren = children;

      // Wrap with ErrorBoundary if enabled
      if (withErrorBoundary) {
        wrappedChildren = (
          <ErrorBoundary>
            {wrappedChildren}
          </ErrorBoundary>
        );
      }

      // Note: AccessibilityProvider commented out until we can safely import it
      // if (withAccessibility) {
      //   wrappedChildren = (
      //     <AccessibilityProvider>
      //       {wrappedChildren}
      //     </AccessibilityProvider>
      //   );
      // }

      // Wrap with Router if enabled
      if (withRouter) {
        // Mock window.history for initial route
        if (initialRoute !== '/') {
          window.history.pushState({}, 'Test page', initialRoute);
        }
        
        wrappedChildren = (
          <BrowserRouter>
            {wrappedChildren}
          </BrowserRouter>
        );
      }

      return <>{wrappedChildren}</>;
    };
  };

  return render(ui, { wrapper: createWrapper(), ...renderOptions });
};

/**
 * Utility to test component with accessibility requirements
 * Combines rendering and accessibility testing in one function
 */
export const renderAndTestAccessibility = async (
  ui: React.ReactElement,
  options?: RenderOptions & TestProviderOptions
): Promise<{ renderResult: RenderResult; accessibilityResult: AccessibilityTestResult }> => {
  const renderResult = renderWithProviders(ui, options);
  const accessibilityResult = await testAccessibility(renderResult.container);
  
  return {
    renderResult,
    accessibilityResult,
  };
};
