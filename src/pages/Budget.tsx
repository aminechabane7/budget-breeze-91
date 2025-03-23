
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BlurredCard from '@/components/shared/BlurredCard';
import CategoryIcon, { CategoryType } from '@/components/shared/CategoryIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

interface Budget {
  id: string;
  category: CategoryType;
  categoryName: string;
  amount: number;
  spent: number;
  remaining: number;
  period: string;
  startDate: Date;
  endDate: Date;
  notifications: boolean;
}

const Budget = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [newBudget, setNewBudget] = useState({
    category: '' as CategoryType,
    categoryName: '',
    amount: '',
    period: 'monthly',
    notifications: true,
  });
  const { toast } = useToast();

  // Sample categories for the form
  const categoryOptions = [
    { value: 'groceries', label: 'Groceries' },
    { value: 'rent', label: 'Rent/Mortgage' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'dining', label: 'Dining' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'health', label: 'Health' },
    { value: 'travel', label: 'Travel' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'phone', label: 'Phone' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    // Simulate loading data from API
    setTimeout(() => {
      // Sample data
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31);
      
      const mockBudgets: Budget[] = [
        {
          id: '1',
          category: 'groceries',
          categoryName: 'Groceries',
          amount: 400,
          spent: 320.45,
          remaining: 79.55,
          period: 'monthly',
          startDate: monthStart,
          endDate: monthEnd,
          notifications: true,
        },
        {
          id: '2',
          category: 'dining',
          categoryName: 'Dining',
          amount: 200,
          spent: 185.30,
          remaining: 14.70,
          period: 'monthly',
          startDate: monthStart,
          endDate: monthEnd,
          notifications: true,
        },
        {
          id: '3',
          category: 'utilities',
          categoryName: 'Utilities',
          amount: 150,
          spent: 178.20,
          remaining: -28.20,
          period: 'monthly',
          startDate: monthStart,
          endDate: monthEnd,
          notifications: true,
        },
        {
          id: '4',
          category: 'entertainment',
          categoryName: 'Entertainment',
          amount: 1200,
          spent: 550,
          remaining: 650,
          period: 'yearly',
          startDate: yearStart,
          endDate: yearEnd,
          notifications: false,
        },
        {
          id: '5',
          category: 'travel',
          categoryName: 'Travel',
          amount: 2000,
          spent: 1200,
          remaining: 800,
          period: 'yearly',
          startDate: yearStart,
          endDate: yearEnd,
          notifications: true,
        },
      ];
      
      setBudgets(mockBudgets);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAddBudget = () => {
    // Validate inputs
    if (!newBudget.category || !newBudget.amount) {
      toast({
        title: "Invalid input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newBudget.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    
    // Find category name
    const categoryName = categoryOptions.find(
      cat => cat.value === newBudget.category
    )?.label || 'Unknown';
    
    // Create date ranges based on period
    const today = new Date();
    let startDate, endDate;
    
    if (newBudget.period === 'monthly') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (newBudget.period === 'yearly') {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
    } else {
      // Weekly
      const day = today.getDay() || 7; // Get day of week (0-6), convert Sunday from 0 to 7
      startDate = new Date(today);
      startDate.setDate(today.getDate() - day + 1); // Previous Monday
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Next Sunday
    }
    
    if (currentBudget) {
      // Update existing budget
      const updatedBudgets = budgets.map(budget => 
        budget.id === currentBudget.id
          ? {
              ...budget,
              category: newBudget.category,
              categoryName,
              amount,
              period: newBudget.period,
              notifications: newBudget.notifications,
              startDate,
              endDate,
              remaining: amount - budget.spent,
            }
          : budget
      );
      
      setBudgets(updatedBudgets);
      toast({
        title: "Budget updated",
        description: `${categoryName} budget has been updated.`,
      });
    } else {
      // Add new budget
      const budget: Budget = {
        id: Date.now().toString(),
        category: newBudget.category,
        categoryName,
        amount,
        spent: 0,
        remaining: amount,
        period: newBudget.period,
        startDate,
        endDate,
        notifications: newBudget.notifications,
      };
      
      setBudgets([...budgets, budget]);
      toast({
        title: "Budget added",
        description: `${categoryName} budget has been added.`,
      });
    }
    
    // Reset form and close dialog
    setNewBudget({
      category: '' as CategoryType,
      categoryName: '',
      amount: '',
      period: 'monthly',
      notifications: true,
    });
    setCurrentBudget(null);
    setIsAddDialogOpen(false);
  };

  return (
    <DashboardLayout
      title="Budget"
      description="Set and manage your spending limits"
    >
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">Current Budgets</h2>
            <p className="text-muted-foreground">
              Track your spending against your budget targets
            </p>
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" onClick={() => {
              setCurrentBudget(null);
              setNewBudget({
                category: '' as CategoryType,
                categoryName: '',
                amount: '',
                period: 'monthly',
                notifications: true,
              });
              setIsAddDialogOpen(true);
            }} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <BlurredCard key={i} className="animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div>
                      <div className="h-5 w-24 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4 mt-6">
                  <div className="h-2 w-full bg-gray-200 rounded"></div>
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </BlurredCard>
            ))}
          </div>
        ) : budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.amount) * 100;
              const isOverBudget = percentage > 100;
              const isNearLimit = percentage >= 80 && percentage <= 100;
              
              return (
                <BlurredCard 
                  key={budget.id} 
                  className="hover-scale"
                  onClick={() => {
                    setCurrentBudget(budget);
                    setNewBudget({
                      category: budget.category,
                      categoryName: budget.categoryName,
                      amount: budget.amount.toString(),
                      period: budget.period,
                      notifications: budget.notifications,
                    });
                    setIsAddDialogOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <CategoryIcon category={budget.category} size={20} />
                      <div>
                        <h3 className="font-semibold text-lg">{budget.categoryName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {budget.period === 'monthly' 
                            ? format(budget.startDate, 'MMMM yyyy')
                            : budget.period === 'yearly'
                              ? format(budget.startDate, 'yyyy')
                              : `${format(budget.startDate, 'MMM d')} - ${format(budget.endDate, 'MMM d')}`
                          }
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">${budget.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2 mt-6">
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={isOverBudget ? 'bg-destructive/20' : (isNearLimit ? 'bg-warning/20' : '')}
                      indicatorClassName={
                        isOverBudget 
                          ? 'bg-destructive' 
                          : (isNearLimit ? 'bg-warning' : '')
                      }
                    />
                    
                    <div className="flex justify-between text-sm">
                      <span>
                        <span className="font-medium">${budget.spent.toFixed(2)}</span>
                        <span className="text-muted-foreground"> spent</span>
                      </span>
                      <span>
                        <span className={
                          isOverBudget 
                            ? 'font-medium text-destructive' 
                            : 'font-medium text-success'
                        }>
                          {budget.remaining >= 0 ? '+' : ''}${budget.remaining.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground"> remaining</span>
                      </span>
                    </div>
                    
                    {isOverBudget && (
                      <p className="text-xs text-destructive mt-1">
                        You've exceeded your budget by ${Math.abs(budget.remaining).toFixed(2)}
                      </p>
                    )}
                    
                    {isNearLimit && !isOverBudget && (
                      <p className="text-xs text-warning mt-1">
                        You're close to your budget limit
                      </p>
                    )}
                  </div>
                </BlurredCard>
              );
            })}
          </div>
        ) : (
          <BlurredCard className="text-center py-16">
            <div className="inline-flex items-center justify-center rounded-full bg-muted p-3 mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-2">No budgets found</h4>
            <p className="text-muted-foreground mb-6">
              Start by setting up a budget for your expense categories
            </p>
            <Button onClick={() => {
              setCurrentBudget(null);
              setNewBudget({
                category: '' as CategoryType,
                categoryName: '',
                amount: '',
                period: 'monthly',
                notifications: true,
              });
              setIsAddDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first budget
            </Button>
          </BlurredCard>
        )}
      </div>
      
      {/* Add/Edit Budget Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentBudget ? 'Edit Budget' : 'Add Budget'}
            </DialogTitle>
            <DialogDescription>
              {currentBudget 
                ? 'Edit your budget settings' 
                : 'Set up a new budget to track your spending'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newBudget.category}
                onValueChange={(value) => setNewBudget({
                  ...newBudget,
                  category: value as CategoryType
                })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Budget Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="pl-7"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({
                    ...newBudget,
                    amount: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="period">Budget Period</Label>
              <Select
                value={newBudget.period}
                onValueChange={(value) => setNewBudget({
                  ...newBudget,
                  period: value
                })}
              >
                <SelectTrigger id="period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 py-2">
              <Switch
                id="notifications"
                checked={newBudget.notifications}
                onCheckedChange={(checked) => setNewBudget({
                  ...newBudget,
                  notifications: checked
                })}
              />
              <Label htmlFor="notifications">
                Enable notifications when budget is exceeded
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBudget}>
              {currentBudget ? 'Save changes' : 'Create budget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Budget;
