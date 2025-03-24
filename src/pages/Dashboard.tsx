import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BalanceSummary from '@/components/dashboard/BalanceSummary';
import RecentTransactions, { Transaction } from '@/components/dashboard/RecentTransactions';
import BudgetProgress, { Budget } from '@/components/dashboard/BudgetProgress';
import IncomeVsExpenses from '@/components/dashboard/IncomeVsExpenses';
import { CategoryType } from '@/components/shared/CategoryIcon';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string, icon: string}[]>([]);
  const { user, setupSubscription } = useAuth();
  const { toast } = useToast();

  // Fetch categories
  useEffect(() => {
    if (user) {
      const fetchCategories = async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, icon');
          
        if (error) {
          console.error('Error fetching categories:', error);
        } else if (data) {
          setCategories(data);
        }
      };
      
      fetchCategories();
    }
  }, [user]);

  // Get category icon from category id
  const getCategoryIcon = (categoryId: string | null): CategoryType => {
    if (!categoryId) return 'other';
    const category = categories.find(c => c.id === categoryId);
    return category ? (category.icon as CategoryType) : 'other';
  };

  // Load user data
  useEffect(() => {
    if (!user || categories.length === 0) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch transactions from Supabase
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);

        if (transactionsError) throw transactionsError;

        // Fetch budgets from Supabase
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id);

        if (budgetsError) throw budgetsError;

        // Map the data to the expected formats
        const formattedTransactions = transactionsData.map(t => ({
          id: t.id,
          date: new Date(t.date),
          description: t.description,
          amount: Number(t.amount),
          type: t.type as 'income' | 'expense',
          category: getCategoryIcon(t.category_id),
        }));

        // Calculate totals from all transactions (not just the 5 most recent)
        const { data: allTransactionsData } = await supabase
          .from('transactions')
          .select('amount, type, category_id')
          .eq('user_id', user.id);
          
        const calculatedIncome = allTransactionsData
          ?.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
          
        const calculatedExpenses = allTransactionsData
          ?.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
          
        const calculatedBalance = calculatedIncome - calculatedExpenses;

        // For each budget, calculate how much was spent
        const formattedBudgets = budgetsData.map(b => {
          // Calculate spent amount based on transactions
          const categoryTransactions = allTransactionsData
            ?.filter(t => t.type === 'expense' && t.category_id === b.category_id) || [];
            
          const spent = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
          
          return {
            id: b.id,
            category: getCategoryIcon(b.category_id),
            amount: Number(b.amount),
            spent: spent,
            period: b.period,
          };
        });

        setTransactions(formattedTransactions);
        setBudgets(formattedBudgets);
        setIncome(calculatedIncome);
        setExpenses(calculatedExpenses);
        setBalance(calculatedBalance);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Failed to load dashboard data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast, categories]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || categories.length === 0) return;

    // Subscribe to new transactions
    const unsubscribeTransactions = setupSubscription<any>(
      'transactions',
      'INSERT',
      (payload) => {
        if (payload.new) {
          // Map the new transaction to the expected format
          const newTransaction = {
            id: payload.new.id,
            date: new Date(payload.new.date),
            description: payload.new.description,
            amount: Number(payload.new.amount),
            type: payload.new.type as 'income' | 'expense',
            category: getCategoryIcon(payload.new.category_id),
          };

          setTransactions(prev => {
            const updated = [newTransaction, ...prev].slice(0, 5);
            return updated;
          });

          // Update totals
          if (newTransaction.type === 'income') {
            setIncome(prev => prev + newTransaction.amount);
            setBalance(prev => prev + newTransaction.amount);
          } else {
            setExpenses(prev => prev + newTransaction.amount);
            setBalance(prev => prev - newTransaction.amount);
          }
        }
      }
    );

    // Subscribe to new budgets
    const unsubscribeBudgets = setupSubscription<any>(
      'budgets',
      'INSERT',
      (payload) => {
        if (payload.new) {
          // Map the new budget to the expected format
          const newBudget = {
            id: payload.new.id,
            category: getCategoryIcon(payload.new.category_id),
            amount: Number(payload.new.amount),
            spent: 0,
            period: payload.new.period,
          };

          setBudgets(prev => [...prev, newBudget]);
        }
      }
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
    };
  }, [user, setupSubscription, categories]);

  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview of your financial situation"
    >
      <div className="space-y-8">
        <BalanceSummary
          balance={balance}
          income={income}
          expenses={expenses}
          isLoading={isLoading}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions 
              transactions={transactions}
              isLoading={isLoading}
            />
          </div>
          
          <div className="space-y-6">
            <IncomeVsExpenses
              income={income}
              expenses={expenses}
              isLoading={isLoading}
            />
            
            <BudgetProgress
              budgets={budgets}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
