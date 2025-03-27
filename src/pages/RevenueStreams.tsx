
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Trash2, Calendar, DollarSign, Info, ArrowUpRight, BarChart2, TrendingUp, RefreshCw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import RevenueStreamChart from '@/components/revenue/RevenueStreamChart';
import RevenueComparisonChart from '@/components/revenue/RevenueComparisonChart';
import RevenueGrowthChart from '@/components/revenue/RevenueGrowthChart';

type RevenueStream = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  date: string;
  recurring: boolean;
  recurrence_period: string | null;
  created_at: string;
  updated_at: string;
};

const RevenueStreams = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'all' | '1M' | '3M' | '6M' | '1Y'>('3M');
  const [newRevenueStream, setNewRevenueStream] = useState<Omit<RevenueStream, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    recurring: false,
    recurrence_period: null
  });

  // Get revenue streams from Supabase
  const fetchRevenueStreams = async () => {
    let query = supabase
      .from('revenue_streams')
      .select('*')
      .order('date', { ascending: false });

    // Apply time filter if needed
    if (timeRange !== 'all') {
      const today = new Date();
      let startDate;
      
      switch(timeRange) {
        case '1M':
          startDate = subMonths(today, 1);
          break;
        case '3M':
          startDate = subMonths(today, 3);
          break;
        case '6M':
          startDate = subMonths(today, 6);
          break;
        case '1Y':
          startDate = subMonths(today, 12);
          break;
      }
      
      query = query.gte('date', format(startDate, 'yyyy-MM-dd'));
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as RevenueStream[];
  };

  const { data: revenueStreams, isLoading } = useQuery({
    queryKey: ['revenueStreams', timeRange],
    queryFn: fetchRevenueStreams
  });

  // Add new revenue stream
  const addRevenueStreamMutation = useMutation({
    mutationFn: async (newStream: Omit<RevenueStream, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('revenue_streams')
        .insert([newStream])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenueStreams'] });
      setIsAddDialogOpen(false);
      setNewRevenueStream({
        name: '',
        description: '',
        amount: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        recurring: false,
        recurrence_period: null
      });
      toast({
        title: 'Revenue stream added',
        description: 'Your revenue stream has been added successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add revenue stream: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Delete revenue stream
  const deleteRevenueStreamMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('revenue_streams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['revenueStreams'] });
      toast({
        title: 'Revenue stream deleted',
        description: 'The revenue stream has been deleted successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete revenue stream: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Calculate summary data
  const getTotalRevenue = () => {
    if (!revenueStreams) return 0;
    return revenueStreams.reduce((sum, stream) => sum + Number(stream.amount), 0);
  };

  const getStreamSummary = () => {
    if (!revenueStreams) return [];
    
    const summary: Record<string, number> = {};
    
    revenueStreams.forEach(stream => {
      if (summary[stream.name]) {
        summary[stream.name] += Number(stream.amount);
      } else {
        summary[stream.name] = Number(stream.amount);
      }
    });
    
    return Object.entries(summary)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const handleAddRevenueStream = (e: React.FormEvent) => {
    e.preventDefault();
    addRevenueStreamMutation.mutate(newRevenueStream);
  };

  return (
    <DashboardLayout title="Revenue Streams" description="Track and analyze your revenue sources">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="1M">Last Month</SelectItem>
              <SelectItem value="3M">Last 3 Months</SelectItem>
              <SelectItem value="6M">Last 6 Months</SelectItem>
              <SelectItem value="1Y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Revenue Stream
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Revenue Stream</DialogTitle>
              <DialogDescription>
                Add a new revenue source to your financial tracking.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRevenueStream}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={newRevenueStream.name} 
                    onChange={(e) => setNewRevenueStream({...newRevenueStream, name: e.target.value})}
                    placeholder="E.g., Freelance Work, Investments, YouTube Revenue"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    value={newRevenueStream.description || ''} 
                    onChange={(e) => setNewRevenueStream({...newRevenueStream, description: e.target.value})}
                    placeholder="Additional details about this revenue stream"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="amount" 
                      type="number"
                      className="pl-9"
                      value={newRevenueStream.amount} 
                      onChange={(e) => setNewRevenueStream({...newRevenueStream, amount: parseFloat(e.target.value)})}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="date" 
                      type="date"
                      className="pl-9"
                      value={newRevenueStream.date} 
                      onChange={(e) => setNewRevenueStream({...newRevenueStream, date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="recurring" 
                    checked={newRevenueStream.recurring}
                    onCheckedChange={(checked) => setNewRevenueStream({...newRevenueStream, recurring: checked})}
                  />
                  <Label htmlFor="recurring">Recurring Revenue</Label>
                </div>
                {newRevenueStream.recurring && (
                  <div className="grid gap-2">
                    <Label htmlFor="recurrence_period">Recurrence Period</Label>
                    <Select 
                      value={newRevenueStream.recurrence_period || undefined} 
                      onValueChange={(value) => setNewRevenueStream({...newRevenueStream, recurrence_period: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addRevenueStreamMutation.isPending}>
                  {addRevenueStreamMutation.isPending ? 'Adding...' : 'Add Revenue Stream'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${getTotalRevenue().toLocaleString()}</div>
                <p className="text-muted-foreground text-sm mt-1">
                  {timeRange === 'all' 
                    ? 'All time' 
                    : `Last ${timeRange}`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{revenueStreams?.length || 0}</div>
                <p className="text-muted-foreground text-sm mt-1">Unique revenue sources</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${revenueStreams && revenueStreams.length > 0 
                    ? (getTotalRevenue() / revenueStreams.length).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }) 
                    : '0.00'}
                </div>
                <p className="text-muted-foreground text-sm mt-1">Per revenue entry</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
              <CardDescription>Summary of revenue by source</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <RevenueStreamChart data={getStreamSummary()} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth Over Time</CardTitle>
              <CardDescription>Track how your revenue has changed</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {revenueStreams && revenueStreams.length > 0 ? (
                <RevenueGrowthChart data={revenueStreams} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available for trends</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Streams Comparison</CardTitle>
              <CardDescription>Compare your different revenue sources</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {revenueStreams && revenueStreams.length > 0 ? (
                <RevenueComparisonChart data={revenueStreams} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available for comparison</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Stream Details</CardTitle>
              <CardDescription>List of all your revenue sources and entries</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : revenueStreams && revenueStreams.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueStreams.map(stream => (
                      <TableRow key={stream.id}>
                        <TableCell className="font-medium">
                          <div>
                            {stream.name}
                            {stream.description && (
                              <p className="text-xs text-muted-foreground mt-1">{stream.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(stream.date), 'PP')}</TableCell>
                        <TableCell>${Number(stream.amount).toLocaleString()}</TableCell>
                        <TableCell>
                          {stream.recurring ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {stream.recurrence_period || 'Recurring'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                              One-time
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRevenueStreamMutation.mutate(stream.id)}
                            disabled={deleteRevenueStreamMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Info className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No revenue streams yet</h3>
                  <p className="text-muted-foreground mb-4">Start tracking your income by adding your first revenue stream.</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Revenue Stream
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default RevenueStreams;
