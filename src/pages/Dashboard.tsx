
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CategoryType } from '@/components/shared/CategoryIcon';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import RecentActivities from '@/components/dashboard/RecentActivities';
import UpcomingPayments from '@/components/dashboard/UpcomingPayments';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import CreditCard from '@/components/dashboard/CreditCard';
import { CreditCard as CreditCardIcon, ArrowRightLeft, Building, Send } from 'lucide-react';

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: CategoryType;
  categoryId?: string | null;
  status?: 'pending' | 'completed';
  bankName?: string;
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
    const unsubscribeTransactions = setupSubscription<any>(
      'transactions',
      'INSERT',
      (payload) => {
        if (payload.new) {
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
    <DashboardLayout>
      <div className="my-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Payments updates</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        <div className="md:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <QuickActionCard
              title="Transfer via"
              subtitle="Card number"
              amount="1,200"
              icon={<CreditCardIcon className="h-5 w-5 text-gray-600" />}
            />
            <QuickActionCard
              title="Transfer"
              subtitle="Other Banks"
              amount="150"
              icon={<ArrowRightLeft className="h-5 w-5 text-gray-600" />}
            />
            <QuickActionCard
              title="Transfer"
              subtitle="Same Bank"
              amount="1,500"
              icon={<Building className="h-5 w-5 text-gray-600" />}
            />
            <QuickActionCard
              title="Transfer to"
              subtitle="Other Bank"
              amount="1,500"
              icon={<Send className="h-5 w-5 text-gray-600" />}
            />
          </div>
          
          <AnalyticsChart />
          
          <div className="mt-6">
            <TransactionHistory transactions={[]} />
          </div>
        </div>
        
        <div className="md:col-span-3 space-y-6">
          <CreditCard />
          <RecentActivities />
          <UpcomingPayments />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
