
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import BlurredCard from '../shared/BlurredCard';
import CategoryIcon, { CategoryType } from '../shared/CategoryIcon';
import { Button } from '@/components/ui/button';

export interface Budget {
  id: string;
  category: CategoryType;
  amount: number;
  spent: number;
  period: string;
}

interface BudgetProgressProps {
  budgets: Budget[];
  isLoading?: boolean;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({
  budgets,
  isLoading = false,
}) => {
  return (
    <BlurredCard>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Budget Progress</h3>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/budget">Manage budgets</Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : budgets.length > 0 ? (
        <div className="space-y-6">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage >= 80 && percentage <= 100;
            
            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon category={budget.category} size={16} />
                    <span className="font-medium capitalize">{budget.category}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">
                      ${budget.spent.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / ${budget.amount.toFixed(2)}
                    </span>
                    
                    {isOverBudget && (
                      <AlertCircle className="h-4 w-4 text-destructive ml-1" />
                    )}
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={isOverBudget ? 'bg-destructive/20' : (isNearLimit ? 'bg-warning/20' : '')}
                  indicatorClassName={
                    isOverBudget 
                      ? 'bg-destructive' 
                      : (isNearLimit ? 'bg-warning' : '')
                  }
                />
                
                {isOverBudget && (
                  <p className="text-xs text-destructive">
                    You've exceeded your budget by ${(budget.spent - budget.amount).toFixed(2)}
                  </p>
                )}
                
                {isNearLimit && !isOverBudget && (
                  <p className="text-xs text-warning">
                    You're close to your budget limit
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center rounded-full bg-muted p-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium mb-2">No budgets set</h4>
          <p className="text-muted-foreground mb-4">
            Create budgets to track your spending
          </p>
          <Button asChild>
            <Link to="/budget">Create budget</Link>
          </Button>
        </div>
      )}
    </BlurredCard>
  );
};

export default BudgetProgress;
