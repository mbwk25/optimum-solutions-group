/**
 * Optimized imports utility
 * Helps with tree shaking and reducing bundle size
 */

// Re-export commonly used utilities to reduce import overhead
export { cn } from './utils';

// Optimized lucide icon imports
// Only import what's actually used across the app
export { default as Code } from 'lucide-react/dist/esm/icons/code';
export { default as Workflow } from 'lucide-react/dist/esm/icons/workflow';
export { default as Users } from 'lucide-react/dist/esm/icons/users';
export { default as BarChart } from 'lucide-react/dist/esm/icons/bar-chart';
export { default as Palette } from 'lucide-react/dist/esm/icons/palette';
export { default as Headphones } from 'lucide-react/dist/esm/icons/headphones';
export { default as TrendingUp } from 'lucide-react/dist/esm/icons/trending-up';
export { default as Database } from 'lucide-react/dist/esm/icons/database';
export { default as Cpu } from 'lucide-react/dist/esm/icons/cpu';
export { default as Shield } from 'lucide-react/dist/esm/icons/shield';
export { default as Menu } from 'lucide-react/dist/esm/icons/menu';
export { default as X } from 'lucide-react/dist/esm/icons/x';
export { default as ArrowRight } from 'lucide-react/dist/esm/icons/arrow-right';
export { default as Mail } from 'lucide-react/dist/esm/icons/mail';
export { default as Phone } from 'lucide-react/dist/esm/icons/phone';
export { default as MapPin } from 'lucide-react/dist/esm/icons/map-pin';
export { default as Calendar } from 'lucide-react/dist/esm/icons/calendar';
export { default as CheckCircle } from 'lucide-react/dist/esm/icons/check-circle';
export { default as ChevronUp } from 'lucide-react/dist/esm/icons/chevron-up';
export { default as ExternalLink } from 'lucide-react/dist/esm/icons/external-link';
export { default as Clock } from 'lucide-react/dist/esm/icons/clock';
export { default as Star } from 'lucide-react/dist/esm/icons/star';
export { default as Quote } from 'lucide-react/dist/esm/icons/quote';
export { default as Target } from 'lucide-react/dist/esm/icons/target';
export { default as Zap } from 'lucide-react/dist/esm/icons/zap';
export { default as HelpCircle } from 'lucide-react/dist/esm/icons/help-circle';
export { default as DollarSign } from 'lucide-react/dist/esm/icons/dollar-sign';
export { default as Linkedin } from 'lucide-react/dist/esm/icons/linkedin';
export { default as Twitter } from 'lucide-react/dist/esm/icons/twitter';
export { default as Github } from 'lucide-react/dist/esm/icons/github';

// Optimized React imports
export { memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';

// Optimized UI component imports with proper tree shaking
export { Button } from '@/shared/ui/button';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
export { Input } from '@/shared/ui/input';
export { Textarea } from '@/shared/ui/textarea';

/**
 * Dynamic import helper for large components
 * Use this for components that are not critical for initial render
 */
export const dynamicImport = {
  LazyImage: () => import('@/shared/components/LazyImage'),
  ProjectEstimator: () => import('@/shared/components/ProjectEstimator'),
  PerformanceDashboard: () => import('@/shared/components/PerformanceDashboard'),
};

/**
 * Component preloading utility
 * Preload components that will be needed soon
 */
export const preloadComponent = (componentName: keyof typeof dynamicImport) => {
  dynamicImport[componentName]().catch(() => {
    // Silently fail if preloading doesn't work
  });
};
