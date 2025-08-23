import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/shared/utils/utils';
import { assetOptimizer } from '@/shared/utils/fontOptimizer';

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
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  responsive?: boolean;
  responsiveSizes?: number[];
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
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
  quality = 85,
  format = 'auto',
  responsive = false,
  responsiveSizes = [400, 800, 1200, 1600],
  blurDataURL,
  objectFit = 'cover',
  objectPosition = 'center',
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(blurDataURL || placeholder);

  // Process source URL
  const processedSrc = useMemo(() => {
    if (typeof src === 'object' && 'default' in src) {
      return src.default;
    }
    return String(src);
  }, [src]);

  // Generate optimized URLs and srcSet using asset optimizer
  const { optimizedSrc, optimizedSrcSet, pictureElements } = useMemo(() => {
    const baseOptions = {
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      quality,
      format,
    };

    const optimizedSrc = assetOptimizer.getOptimizedImageUrl(processedSrc, baseOptions);

    let optimizedSrcSet = '';
    if (responsive) {
      optimizedSrcSet = assetOptimizer.generateSrcSet(processedSrc, responsiveSizes);
    }

    // Generate picture elements for multiple formats (WebP, AVIF fallbacks)
    const pictureElements = [];
    const formatSupport = assetOptimizer.getFormatSupport();

    if (format === 'auto') {
      // AVIF with fallback to WebP and JPEG
      if (formatSupport.avif) {
        const avifSrcSet = responsive 
          ? assetOptimizer.generateSrcSet(processedSrc, responsiveSizes)
          : assetOptimizer.getOptimizedImageUrl(processedSrc, { ...baseOptions, format: 'avif' });
        
        pictureElements.push({
          type: 'image/avif',
          srcSet: avifSrcSet,
        });
      }

      if (formatSupport.webp) {
        const webpSrcSet = responsive 
          ? assetOptimizer.generateSrcSet(processedSrc, responsiveSizes)
          : assetOptimizer.getOptimizedImageUrl(processedSrc, { ...baseOptions, format: 'webp' });
        
        pictureElements.push({
          type: 'image/webp',
          srcSet: webpSrcSet,
        });
      }
    }

    return { optimizedSrc, optimizedSrcSet, pictureElements };
  }, [processedSrc, width, height, quality, format, responsive, responsiveSizes]);

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    setCurrentSrc(optimizedSrc);
    onLoad?.();
  }, [optimizedSrc, onLoad]);

  const handleError: React.ReactEventHandler<HTMLImageElement> = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(event);
  }, [onError]);

  // Error fallback
  if (hasError) {
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

  // Common image props
  const imageProps = {
    alt,
    loading: priority ? 'eager' as const : loading,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'transition-all duration-300 ease-in-out',
      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
      blurDataURL && !isLoaded && 'blur-sm',
      blurDataURL && isLoaded && 'blur-none',
      className
    ),
    style: {
      width,
      height,
      objectFit,
      objectPosition,
      ...props.style,
    },
    // Add fetchpriority for modern browsers
    ...(priority ? { fetchpriority: 'high' as 'high' | 'low' | 'auto' } : {}),
    decoding: 'async' as const,
  };

  // Use picture element for multiple format support
  if (pictureElements.length > 0) {
    return (
      <div className="relative overflow-hidden">
        {/* Loading placeholder */}
        {!isLoaded && (
          <div 
            className={cn(
              'absolute inset-0 bg-muted animate-pulse',
              blurDataURL && 'bg-transparent'
            )}
            style={{ width, height }}
          />
        )}
        
        <picture>
          {pictureElements.map((source, index) => (
            <source
              key={index}
              type={source.type}
              srcSet={source.srcSet}
              sizes={responsive ? sizes : undefined}
            />
          ))}
          <img
            {...imageProps}
            src={currentSrc}
            srcSet={responsive ? optimizedSrcSet : undefined}
            sizes={responsive ? sizes : undefined}
          />
        </picture>
      </div>
    );
  }

  // Standard img element
  return (
    <div className="relative overflow-hidden">
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            blurDataURL && 'bg-transparent'
          )}
          style={{ width, height }}
        />
      )}
      
      <img
        {...imageProps}
        src={currentSrc}
        srcSet={responsive ? optimizedSrcSet : undefined}
        sizes={responsive ? sizes : undefined}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;