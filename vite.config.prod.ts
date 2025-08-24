import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Disable Fast Refresh in production
      fastRefresh: false,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // Production-only optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info', 'console.debug'],
        passes: 3,
        reduce_vars: true,
        dead_code: true,
        unused: true,
      },
      mangle: {
        safari10: true,
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Optimize for production
    target: 'es2020',
    sourcemap: false,
    cssMinify: true,
    
    // Advanced optimizations
    cssCodeSplit: true,
    assetsInlineLimit: 1024, // Inline very small assets only
    chunkSizeWarningLimit: 300, // Very strict chunk size limits
    
    rollupOptions: {
      output: {
        // Let Vite handle chunking automatically - no manual chunking to avoid empty chunks
        
        // Optimize file names for caching
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const extType = info[info.length - 1];
          
          if (/\\.(png|jpe?g|gif|svg|ico|webp|avif)$/i.test(assetInfo.name!)) {
            return `images/[name]-[hash].${extType}`;
          }
          if (/\\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name!)) {
            return `fonts/[name]-[hash].${extType}`;
          }
          if (/\\.(css)$/i.test(assetInfo.name!)) {
            return `css/[name]-[hash].${extType}`;
          }
          
          return `assets/[name]-[hash].${extType}`;
        },
        
        // Aggressive compression
        compact: true,
        generatedCode: 'es2015',
      },
      
      // Enhanced but conservative tree shaking
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: (id) => {
          // Be conservative - preserve side effects for most modules except pure utilities
          if (id.includes('node_modules')) {
            // Only allow tree-shaking for specific known-safe libraries
            return !id.includes('lodash') && !id.includes('date-fns');
          }
          return true; // Preserve side effects for our own modules
        },
      },
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
    ],
    exclude: [
      // Exclude large dependencies that should be lazy loaded
      'web-vitals',
      '@axe-core/react',
    ],
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis',
      },
    },
  },
  
  // Experimental features for better performance
  experimental: {
    renderBuiltUrl: (filename, { hostType }) => {
      if (hostType === 'js') {
        return `/${filename}`;
      }
      return { relative: true };
    },
  },
});
