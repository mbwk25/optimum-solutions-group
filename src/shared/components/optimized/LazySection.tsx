import React from 'react';
import { cn } from '@/shared/utils/utils';

interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

const LazySection = ({ 
  children, 
  className, 
  fallback = <div className="h-96 animate-pulse bg-muted rounded-lg" />,
  threshold = 0.1,
  rootMargin = '50px'
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={cn('min-h-[100px]', className)}>
      {isVisible ? children : fallback}
    </div>
  );
};

export default LazySection;