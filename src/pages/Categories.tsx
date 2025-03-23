
import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  budget: number;
  spent: number;
  transactions: number;
}

const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Groceries',
    type: 'groceries',
    budget: 400,
    spent: 320.45,
    transactions: 8,
  },
  {
    id: '2',
    name: 'Rent',
    type: 'rent',
    budget: 1200,
    spent: 1200,
    transactions: 1,
  },
  {
    id: '3',
    name: 'Utilities',
    type: 'utilities',
    budget: 150,
    spent: 138.19,
    transactions: 3,
  },
  {
    id: '4',
    name: 'Dining',
    type: 'dining',
    budget: 200,
    spent: 185.30,
    transactions: 5,
  },
  {
    id: '5',
    name: 'Transportation',
    type: 'transportation',
    budget: 100,
    spent: 45.70,
    transactions: 2,
  },
  {
    id: '6',
    name: 'Salary',
    type: 'salary',
    budget: 0,
    spent: 0,
    transactions: 1,
  },
  {
    id: '7',
    name: 'Entertainment',
    type: 'entertainment',
    budget: 150,
    spent: 32.50,
    transactions: 1,
  },
  {
    id: '8',
    name: 'Health',
    type: 'health',
    budget: 200,
    spent: 150,
    transactions: 1,
  },
];

const Categories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'other' as CategoryType,
    budget: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Category;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading data from API
    setTimeout(() => {
      setCategories(defaultCategories);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSort = (key: keyof Category) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const sortedCategories = React.useMemo(() => {
    let sortableCategories = [...categories];
    
    if (sortConfig !== null) {
      sortableCategories.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableCategories;
  }, [categories, sortConfig]);

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      type: category.type,
      budget: category.budget.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleAddCategory = () => {
    // Validate inputs
    if (!newCategory.name) {
      toast({
        title: "Invalid input",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    if (newCategory.budget && isNaN(parseFloat(newCategory.budget))) {
      toast({
        title: "Invalid budget",
        description: "Please enter a valid number for budget.",
        variant: "destructive",
      });
      return;
    }
    
    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map(category => 
        category.id === editingCategory.id
          ? {
              ...category,
              name: newCategory.name,
              type: newCategory.type,
              budget: newCategory.budget ? parseFloat(newCategory.budget) : 0,
            }
          : category
      );
      
      setCategories(updatedCategories);
      toast({
        title: "Category updated",
        description: `${newCategory.name} has been updated.`,
      });
    } else {
      // Add new category
      const newCategoryObject: Category = {
        id: Date.now().toString(),
        name: newCategory.name,
        type: newCategory.type,
        budget: newCategory.budget ? parseFloat(newCategory.budget) : 0,
        spent: 0,
        transactions: 0,
      };
      
      setCategories([...categories, newCategoryObject]);
      toast({
        title: "Category added",
        description: `${newCategory.name} has been added.`,
      });
    }
    
    // Reset form and close dialog
    setNewCategory({
      name: '',
      type: 'other',
      budget: '',
    });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const getSortIcon = (key: keyof Category) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <DashboardLayout
      title="Categories"
      description="Manage your income and expense categories"
    >
      <BlurredCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Categories</h2>
          <Button onClick={() => {
            setEditingCategory(null);
            setNewCategory({
              name: '',
              type: 'other',
              budget: '',
            });
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full h-8 w-8 bg-gray-200"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-6 font-medium">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center text-sm"
                    >
                      Category
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-6 font-medium">
                    <button 
                      onClick={() => handleSort('budget')}
                      className="flex items-center text-sm"
                    >
                      Budget
                      {getSortIcon('budget')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-6 font-medium">
                    <button 
                      onClick={() => handleSort('spent')}
                      className="flex items-center text-sm"
                    >
                      Spent
                      {getSortIcon('spent')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-6 font-medium">Progress</th>
                  <th className="text-right py-3 px-6 font-medium">
                    <button 
                      onClick={() => handleSort('transactions')}
                      className="flex items-center text-sm ml-auto"
                    >
                      Transactions
                      {getSortIcon('transactions')}
                    </button>
                  </th>
                  <th className="text-right py-3 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCategories.map((category) => {
                  const percentage = category.budget > 0 
                    ? (category.spent / category.budget) * 100 
                    : 0;
                  const isOverBudget = percentage > 100;
                  const isNearLimit = percentage >= 80 && percentage <= 100;
                  
                  return (
                    <tr 
                      key={category.id} 
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <CategoryIcon category={category.type} size={16} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {category.budget > 0 ? `$${category.budget.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-4 px-6">
                        {category.spent > 0 ? `$${category.spent.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-4 px-6">
                        {category.budget > 0 ? (
                          <div className="space-y-1">
                            <Progress 
                              value={Math.min(percentage, 100)} 
                              className={`h-2 ${
                                isOverBudget 
                                  ? 'bg-destructive/20' 
                                  : (isNearLimit ? 'bg-warning/20' : '')
                              }`}
                              indicatorClassName={
                                isOverBudget 
                                  ? 'bg-destructive' 
                                  : (isNearLimit ? 'bg-warning' : '')
                              }
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{percentage.toFixed(0)}%</span>
                              {isOverBudget && <span className="text-destructive">Exceeded</span>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No budget set</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {category.transactions}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center rounded-full bg-muted p-3 mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-2">No categories found</h4>
            <p className="text-muted-foreground mb-4">
              Start organizing your finances by adding categories
            </p>
            <Button onClick={() => {
              setEditingCategory(null);
              setNewCategory({
                name: '',
                type: 'other',
                budget: '',
              });
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add category
            </Button>
          </div>
        )}
      </BlurredCard>
      
      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Edit the details of your category' 
                : 'Enter the details of your new category'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({
                  ...newCategory,
                  name: e.target.value
                })}
                placeholder="e.g. Groceries"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={newCategory.type}
                onChange={(e) => setNewCategory({
                  ...newCategory,
                  type: e.target.value as CategoryType
                })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="groceries">Groceries</option>
                <option value="rent">Rent/Mortgage</option>
                <option value="utilities">Utilities</option>
                <option value="dining">Dining</option>
                <option value="transportation">Transportation</option>
                <option value="salary">Salary</option>
                <option value="health">Health</option>
                <option value="travel">Travel</option>
                <option value="entertainment">Entertainment</option>
                <option value="phone">Phone</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="income">Other Income</option>
                <option value="gift">Gifts</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="budget">Monthly Budget (optional)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={newCategory.budget}
                onChange={(e) => setNewCategory({
                  ...newCategory,
                  budget: e.target.value
                })}
                placeholder="e.g. 500.00"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if you don't want to set a budget for this category
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              {editingCategory ? 'Save changes' : 'Add category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Categories;
