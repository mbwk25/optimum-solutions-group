import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/shared/utils/utils';

interface OptimizedImageProps {
  src: string | { default: string };
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  placeholder?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  srcSet?: string;
  loading?: 'eager' | 'lazy';
  quality?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMjIyIi8+Cjwvc3ZnPgo=',
  sizes = '100vw',
  onLoad,
  onError,
  loading = 'lazy',
  quality = 80,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Handle image source and generate srcSet
  const { src: optimizedSrc, srcSet }: { src: string; srcSet?: string } = useMemo(() => {
    if (!src) return { src: '', srcSet: undefined };
    
    // Handle imported images (they'll be objects with a default property)
    if (typeof src === 'object' && 'default' in src) {
      return { 
        src: src.default,
        srcSet: undefined 
      };
    }
    
    const srcString: string = String(src);
    
    // Handle external URLs
    if (srcString.startsWith('http') || srcString.startsWith('//')) {
      return { 
        src: srcString, 
        srcSet: undefined 
      };
    }
    
    // Handle local paths in development
    if (process.env.NODE_ENV === 'development') {
      return { 
        src: srcString,
        srcSet: undefined
      };
    }
    
    // In production, generate WebP and srcSet if needed
    const srcWithoutLeadingSlash: string = srcString.startsWith('/') ? srcString.slice(1) : srcString;
    const baseUrl: string = 'https://optimumsolutions.dev';
    const webpSrc: string = `${baseUrl}/${srcWithoutLeadingSlash.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;
    
    const numWidth: number = typeof width === 'number' ? width : 0;
    const responsiveSrcSet: string = numWidth > 0
      ? [
          `${webpSrc}?w=${numWidth}&q=${quality}&format=webp ${numWidth}w`,
          `${webpSrc}?w=${Math.round(numWidth * 1.5)}&q=${quality}&format=webp ${Math.round(numWidth * 1.5)}w`,
          `${webpSrc}?w=${numWidth * 2}&q=${quality}&format=webp ${numWidth * 2}w`,
        ].join(', ')
      : undefined;
    
    return {
      src: webpSrc,
      srcSet: responsiveSrcSet,
    };
  }, [src, width, quality]);

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError: React.ReactEventHandler<HTMLImageElement> = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(event);
  }, [onError]);

  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted text-muted-foreground',
        className
      )}>
        Failed to load image
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        // Use lowercase fetchpriority for React 18+ compatibility
        {...(priority ? { fetchpriority: 'high' } : {})}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;