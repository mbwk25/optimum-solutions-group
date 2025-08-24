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
      output: {
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
        // Simplified manual chunking to avoid empty chunks
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': ['@radix-ui/react-accordion', '@radix-ui/react-checkbox', '@radix-ui/react-select', '@radix-ui/react-tooltip'],
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
        
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
      
      // Enhanced tree shaking
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: (id) => {
          // Only preserve side effects for specific modules
          return id.endsWith('.css') || 
                 id.includes('web-vitals') ||
                 id.includes('serviceWorker');
        },
        unknownGlobalSideEffects: false,
        propertyReadSideEffects: false,
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
