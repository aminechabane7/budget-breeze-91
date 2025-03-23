
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
  isLoading?: boolean;
}

const AnimatedNumber = ({
  value,
  prefix = '',
  suffix = '',
  duration = 1000,
  className,
  decimals = 2,
  isLoading = false,
}: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = startValue + progress * (endValue - startValue);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration, isLoading]);

  if (isLoading) {
    return (
      <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
    );
  }

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

export default AnimatedNumber;
