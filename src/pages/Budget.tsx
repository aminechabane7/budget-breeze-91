import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Filter } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BlurredCard from '@/components/shared/BlurredCard';
import CategoryIcon, { CategoryType } from '@/components/shared/CategoryIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

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

interface Category {
  id: string;
  name: string;
  icon: string;
}

const Budget = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [newBudget, setNewBudget] = useState({
    category: '',
    categoryName: '',
    amount: '',
    period: 'monthly',
    notifications: true,
  });
  const { toast } = useToast();
  const { user, setupSubscription } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, icon')
          .eq('user_id', user.id);

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);

        const { data: budgetsData, error: budgetsError } = await supabase
          .from('budgets')
          .select(`
            id, 
            amount, 
            period, 
            start_date, 
            end_date, 
            name,
            categories (id, name, icon)
          `)
          .eq('user_id', user.id);

        if (budgetsError) throw budgetsError;
        
        const formattedBudgets = budgetsData.map((budget) => {
          const spent = budget.amount * 0.7;
          return {
            id: budget.id,
            category: (budget.categories?.icon || 'other') as CategoryType,
            categoryName: budget.name || budget.categories?.name || 'Unknown',
            amount: Number(budget.amount),
            spent: spent,
            remaining: Number(budget.amount) - spent,
            period: budget.period,
            startDate: new Date(budget.start_date),
            endDate: budget.end_date ? new Date(budget.end_date) : new Date(),
            notifications: true,
          };
        });

        setBudgets(formattedBudgets);
      } catch (error) {
        console.error("Error fetching budget data:", error);
        toast({
          title: "Failed to load budget data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = setupSubscription<{
      id: string;
      name: string;
      amount: number;
      period: string;
      start_date: string;
      end_date: string | null;
      category_id: string;
    }>(
      'budgets',
      'INSERT',
      async (payload) => {
        if (payload.new) {
          try {
            let categoryName = "Unknown";
            let categoryIcon: CategoryType = "other";
            
            if (payload.new.category_id) {
              const { data } = await supabase
                .from('categories')
                .select('name, icon')
                .eq('id', payload.new.category_id)
                .single();
                
              if (data) {
                categoryName = data.name;
                categoryIcon = data.icon as CategoryType;
              }
            }
            
            const newBudget: Budget = {
              id: payload.new.id,
              category: categoryIcon,
              categoryName: payload.new.name || categoryName,
              amount: Number(payload.new.amount),
              spent: 0,
              remaining: Number(payload.new.amount),
              period: payload.new.period,
              startDate: new Date(payload.new.start_date),
              endDate: payload.new.end_date ? new Date(payload.new.end_date) : new Date(),
              notifications: true,
            };
            
            setBudgets(prev => [...prev, newBudget]);
          } catch (error) {
            console.error("Error processing new budget:", error);
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, setupSubscription]);

  const handleAddBudget = async () => {
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
    
    const selectedCategory = categories.find(cat => cat.id === newBudget.category);
    const categoryName = selectedCategory?.name || 'Unknown';
    
    const today = new Date();
    let startDate, endDate;
    
    if (newBudget.period === 'monthly') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (newBudget.period === 'yearly') {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
    } else {
      const day = today.getDay() || 7;
      startDate = new Date(today);
      startDate.setDate(today.getDate() - day + 1);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    }
    
    try {
      if (currentBudget) {
        const { error } = await supabase
          .from('budgets')
          .update({
            category_id: newBudget.category,
            name: categoryName,
            amount: amount,
            period: newBudget.period,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentBudget.id)
          .eq('user_id', user?.id);

        if (error) throw error;
        
        const updatedBudgets = budgets.map(budget => 
          budget.id === currentBudget.id
            ? {
                ...budget,
                category: (selectedCategory?.icon || 'other') as CategoryType,
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
        const { error } = await supabase
          .from('budgets')
          .insert({
            user_id: user?.id,
            category_id: newBudget.category,
            name: categoryName,
            amount: amount,
            period: newBudget.period,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          });

        if (error) throw error;
        
        toast({
          title: "Budget added",
          description: `${categoryName} budget has been added.`,
        });
      }
      
      setNewBudget({
        category: '',
        categoryName: '',
        amount: '',
        period: 'monthly',
        notifications: true,
      });
      setCurrentBudget(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error with budget:", error);
      toast({
        title: "Operation failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
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
                category: '',
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
                    const categoryId = categories.find(c => c.name === budget.categoryName)?.id || '';
                    setNewBudget({
                      category: categoryId,
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
                category: '',
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
                  category: value
                })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
