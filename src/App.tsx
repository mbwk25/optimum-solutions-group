import React from "react";
import { Toaster } from '@/shared/ui';
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import CriticalCSS from "@/shared/components/CriticalCSS";
import PerformanceOptimizer from "@/shared/components/PerformanceOptimizer";
import ResourcePrefetcher from "@/shared/components/ResourcePrefetcher";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { AccessibilityProvider } from "@/shared/components/AccessibilityProvider";
import errorHandler from "@/shared/utils/errorHandler";
import { serviceWorkerManager } from "@/shared/utils/serviceWorkerManager";
import PWAInstallPrompt from "@/shared/components/PWAInstallPrompt";
// Import accessibility styles
import "@/shared/styles/accessibility.css";
// Import analytics service for auto-initialization
import "@/shared/services/analytics";

// Remove Vercel analytics if not needed, or install the package
// import { Analytics } from '@vercel/analytics/react';
// import { SpeedInsights } from '@vercel/speed-insights/react';
// Attach errorHandler to window.onerror for global error handling
if (typeof window !== "undefined" && typeof errorHandler === "function") {
  window.onerror = function (message, _source, _lineno, _colno, error) {
    // errorHandler expects a string, so pass a formatted string
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof message === "string"
        ? message
        : "Unknown error";
    errorHandler.handleError(new Error(errorMsg));
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
    errorHandler.handleError(new Error(reason));
    return false;
  };
}

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

// Preload critical routes on app initialization
if (typeof window !== 'undefined') {
  // Preload Index immediately
  if ('preload' in Index && typeof Index.preload === 'function') {
    Index.preload();
  }
  
  // Register service worker in production
  if (import.meta.env.MODE === 'production') {
    window.addEventListener('load', async () => {
      try {
        await serviceWorkerManager.register();
        console.log('✅ Service worker registered successfully');
      } catch (error) {
        console.error('❌ Service worker registration failed:', error);
      }
    });
  }
  
  // Preload other routes based on user interaction patterns
  setTimeout(() => {
    // Preload NotFound after 5 seconds (low priority)
    import("./pages/NotFound").catch(() => {
      // Silently fail if preload fails
    });
  }, 5000);
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
      <AccessibilityProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Suspense fallback={<LoadingFallback />}>
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <PerformanceOptimizer />
                <CriticalCSS />
                <ResourcePrefetcher />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/component-showcase" element={<ComponentShowcase />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/pwa" element={<PWAPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* PWA Install Prompt - Floating */}
                <PWAInstallPrompt 
                  variant="floating"
                  autoShow={false}
                  hideAfterInstall={true}
                />
                
                <Toaster />
              </BrowserRouter>
            </Suspense>
          </TooltipProvider>
        </QueryClientProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
};

export default App;