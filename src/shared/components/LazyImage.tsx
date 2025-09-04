import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { cn } from '@/shared/utils/utils';

interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  placeholder?: string;
  fallbackSrc?: string; // Fallback image if primary fails
  retryAttempts?: number; // Number of retry attempts
  blurDataURL?: string; // Base64 blur placeholder
  quality?: number; // Image quality (1-100)
  onLoad?: () => void;
  onError?: (error: Event) => void;
}

const LazyImage = memo<LazyImageProps>(({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  loading = 'lazy',
  fetchPriority = 'auto',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMjIyIi8+Cjwvc3ZnPgo=',
  fallbackSrc,
  retryAttempts = 2,
  blurDataURL,
  quality = 85,
  onLoad,
  onError,
  ...htmlProps
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(blurDataURL || placeholder);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Memoized intersection observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry?.isIntersecting) {
      setIsIntersecting(true);
    }
  }, []);

  // Set up intersection observer
  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (imageRef && loading === 'lazy' && !isIntersecting) {
      observer = new IntersectionObserver(
        handleIntersection,
        { 
          threshold: 0.1, 
          rootMargin: '50px' // Start loading 50px before image enters viewport
        }
      );
      observer.observe(imageRef);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, loading, isIntersecting, handleIntersection]);

  // Load image when intersecting or eager loading
  useEffect(() => {
    if (loading === 'eager' || isIntersecting) {
      setImageSrc(src);
    }
  }, [src, loading, isIntersecting]);

  // Memoized load handler
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Memoized error handler with retry logic
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    if (retryCount < retryAttempts) {
      // Retry loading the image
      setRetryCount(prev => prev + 1);
      // Add a small delay before retry
      setTimeout(() => {
        setImageSrc(`${src}?retry=${retryCount + 1}`);
      }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
    } else if (fallbackSrc && imageSrc !== fallbackSrc) {
      // Try fallback image
      setImageSrc(fallbackSrc);
      setRetryCount(0);
    } else {
      // Final error state
      setHasError(true);
      onError?.(event.nativeEvent);
    }
  }, [src, retryCount, retryAttempts, fallbackSrc, imageSrc, onError]);

  // Memoized image props
  const imgProps = useMemo(() => {
    const props: React.ImgHTMLAttributes<HTMLImageElement> & {
      ref: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>;
      fetchpriority?: string;
    } = {
      ...htmlProps,
      ref: setImageRef,
      src: imageSrc,
      alt,
      className: cn(
        'transition-all duration-500 ease-in-out',
        !isLoaded && !hasError && 'opacity-0 scale-105',
        isLoaded && !hasError && 'opacity-100 scale-100',
        hasError && 'opacity-50',
        blurDataURL && !isLoaded && 'blur-sm',
        blurDataURL && isLoaded && 'blur-none',
        className
      ),
      width,
      height,
      loading,
      onLoad: handleLoad,
      onError: handleError,
      decoding: 'async' as const,
    };

    // Add fetchpriority only if it's not 'auto' to avoid unnecessary attributes
    if (fetchPriority !== 'auto') {
      props.fetchpriority = fetchPriority;
    }

    return props;
  }, [
    htmlProps, imageSrc, alt, className, isLoaded, hasError, blurDataURL,
    width, height, loading, handleLoad, handleError, fetchPriority
  ]);

  // Error fallback
  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          'border border-dashed border-muted-foreground/20 rounded-md',
          'min-h-[100px] text-sm',
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <div className="text-xs opacity-60 mb-1">Failed to load</div>
          <div className="text-xs font-mono truncate max-w-[150px]">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div 
          className={cn(
            'absolute inset-0 bg-muted animate-pulse rounded',
            blurDataURL && 'bg-transparent'
          )}
          style={{ width, height }}
        />
      )}
      
      {/* Retry indicator */}
      {retryCount > 0 && !isLoaded && !hasError && (
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-muted-foreground">
          Retry {retryCount}/{retryAttempts}
        </div>
      )}
      
      <img {...imgProps} />
    </div>
  );
});

// Display name for debugging
LazyImage.displayName = 'LazyImage';

export default LazyImage;
