
import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BlurredCard from '@/components/shared/BlurredCard';
import { CategoryType } from '@/components/shared/CategoryIcon';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileSpreadsheet,
  FilePdf 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { format, subDays, subMonths, subQuarters, startOfYear, startOfMonth, startOfQuarter, endOfMonth } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: CategoryType;
  categoryId: string | null;
}

interface CategoryTotal {
  name: string;
  value: number;
  color: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

const colorMap: Record<string, string> = {
  groceries: '#3b82f6',
  rent: '#8b5cf6',
  utilities: '#eab308',
  dining: '#ef4444',
  transportation: '#22c55e',
  salary: '#10b981',
  health: '#ec4899',
  travel: '#6366f1',
  entertainment: '#f97316',
  phone: '#0ea5e9',
  subscriptions: '#8b5cf6',
  income: '#14b8a6',
  gift: '#f43f5e',
  other: '#64748b',
};

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeFrame, setTimeFrame] = useState('year');
  const [categoryData, setCategoryData] = useState<CategoryTotal[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string, icon: string, color: string}[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // References for export
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => {
    if (user) {
      const fetchCategories = async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, icon, color');
          
        if (error) {
          console.error('Error fetching categories:', error);
          toast({
            title: "Error fetching categories",
            description: error.message,
            variant: "destructive",
          });
        } else if (data) {
          setCategories(data);
        }
      };
      
      fetchCategories();
    }
  }, [user, toast]);

  // Get category info
  const getCategoryInfo = (categoryId: string | null) => {
    if (!categoryId) return { name: "Other", icon: "other" as CategoryType, color: colorMap.other };
    const category = categories.find(c => c.id === categoryId);
    return {
      name: category ? category.name : "Other",
      icon: category ? (category.icon as CategoryType) : "other" as CategoryType,
      color: category ? category.color || colorMap.other : colorMap.other
    };
  };

  // Get date range based on timeframe
  const getDateRange = () => {
    const now = new Date();
    let fromDate: Date;
    
    switch (timeFrame) {
      case 'week':
        fromDate = subDays(now, 7);
        break;
      case 'month':
        fromDate = startOfMonth(now);
        break;
      case 'quarter':
        fromDate = startOfQuarter(now);
        break;
      case 'year':
        fromDate = startOfYear(now);
        break;
      default: // all time
        fromDate = new Date(2000, 0, 1); // Far back date for "all time"
    }
    
    return format(fromDate, 'yyyy-MM-dd');
  };

  // Load transactions based on timeframe
  useEffect(() => {
    if (!user || categories.length === 0) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      
      try {
        // Define date range based on timeframe
        const formattedFromDate = getDateRange();
        
        // Fetch transactions based on timeframe
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', formattedFromDate)
          .order('date', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          // Format transactions
          const formattedTransactions = data.map(item => {
            const categoryInfo = getCategoryInfo(item.category_id);
            return {
              id: item.id,
              date: new Date(item.date),
              description: item.description,
              amount: Number(item.amount),
              type: item.type as 'income' | 'expense',
              category: categoryInfo.icon,
              categoryId: item.category_id,
            };
          });
          
          setTransactions(formattedTransactions);
          
          // Calculate monthly data
          calculateMonthlyData(formattedTransactions);
          
          // Calculate category data
          calculateCategoryData(formattedTransactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error fetching transactions",
          description: "Unable to load transaction data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [user, timeFrame, categories, toast]);
  
  // Calculate monthly data for charts
  const calculateMonthlyData = (transactions: Transaction[]) => {
    // Group transactions by month
    const months: Record<string, { income: number, expenses: number }> = {};
    
    transactions.forEach(transaction => {
      const monthKey = format(transaction.date, 'MMM yyyy');
      
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        months[monthKey].income += transaction.amount;
      } else {
        months[monthKey].expenses += transaction.amount;
      }
    });
    
    // Convert to array format for charts
    const monthlyDataArray = Object.keys(months).map(month => ({
      month,
      income: Number(months[month].income.toFixed(2)),
      expenses: Number(months[month].expenses.toFixed(2)),
    }));
    
    setMonthlyData(monthlyDataArray);
  };
  
  // Calculate category data for pie chart
  const calculateCategoryData = (transactions: Transaction[]) => {
    // Get expense transactions
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Group by category
    const categoryTotals: Record<string, number> = {};
    
    expenseTransactions.forEach(transaction => {
      const categoryInfo = getCategoryInfo(transaction.categoryId);
      const categoryName = categoryInfo.name;
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0;
      }
      
      categoryTotals[categoryName] += transaction.amount;
    });
    
    // Convert to array format for charts
    const categoryDataArray = Object.keys(categoryTotals).map(category => {
      const matchingCategory = categories.find(c => c.name === category);
      return {
        name: category,
        value: Number(categoryTotals[category].toFixed(2)),
        color: matchingCategory?.color || colorMap.other,
      };
    });
    
    setCategoryData(categoryDataArray);
  };

  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value);
  };

  const handleExportExcel = () => {
    // In a real implementation, this would generate and download an Excel file
    toast({
      title: "Excel Report Generated",
      description: "Your financial report has been exported to Excel (.xlsx)",
    });
  };

  const handleExportPDF = () => {
    // In a real implementation, this would generate and download a PDF file
    toast({
      title: "PDF Report Generated",
      description: "Your financial report has been exported to PDF",
    });
  };

  // Utility function to calculate totals
  const calculateTotals = () => {
    const totalIncome = monthlyData.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = monthlyData.reduce((sum, item) => sum + item.expenses, 0);
    const netSavings = totalIncome - totalExpenses;
    const avgMonthlyIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0;
    const avgMonthlyExpenses = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0;
    
    // Find month with highest savings
    let highestSavingsMonth = monthlyData.length > 0 ? monthlyData[0].month : 'N/A';
    let highestSavings = monthlyData.length > 0 ? monthlyData[0].income - monthlyData[0].expenses : 0;
    
    monthlyData.forEach(month => {
      const savings = month.income - month.expenses;
      if (savings > highestSavings) {
        highestSavings = savings;
        highestSavingsMonth = month.month;
      }
    });
    
    return {
      totalIncome,
      totalExpenses,
      netSavings,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      highestSavingsMonth
    };
  };

  const totals = calculateTotals();

  // Function to get the title based on timeFrame
  const getTimeFrameTitle = () => {
    switch (timeFrame) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };

  return (
    <DashboardLayout
      title="Reports"
      description="Visualize and analyze your financial data"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">
            {getTimeFrameTitle()} - Gain insights into your income and spending patterns
          </p>
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Select
            value={timeFrame}
            onValueChange={handleTimeFrameChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FilePdf className="h-4 w-4 mr-2" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid grid-cols-3 max-w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <BlurredCard>
            <h3 className="text-lg font-semibold mb-6">Income vs Expenses</h3>
            
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : monthlyData.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">No data available for the selected time period</p>
              </div>
            ) : (
              <div className="h-80" ref={barChartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </BlurredCard>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BlurredCard>
              <h3 className="text-lg font-semibold mb-6">Savings Trend</h3>
              
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : monthlyData.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">No data available for the selected time period</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData.map(item => ({
                        ...item,
                        savings: item.income - item.expenses
                      }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Savings']}
                        contentStyle={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(8px)',
                          border: 'none',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="savings" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </BlurredCard>
            
            <BlurredCard>
              <h3 className="text-lg font-semibold mb-6">Summary</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between animate-pulse">
                      <div className="h-5 w-32 bg-gray-200 rounded"></div>
                      <div className="h-5 w-24 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : monthlyData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">No data available for the selected time period</p>
                </div>
              ) : (
                <div className="space-y-4" ref={summaryRef}>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Total Income</span>
                    <span className="text-success font-semibold">
                      ${totals.totalIncome.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Total Expenses</span>
                    <span className="text-destructive font-semibold">
                      ${totals.totalExpenses.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Net Savings</span>
                    <span className="font-semibold">
                      ${totals.netSavings.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Average Monthly Income</span>
                    <span className="font-semibold">
                      ${totals.avgMonthlyIncome.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Average Monthly Expenses</span>
                    <span className="font-semibold">
                      ${totals.avgMonthlyExpenses.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Highest Savings Month</span>
                    <span className="font-semibold">
                      {totals.highestSavingsMonth}
                    </span>
                  </div>
                </div>
              )}
            </BlurredCard>
          </div>
        </TabsContent>
        
        <TabsContent value="expenses" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BlurredCard>
              <h3 className="text-lg font-semibold mb-6">Expense Categories</h3>
              
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : categoryData.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">No expense data available for the selected time period</p>
                </div>
              ) : (
                <div className="h-80" ref={pieChartRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
                        contentStyle={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(8px)',
                          border: 'none',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </BlurredCard>
            
            <BlurredCard>
              <h3 className="text-lg font-semibold mb-6">Top Expense Categories</h3>
              
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-5 w-32 bg-gray-200 rounded"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">No expense data available for the selected time period</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {[...categoryData]
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((category, index) => {
                      const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.value, 0);
                      const percentage = (category.value / totalExpenses) * 100;
                      
                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{category.name}</span>
                            <div className="flex items-baseline">
                              <span className="font-semibold mr-2">
                                ${category.value.toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-muted">
                              <div 
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: category.color 
                                }} 
                                className="rounded"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </BlurredCard>
          </div>
          
          <BlurredCard>
            <h3 className="text-lg font-semibold mb-6">Monthly Expense Trend</h3>
            
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : monthlyData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">No data available for the selected time period</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Expenses']}
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </BlurredCard>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-8">
          <BlurredCard>
            <h3 className="text-lg font-semibold mb-6">Monthly Income Trend</h3>
            
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : monthlyData.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">No income data available for the selected time period</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Income']}
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                      }}
                    />
                    <Bar 
                      dataKey="income" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </BlurredCard>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BlurredCard>
              <h3 className="text-lg font-semibold mb-6">Income Summary</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between animate-pulse">
                      <div className="h-5 w-32 bg-gray-200 rounded"></div>
                      <div className="h-5 w-24 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : monthlyData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">No income data available for the selected time period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Total Annual Income</span>
                    <span className="text-success font-semibold">
                      ${totals.totalIncome.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Average Monthly Income</span>
                    <span className="font-semibold">
                      ${totals.avgMonthlyIncome.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Highest Income Month</span>
                    <span className="font-semibold">
                      {monthlyData.reduce(
                        (max, item) => item.income > max.income ? item : max,
                        monthlyData[0]
                      ).month}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Lowest Income Month</span>
                    <span className="font-semibold">
                      {monthlyData.reduce(
                        (min, item) => item.income < min.income ? item : min,
                        monthlyData[0]
                      ).month}
                    </span>
                  </div>
                  
                  {monthlyData.length > 1 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Income Growth</span>
                      <span className="font-semibold">
                        {(() => {
                          const firstMonth = monthlyData[0].income;
                          const lastMonth = monthlyData[monthlyData.length - 1].income;
                          const growth = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
                          return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </BlurredCard>
            
            <BlurredCard>
              <h3 className="text-lg font-semibold mb-6">Yearly Comparison</h3>
              
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Year-over-year comparison will be available after you have data for multiple years.
                    </p>
                    <p className="text-sm text-primary">
                      Continue tracking your finances to unlock this feature.
                    </p>
                  </div>
                </div>
              )}
            </BlurredCard>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Reports;
