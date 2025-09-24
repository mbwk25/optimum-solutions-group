import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallbackSrc?: string;
  containerClassName?: string;
  blurDataURL?: string;
}

/**
 * Optimized image component with lazy loading, error handling, and accessibility
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  fallbackSrc,
  containerClassName,
  blurDataURL,
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageState('loaded');
    onLoad?.(event);
  }, [onLoad]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageState('error');
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setImageState('loading');
    }
    onError?.(event);
  }, [onError, fallbackSrc, imageSrc]);

  return (
    <div className={clsx('relative overflow-hidden', containerClassName)}>
      {/* Blur placeholder */}
      {blurDataURL && imageState === 'loading' && (
        <img
          src={blurDataURL}
          alt=""
          className={clsx(
            'absolute inset-0 w-full h-full object-cover filter blur-sm scale-110',
            className
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={clsx(
          'transition-opacity duration-300',
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
      
      {/* Loading placeholder */}
      {imageState === 'loading' && !blurDataURL && (
        <div 
          className={clsx(
            'absolute inset-0 bg-muted animate-pulse flex items-center justify-center',
            className
          )}
          aria-label="Image loading"
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {imageState === 'error' && !fallbackSrc && (
        <div 
          className={clsx(
            'absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground',
            className
          )}
          role="img"
          aria-label="Failed to load image"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;