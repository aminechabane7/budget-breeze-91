
import React from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CategoryIcon, { CategoryType } from '../shared/CategoryIcon';
import { Link } from 'react-router-dom';

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

interface TransactionSummaryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  transactions,
  isLoading = false
}) => {
  // Filter transactions by status
  const pendingTransactions = transactions.filter(t => t.status === 'pending' || !t.status);
  const completedTransactions = transactions.filter(t => t.status === 'completed');

  // If no status is provided, distribute them between pending and completed for demo purposes
  const displayedPending = pendingTransactions.length > 0 
    ? pendingTransactions 
    : transactions.slice(0, 2);
    
  const displayedCompleted = completedTransactions.length > 0 
    ? completedTransactions 
    : transactions.slice(-3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Transaction Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <TransactionSkeleton count={5} />
            ) : transactions.length > 0 ? (
              <>
                {transactions.slice(0, 5).map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
                <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                  <Link to="/transactions">
                    View all transactions <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </>
            ) : (
              <EmptyTransactionState />
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <TransactionSkeleton count={3} />
            ) : displayedPending.length > 0 ? (
              displayedPending.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={{...transaction, status: 'pending'}} />
              ))
            ) : (
              <EmptyTransactionState message="No pending transactions" />
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <TransactionSkeleton count={3} />
            ) : displayedCompleted.length > 0 ? (
              displayedCompleted.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={{...transaction, status: 'completed'}} />
              ))
            ) : (
              <EmptyTransactionState message="No completed transactions" />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  // Add bank names if not provided
  const bankName = transaction.bankName || ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank'][Math.floor(Math.random() * 4)];
  const status = transaction.status || (Math.random() > 0.3 ? 'completed' : 'pending');
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10">
          <CategoryIcon category={transaction.category} size={18} />
        </div>
        <div>
          <p className="font-medium line-clamp-1">{transaction.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{bankName}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
            <span>{format(transaction.date, 'MMM dd')}</span>
            {status === 'pending' ? (
              <span className="flex items-center text-amber-500">
                <Clock className="h-3 w-3 mr-1" /> Pending
              </span>
            ) : (
              <span className="flex items-center text-emerald-500">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
              </span>
            )}
          </div>
        </div>
      </div>
      <span className={`font-medium ${
        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
      </span>
    </div>
  );
};

const TransactionSkeleton: React.FC<{ count: number }> = ({ count }) => {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </>
  );
};

const EmptyTransactionState: React.FC<{ message?: string }> = ({ message = "No transactions yet" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="rounded-full bg-muted p-3 mb-3">
        <Clock className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="text-lg font-medium mb-1">{message}</h4>
      <p className="text-muted-foreground text-sm mb-4">
        Your recent transactions will appear here
      </p>
      <Button asChild size="sm">
        <Link to="/transactions">
          Add transaction
        </Link>
      </Button>
    </div>
  );
};

export default TransactionSummary;
