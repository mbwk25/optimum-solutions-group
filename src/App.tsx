import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { AccessibilityProvider } from "@/shared/components/AccessibilityProvider";

// Direct import for main page to ensure React app bundles properly
import Index from './pages/Index';

// Import enhanced lazy loading utilities for other pages
import { lazyWithRetry } from '@/shared/utils/dynamicImports';

const ComponentShowcase = lazyWithRetry(
  () => import("./pages/ComponentShowcase"),
  2, // 2 retries
  1000 // 1s delay
);

const NotFound = lazyWithRetry(
  () => import("./pages/NotFound"),
  2, // 2 retries
  1000 // 1s delay
);

const AnalyticsPage = lazyWithRetry(
  () => import("./pages/AnalyticsPage"),
  2, // 2 retries
  1000 // 1s delay
);

const PWAPage = lazyWithRetry(
  () => import("./pages/PWAPage"),
  2, // 2 retries
  1000 // 1s delay
);

// Enhanced loading fallback with better UX and accessibility
const LoadingFallback = () => (
  <div 
    className="flex flex-col items-center justify-center min-h-screen bg-background"
    role="status"
    aria-live="polite"
    aria-label="Loading application content"
  >
    <div className="relative w-20 h-20 mb-4" aria-hidden="true">
      <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    </div>
    <p className="text-foreground/60 text-sm mt-4">Loading application...</p>
    <span className="sr-only">Please wait while the application loads</span>
  </div>
);

// Optimized QueryClient configuration for better performance
const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingFallback />}>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/component-showcase" element={<ComponentShowcase />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/pwa" element={<PWAPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </Suspense>
        </QueryClientProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
};

export default App;