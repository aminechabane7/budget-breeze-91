
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RevenueStream {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  date: string;
  recurring: boolean;
  recurrence_period: string | null;
  created_at: string;
  updated_at: string;
}

interface RevenueComparisonChartProps {
  data: RevenueStream[];
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

const RevenueComparisonChart: React.FC<RevenueComparisonChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const streamSummary: Record<string, number> = {};
    
    data.forEach(stream => {
      if (streamSummary[stream.name]) {
        streamSummary[stream.name] += Number(stream.amount);
      } else {
        streamSummary[stream.name] = Number(stream.amount);
      }
    });
    
    return Object.entries(streamSummary)
      .map(([name, amount], index) => ({
        name,
        amount,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-primary font-semibold">${payload[0].value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((payload[0].value / chartData.reduce((sum, item) => sum + item.amount, 0)) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
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
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )}
    </div>
  );
};

export default RevenueComparisonChart;
