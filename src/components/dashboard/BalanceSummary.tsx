
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import BlurredCard from '../shared/BlurredCard';
import AnimatedNumber from '../shared/AnimatedNumber';

interface BalanceSummaryProps {
  balance: number;
  income: number;
  expenses: number;
  isLoading?: boolean;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  balance,
  income,
  expenses,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BlurredCard 
        className="col-span-1" 
        hoverEffect
        shimmer={isLoading}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
            <h3 className="text-2xl font-bold mt-1">
              <AnimatedNumber 
                value={balance} 
                prefix="$" 
                isLoading={isLoading}
              />
            </h3>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
        </div>
      </BlurredCard>
      
      <BlurredCard 
        className="col-span-1" 
        hoverEffect
        shimmer={isLoading}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
            <h3 className="text-2xl font-bold mt-1 text-success">
              <AnimatedNumber 
                value={income} 
                prefix="$" 
                isLoading={isLoading}
              />
            </h3>
          </div>
          <div className="rounded-full bg-success/10 p-3">
            <ArrowUpRight className="h-6 w-6 text-success" />
          </div>
        </div>
      </BlurredCard>
      
      <BlurredCard 
        className="col-span-1" 
        hoverEffect
        shimmer={isLoading}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
            <h3 className="text-2xl font-bold mt-1 text-destructive">
              <AnimatedNumber 
                value={expenses} 
                prefix="$" 
                isLoading={isLoading}
              />
            </h3>
          </div>
          <div className="rounded-full bg-destructive/10 p-3">
            <ArrowDownRight className="h-6 w-6 text-destructive" />
          </div>
        </div>
      </BlurredCard>
    </div>
  );
};

export default BalanceSummary;
