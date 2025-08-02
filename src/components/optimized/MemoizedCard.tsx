import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MemoizedCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

const MemoizedCard = React.memo(({ 
  title, 
  description, 
  children, 
  className,
  variant = 'default'
}: MemoizedCardProps) => {
  const cardStyles = {
    default: 'hover-lift transition-transform duration-300',
    elevated: 'shadow-primary hover-lift transition-all duration-300',
    outlined: 'border-2 border-border hover:border-primary transition-colors duration-300'
  };

  return (
    <Card className={cn(cardStyles[variant], className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
});

MemoizedCard.displayName = 'MemoizedCard';

export default MemoizedCard;