
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Search, Filter, ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BlurredCard from '@/components/shared/BlurredCard';
import CategoryIcon, { CategoryType } from '@/components/shared/CategoryIcon';
import { Transaction } from '@/components/dashboard/RecentTransactions';

const categoryOptions: { value: CategoryType; label: string }[] = [
  { value: 'groceries', label: 'Groceries' },
  { value: 'rent', label: 'Rent/Mortgage' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'dining', label: 'Dining' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'salary', label: 'Salary' },
  { value: 'health', label: 'Health' },
  { value: 'travel', label: 'Travel' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'phone', label: 'Phone' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'income', label: 'Other Income' },
  { value: 'gift', label: 'Gifts' },
  { value: 'other', label: 'Other' },
];

const Transactions = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'other' as CategoryType,
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading data from API
    setTimeout(() => {
      // Sample data - more transactions
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: new Date(2023, 8, 28),
          description: 'Monthly Salary',
          amount: 3500,
          type: 'income',
          category: 'salary',
        },
        {
          id: '2',
          date: new Date(2023, 8, 27),
          description: 'Grocery Shopping',
          amount: 120.45,
          type: 'expense',
          category: 'groceries',
        },
        {
          id: '3',
          date: new Date(2023, 8, 26),
          description: 'Electricity Bill',
          amount: 78.20,
          type: 'expense',
          category: 'utilities',
        },
        {
          id: '4',
          date: new Date(2023, 8, 25),
          description: 'Dinner with Friends',
          amount: 65.30,
          type: 'expense',
          category: 'dining',
        },
        {
          id: '5',
          date: new Date(2023, 8, 24),
          description: 'Freelance Project',
          amount: 750,
          type: 'income',
          category: 'income',
        },
        {
          id: '6',
          date: new Date(2023, 8, 23),
          description: 'Internet Bill',
          amount: 59.99,
          type: 'expense',
          category: 'utilities',
        },
        {
          id: '7',
          date: new Date(2023, 8, 22),
          description: 'Movie Night',
          amount: 32.50,
          type: 'expense',
          category: 'entertainment',
        },
        {
          id: '8',
          date: new Date(2023, 8, 21),
          description: 'Gas',
          amount: 45.70,
          type: 'expense',
          category: 'transportation',
        },
        {
          id: '9',
          date: new Date(2023, 8, 20),
          description: 'Birthday Gift',
          amount: 50,
          type: 'expense',
          category: 'gift',
        },
        {
          id: '10',
          date: new Date(2023, 8, 19),
          description: 'Dentist',
          amount: 150,
          type: 'expense',
          category: 'health',
        },
      ];
      
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter transactions when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(transaction => 
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  }, [searchQuery, transactions]);

  const handleAddTransaction = () => {
    // Validate inputs
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.date) {
      toast({
        title: "Invalid input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    
    // Create new transaction object
    const transaction: Transaction = {
      id: Date.now().toString(), // Use timestamp as ID
      description: newTransaction.description,
      amount: amount,
      type: newTransaction.type as 'income' | 'expense',
      category: newTransaction.category,
      date: new Date(newTransaction.date),
    };
    
    // Add to transactions list
    setTransactions([transaction, ...transactions]);
    setFilteredTransactions([transaction, ...filteredTransactions]);
    
    // Reset form and close dialog
    setNewTransaction({
      description: '',
      amount: '',
      type: 'expense',
      category: 'other',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Transaction added",
      description: "Your transaction has been added successfully.",
    });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setNewTransaction({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: format(transaction.date, 'yyyy-MM-dd'),
    });
    setIsAddDialogOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!currentTransaction) return;
    
    const updatedTransactions = transactions.filter(t => t.id !== currentTransaction.id);
    setTransactions(updatedTransactions);
    setFilteredTransactions(updatedTransactions);
    setIsDeleteDialogOpen(false);
    setCurrentTransaction(null);
    
    toast({
      title: "Transaction deleted",
      description: "The transaction has been removed.",
    });
  };

  return (
    <DashboardLayout
      title="Transactions"
      description="Manage your income and expenses"
    >
      <BlurredCard>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button size="sm" onClick={() => {
              setCurrentTransaction(null);
              setNewTransaction({
                description: '',
                amount: '',
                type: 'expense',
                category: 'other',
                date: format(new Date(), 'yyyy-MM-dd'),
              });
              setIsAddDialogOpen(true);
            }} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">
                    <button className="flex items-center text-sm">
                      Date
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button className="flex items-center text-sm">
                      Description
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Amount</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm">
                      {format(transaction.date, 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{transaction.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <CategoryIcon category={transaction.category} size={14} />
                        <span className="ml-2 text-sm capitalize">{transaction.category}</span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-2">No transactions found</h4>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Start adding your transactions"}
            </p>
            {!searchQuery && (
              <Button onClick={() => {
                setCurrentTransaction(null);
                setNewTransaction({
                  description: '',
                  amount: '',
                  type: 'expense',
                  category: 'other',
                  date: format(new Date(), 'yyyy-MM-dd'),
                });
                setIsAddDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add transaction
              </Button>
            )}
          </div>
        )}
      </BlurredCard>
      
      {/* Add/Edit Transaction Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </DialogTitle>
            <DialogDescription>
              {currentTransaction 
                ? 'Edit the details of your transaction' 
                : 'Enter the details of your transaction'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select
                  value={newTransaction.type}
                  onValueChange={(value) => setNewTransaction({
                    ...newTransaction,
                    type: value as 'income' | 'expense'
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  description: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  amount: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <div className="col-span-3">
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction({
                    ...newTransaction,
                    category: value as CategoryType
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  date: e.target.value
                })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction}>
              {currentTransaction ? 'Save changes' : 'Add transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentTransaction && (
            <div className="py-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{currentTransaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(currentTransaction.date, 'MMM dd, yyyy')}
                  </p>
                </div>
                <span className={`font-medium ${
                  currentTransaction.type === 'income' ? 'text-success' : 'text-destructive'
                }`}>
                  {currentTransaction.type === 'income' ? '+' : '-'}${currentTransaction.amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Transactions;
