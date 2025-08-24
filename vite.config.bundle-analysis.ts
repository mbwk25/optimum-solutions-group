import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh for better development experience
      fastRefresh: true,
    }),
    // Bundle analyzer
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // sunburst, treemap, network
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // Analyze bundle size and structure
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['@radix-ui/react-accordion', '@radix-ui/react-checkbox', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-tooltip'],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['clsx', 'class-variance-authority', 'tailwind-merge'],
          
          // Feature chunks
          'features-core': ['./src/features/navigation/Navigation.tsx', './src/features/hero/HeroSection.tsx'],
          'features-services': ['./src/features/services/ServicesSection.tsx', './src/features/iot-solutions/IoTSection.tsx'],
          'features-content': ['./src/features/about/AboutSection.tsx', './src/features/portfolio/PortfolioSection.tsx', './src/features/testimonials/TestimonialsSection.tsx'],
          'features-contact': ['./src/features/contact/ContactSection.tsx'],
          
          // Shared utilities
          'shared-components': ['./src/shared/components/Footer.tsx', './src/shared/components/BackToTop.tsx', './src/shared/components/FAQSection.tsx'],
          'shared-ui': ['./src/shared/ui/button.tsx', './src/shared/ui/card.tsx', './src/shared/ui/input.tsx', './src/shared/ui/textarea.tsx'],
        },
      },
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
      },
    },
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for smaller bundles
    target: 'es2020',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
    exclude: [
      // Exclude large dependencies that should be loaded on-demand
      'web-vitals',
    ],
  },
});
