import React, { Suspense, ReactNode } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
}

const DefaultFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center p-8">
    <Skeleton className="w-full h-full" />
  </div>
);

const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  fallback = <DefaultFallback />,
  delay = 200, // ms
}) => {
  const [showFallback, setShowFallback] = React.useState(false);
  const timerRef: React.MutableRefObject<NodeJS.Timeout | null> = React.useRef(null);

  React.useEffect(() => {
    if (delay > 0) {
      timerRef.current = setTimeout(() => {
        setShowFallback(true);
      }, delay);
      
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    } else {
      setShowFallback(true);
      return; // Added return for when delay <= 0
    }
  }, [delay]);

  return (
    <Suspense fallback={showFallback ? fallback : null}>
      {children}
    </Suspense>
  );
};

export default LazyLoad;