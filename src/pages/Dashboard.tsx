
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
  const { user, setupSubscription } = useAuth();
  const { toast } = useToast();

  // Load user data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch transactions from Supabase
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('id, description, amount, type, date, category_id, categories(icon)')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);

        if (transactionsError) throw transactionsError;

        // Fetch budgets from Supabase
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('budgets')
          .select('id, amount, category_id, categories(icon)')
          .eq('user_id', user.id);

        if (budgetsError) throw budgetsError;

        // Map the data to the expected formats
        const formattedTransactions = transactionsData.map(t => ({
          id: t.id,
          date: new Date(t.date),
          description: t.description,
          amount: Number(t.amount),
          type: t.type as 'income' | 'expense',
          category: (t.categories?.icon || 'other') as CategoryType,
        }));

        // Calculate totals
        const calculatedIncome = formattedTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const calculatedExpenses = formattedTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const calculatedBalance = calculatedIncome - calculatedExpenses;

        // For each budget, calculate how much was spent
        const formattedBudgets = budgetsData.map(b => {
          // Here you would calculate the spent amount based on transactions
          // For now, we'll use a placeholder value
          return {
            id: b.id,
            category: (b.categories?.icon || 'other') as CategoryType,
            amount: Number(b.amount),
            spent: 0, // This would be calculated from transactions
            period: 'monthly',
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
  }, [user, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new transactions
    const unsubscribeTransactions = setupSubscription<Transaction>(
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
            category: 'other' as CategoryType, // You'll need to fetch the category separately
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
    const unsubscribeBudgets = setupSubscription<Budget>(
      'budgets',
      'INSERT',
      (payload) => {
        if (payload.new) {
          // Map the new budget to the expected format
          const newBudget = {
            id: payload.new.id,
            category: 'other' as CategoryType, // You'll need to fetch the category separately
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
  }, [user, setupSubscription]);

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
