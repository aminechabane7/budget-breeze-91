
import React from 'react';
import { cn } from '@/lib/utils';

interface BlurredCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  shimmer?: boolean;
  onClick?: () => void;
}

const BlurredCard = ({ 
  children, 
  className, 
  hoverEffect = false,
  shimmer = false,
  onClick
}: BlurredCardProps) => {
  return (
    <div 
      className={cn(
        "rounded-xl p-6 glass-morphism transition-all duration-300",
        hoverEffect && "hover-scale hover:shadow-lg",
        shimmer && "shimmer",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default BlurredCard;
