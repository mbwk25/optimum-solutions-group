import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./shared/styles/accessibility.css";
import { serviceWorkerManager } from "./shared/utils/serviceWorkerManager";

// Ensure DOM is ready before initializing React
const initializeApp = () => {
  // Performance optimization: Register service worker after initial render
  serviceWorkerManager.register();

  // Accessibility enhancement: Initialize focus management
  // Add keyboard navigation class detection
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('using-keyboard');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('using-keyboard');
  });

  // Add high contrast detection
  if (window.matchMedia('(prefers-contrast: high)').matches) {
    document.body.classList.add('prefers-high-contrast');
  }

  // Add reduced motion detection
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('prefers-reduced-motion');
  }

  // Initialize React app
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Failed to find root element');
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize React app:', error);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}