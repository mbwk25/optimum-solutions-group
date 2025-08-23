import React, { memo, useCallback } from 'react';
import { Button, ButtonProps } from '@/shared/ui/button';
import { cn } from '@/shared/utils/utils';

interface MemoizedButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  throttle?: number; // Throttle clicks to prevent rapid firing
  isLoading?: boolean;
  loadingText?: string;
}

const MemoizedButton = memo<MemoizedButtonProps>(({ 
  onClick,
  throttle = 0,
  isLoading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  className,
  ...props
}) => {
  // Throttled click handler to prevent rapid clicks
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick || isLoading || disabled) return;
    
    if (throttle > 0) {
      const target = event.currentTarget;
      target.disabled = true;
      setTimeout(() => {
        target.disabled = disabled || false;
      }, throttle);
    }
    
    onClick(event);
  }, [onClick, throttle, isLoading, disabled]);

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        isLoading && 'opacity-75 cursor-not-allowed',
        className
      )}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
});

MemoizedButton.displayName = 'MemoizedButton';

export default MemoizedButton;
