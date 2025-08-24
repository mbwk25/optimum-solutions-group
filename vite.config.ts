/// <reference types="vitest" />

import { fileURLToPath } from 'url';
import { defineConfig, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { dirname, resolve } from 'path';
import type { UserConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
const config = async ({ mode }: ConfigEnv): Promise<UserConfig> => ({
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        (await import('tailwindcss')).default,
        (await import('autoprefixer')).default,
      ],
    },
  },
  server: {
    host: "localhost",
    port: 8080,
    strictPort: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
    hmr: {
      port: 8080,
      host: 'localhost',
    },
  },
  build: {
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : 'esbuild',
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    } : undefined,
    cssMinify: true,
    target: 'es2020',
    // Advanced build optimizations
    cssCodeSplit: true,
    assetsInlineLimit: 2048, // Reduced to 2kb for better HTTP/2 optimization
    chunkSizeWarningLimit: 500, // Stricter warning for better performance
    rollupOptions: {
      // Only externalize specific development/testing dependencies
      external: (id) => {
        // Only exclude specific development dependencies, not all node_modules
        return id.includes('@testing-library') || 
               id.includes('vitest') ||
               id.includes('jsdom') ||
               id.includes('cypress');
      },
      output: {
        // Automatic chunking - let Vite decide optimal chunks
        
        // Optimized file naming for better caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: (chunkInfo) => {
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const extType = info[info.length - 1];
          
          // Organize assets by type for better caching
          if (/\.(png|jpe?g|gif|svg|ico|webp|avif)$/i.test(assetInfo.name!)) {
            return `assets/images/[name]-[hash].${extType}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name!)) {
            return `assets/fonts/[name]-[hash].${extType}`;
          }
          if (/\.(css)$/i.test(assetInfo.name!)) {
            return `assets/styles/[name]-[hash].${extType}`;
          }
          
          return `assets/[name]-[hash].${extType}`;
        },
        
        // Preserve module structure for better debugging
        preserveModules: false,
        preserveModulesRoot: 'src',
        
        // Optimize for HTTP/2
        compact: true,
      },
      
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: (id, external) => {
          // Preserve side effects for CSS and known libraries with side effects
          return id.endsWith('.css') || 
                 id.includes('polyfill') ||
                 id.includes('web-vitals') ||
                 external;
        },
        unknownGlobalSideEffects: false,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' && (await import('lovable-tagger')).componentTagger(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  ssr: {
    noExternal: ["lovable-tagger"],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});

export default defineConfig(config);
