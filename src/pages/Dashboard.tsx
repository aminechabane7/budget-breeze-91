
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BalanceSummary from '@/components/dashboard/BalanceSummary';
import RecentTransactions, { Transaction } from '@/components/dashboard/RecentTransactions';
import BudgetProgress, { Budget } from '@/components/dashboard/BudgetProgress';
import IncomeVsExpenses from '@/components/dashboard/IncomeVsExpenses';
import { CategoryType } from '@/components/shared/CategoryIcon';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    // Simulate loading data from API
    setTimeout(() => {
      // Sample data
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
      ];
      
      const mockBudgets: Budget[] = [
        {
          id: '1',
          category: 'groceries',
          amount: 400,
          spent: 320.45,
          period: 'monthly',
        },
        {
          id: '2',
          category: 'dining',
          amount: 200,
          spent: 185.30,
          period: 'monthly',
        },
        {
          id: '3',
          category: 'utilities',
          amount: 150,
          spent: 178.20,
          period: 'monthly',
        },
      ];
      
      // Calculate totals
      const totalIncome = mockTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpenses = mockTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalBalance = totalIncome - totalExpenses;
      
      setBalance(totalBalance);
      setIncome(totalIncome);
      setExpenses(totalExpenses);
      setTransactions(mockTransactions);
      setBudgets(mockBudgets);
      setIsLoading(false);
    }, 1500);
  }, []);

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
