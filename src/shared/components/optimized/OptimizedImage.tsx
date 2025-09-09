import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
  lazy?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  priority = false, 
  lazy = true,
  ...props 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : lazy ? 'lazy' : 'eager'}
      {...props}
    />
  );
};

export default OptimizedImage;