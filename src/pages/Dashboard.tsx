
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AccountBalance from '@/components/dashboard/AccountBalance';
import TransactionSummary, { Transaction } from '@/components/dashboard/TransactionSummary';
import QuickActions from '@/components/dashboard/QuickActions';
import RevenueStreams from '@/components/dashboard/RevenueStreams';
import LinkedAccounts from '@/components/dashboard/LinkedAccounts';
import { CategoryType } from '@/components/shared/CategoryIcon';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define the transaction data type for the payload
interface TransactionData {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string | null;
  user_id: string;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
          .limit(10);

        if (transactionsError) throw transactionsError;

        // Calculate totals from all transactions (not just the 10 most recent)
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

        // Map the data to the expected formats with random status for demo
        const formattedTransactions = transactionsData?.map(t => ({
          id: t.id,
          date: new Date(t.date),
          description: t.description,
          amount: Number(t.amount),
          type: t.type as 'income' | 'expense',
          category: getCategoryIcon(t.category_id),
          categoryId: t.category_id,
          status: Math.random() > 0.3 ? 'completed' as const : 'pending' as const,
          bankName: ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank'][Math.floor(Math.random() * 4)]
        })) || [];

        setTransactions(formattedTransactions);
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
    const unsubscribeTransactions = setupSubscription<TransactionData>(
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
            categoryId: payload.new.category_id,
            status: Math.random() > 0.3 ? 'completed' as const : 'pending' as const,
            bankName: ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank'][Math.floor(Math.random() * 4)]
          };

          setTransactions(prev => {
            if (prev.some(t => t.id === newTransaction.id)) return prev;
            return [newTransaction, ...prev.slice(0, 9)];
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

    return () => {
      unsubscribeTransactions();
    };
  }, [user, setupSubscription, categories]);

  return (
    <DashboardLayout
      title="Financial Dashboard"
      description="Overview of your financial activity"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AccountBalance
            balance={balance}
            income={income}
            expenses={expenses}
            isLoading={isLoading}
          />
          <QuickActions />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TransactionSummary 
              transactions={transactions}
              isLoading={isLoading}
            />
            <RevenueStreams />
          </div>
          
          <div className="lg:col-span-1">
            <LinkedAccounts />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
