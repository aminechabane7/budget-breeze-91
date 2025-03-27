
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

interface RevenueStream {
  name: string;
  amount: number;
  color: string;
}

const RevenueStreams: React.FC = () => {
  const [data, setData] = useState<RevenueStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Colors for the revenue streams
  const colors = ['#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7'];

  // Fetch revenue streams data
  useEffect(() => {
    if (!user) return;

    const fetchRevenueStreams = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('revenue_streams')
          .select('name, amount')
          .eq('user_id', user.id);

        if (error) throw error;

        // Aggregate revenue by stream name
        const aggregatedData = data?.reduce((acc: Record<string, number>, item) => {
          if (acc[item.name]) {
            acc[item.name] += Number(item.amount);
          } else {
            acc[item.name] = Number(item.amount);
          }
          return acc;
        }, {});

        // Format data for the chart
        const formattedData = Object.entries(aggregatedData || {}).map(([name, amount], index) => ({
          name,
          amount,
          color: colors[index % colors.length],
        }));

        // Sort by amount (highest first)
        formattedData.sort((a, b) => b.amount - a.amount);

        // Take top 5 streams
        setData(formattedData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching revenue streams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueStreams();

    // Set up realtime subscription
    const revenueSubscription = supabase
      .channel('revenue-streams-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'revenue_streams',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Refresh data when changes occur
          fetchRevenueStreams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(revenueSubscription);
    };
  }, [user]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-primary font-semibold">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Revenue Streams</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 90, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  style={{
                    fontSize: '12px',
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center flex-col">
            <p className="text-muted-foreground">No revenue streams found</p>
            <p className="text-sm text-muted-foreground">
              Add revenue streams to see them here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueStreams;
