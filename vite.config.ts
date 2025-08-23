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
    host: "::",
    port: 8080,
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
  build: {
    sourcemap: true,
    minify: 'esbuild',
    cssMinify: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core dependencies
          'react-core': ['react', 'react-dom'],
          // Router and navigation
          'router': ['react-router-dom'],
          // State management and data fetching
          'state-management': ['@tanstack/react-query'],
          // All UI primitives in one optimized chunk
          'ui-primitives': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-tabs',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-menubar'
          ],
          // Form handling
          'form-utilities': [
            'react-hook-form',
            '@hookform/resolvers', 
            'zod'
          ],
          // Utility libraries
          'utilities': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
          ],
          // Icons - separate due to size
          'icons': ['lucide-react'],
          // Charts and visualizations
          'charts': ['recharts', 'embla-carousel-react'],
          // Performance monitoring
          'monitoring': ['web-vitals']
        },
        // Optimize chunk sizes
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') 
            : 'chunk';
          return `assets/[name]-[hash].js`;
        },
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
