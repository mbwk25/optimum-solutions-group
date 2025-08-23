import React from "react";
import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import CriticalCSS from "@/shared/components/CriticalCSS";
import PerformanceOptimizer from "@/shared/components/PerformanceOptimizer";
import ResourcePrefetcher from "@/shared/components/ResourcePrefetcher";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import errorHandler from "@/shared/utils/errorHandler";

// Remove Vercel analytics if not needed, or install the package
// import { Analytics } from '@vercel/analytics/react';
// import { SpeedInsights } from '@vercel/speed-insights/react';
// Attach errorHandler to window.onerror for global error handling
if (typeof window !== "undefined" && typeof errorHandler === "function") {
  window.onerror = function (message, source, lineno, colno, error) {
    // errorHandler expects a string, so pass a formatted string
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof message === "string"
        ? message
        : "Unknown error";
    errorHandler.handleError(errorMsg);
    // Return false to allow default handling as well
    return false;
  };

  // Attach errorHandler to window.onunhandledrejection for Promise rejections
  window.onunhandledrejection = function (event) {
    // event.reason can be an Error or any value
    const reason =
      event && event.reason
        ? event.reason instanceof Error
          ? event.reason.message
          : typeof event.reason === "string"
          ? event.reason
          : JSON.stringify(event.reason)
        : "Unhandled promise rejection";
    errorHandler.handleError(reason);
    return false;
  };
}

// Lazy load pages with preloading
const lazyWithRetry = (componentImport: () => Promise<{ default: React.ComponentType }>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error('Lazy loading failed:', error);
      // Retry once after a small delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return componentImport();
    }
  });

// Preload function for critical routes
const preloadComponent = (component: () => Promise<{ default: React.ComponentType }>) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  link.href = component().then(module => {
    // This will trigger the preload
    return '';
  }) as unknown as string;
  document.head.appendChild(link);
};

// Lazy load pages with retry mechanism
const Index = lazyWithRetry(() => import("./pages/Index"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

// Preload critical components
if (typeof window !== 'undefined') {
  preloadComponent(() => import("./pages/Index"));
}

// Enhanced loading fallback with better UX
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background">
    <div className="relative w-20 h-20 mb-4">
      <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    </div>
    <p className="text-foreground/60 text-sm mt-4">Loading...</p>
  </div>
);

const queryClient: QueryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={<LoadingFallback />}>
            <BrowserRouter>
              <PerformanceOptimizer />
              <CriticalCSS />
              <ResourcePrefetcher />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;