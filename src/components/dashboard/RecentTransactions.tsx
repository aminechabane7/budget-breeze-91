
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlurredCard from '../shared/BlurredCard';
import CategoryIcon, { CategoryType } from '../shared/CategoryIcon';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: CategoryType;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions: propTransactions,
  isLoading: propIsLoading = false,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>(propTransactions || []);
  const [isLoading, setIsLoading] = useState(propIsLoading);
  const { user, setupSubscription } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchRecentTransactions = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })
            .limit(5);

          if (error) {
            throw error;
          }

          if (data) {
            const formattedTransactions: Transaction[] = data.map(item => {
              // Get category from category_id, default to 'other' if not found
              // In a real app, we would fetch the categories and map by ID
              const categoryType = item.category_id ? (item.category_id as unknown as CategoryType) : 'other';
              
              return {
                id: item.id,
                date: new Date(item.date),
                description: item.description,
                amount: Number(item.amount),
                type: item.type as 'income' | 'expense',
                category: categoryType,
              };
            });
            
            setTransactions(formattedTransactions);
          }
        } catch (error) {
          console.error('Error fetching recent transactions:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecentTransactions();

      // Set up real-time subscription for transactions
      const cleanup = setupSubscription<any>(
        'transactions',
        'INSERT',
        (payload) => {
          const newTransaction = payload.new;
          setTransactions(current => {
            const categoryType = newTransaction.category_id 
              ? (newTransaction.category_id as unknown as CategoryType) 
              : 'other';
              
            const transaction: Transaction = {
              id: newTransaction.id,
              date: new Date(newTransaction.date),
              description: newTransaction.description,
              amount: Number(newTransaction.amount),
              type: newTransaction.type as 'income' | 'expense',
              category: categoryType,
            };
            return [transaction, ...current.slice(0, 4)]; // Keep only the latest 5 transactions
          });
        }
      );

      return cleanup;
    }
  }, [user, setupSubscription]);

  return (
    <BlurredCard className="min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Button size="sm" variant="ghost" asChild className="ml-auto">
          <Link to="/transactions">
            View all
          </Link>
        </Button>
        <Button size="sm" className="ml-2" asChild>
          <Link to="/transactions">
            <Plus className="h-4 w-4 mr-1" />
            Add new
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-1 overflow-y-auto subtle-scroll max-h-[360px]">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center space-x-4 p-3 hover:bg-black/5 rounded-lg transition-colors"
            >
              <CategoryIcon category={transaction.category} size={18} />
              
              <div className="flex-1">
                <p className="font-medium line-clamp-1">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {format(transaction.date, 'MMM dd, yyyy')}
                </p>
              </div>
              
              <span className={`font-medium ${
                transaction.type === 'income' ? 'text-success' : 'text-destructive'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium mb-2">No transactions yet</h4>
          <p className="text-muted-foreground mb-4">
            Start adding your income and expenses to track your finances
          </p>
          <Button asChild>
            <Link to="/transactions">
              <Plus className="h-4 w-4 mr-1" />
              Add transaction
            </Link>
          </Button>
        </div>
      )}
    </BlurredCard>
  );
};

export default RecentTransactions;
