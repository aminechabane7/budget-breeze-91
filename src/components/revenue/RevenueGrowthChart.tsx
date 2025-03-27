
import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from 'date-fns';

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

interface RevenueGrowthChartProps {
  data: RevenueStream[];
}

const RevenueGrowthChart: React.FC<RevenueGrowthChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data.length) return [];

    // Find the earliest and latest dates in the data
    const dates = data.map(item => new Date(item.date));
    const minDate = new Date(Math.min(...dates.map(date => date.getTime())));
    const maxDate = new Date(Math.max(...dates.map(date => date.getTime())));
    
    // Create a list of all months between min and max dates
    const monthsInterval = eachMonthOfInterval({
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate)
    });
    
    // Initialize data for each month
    const monthlyData = monthsInterval.map(month => ({
      month: format(month, 'MMM yyyy'),
      date: month,
      total: 0
    }));
    
    // Aggregate revenue by month
    data.forEach(stream => {
      const streamDate = parseISO(stream.date);
      const monthIndex = monthlyData.findIndex(m => 
        isSameMonth(m.date, streamDate)
      );
      
      if (monthIndex !== -1) {
        monthlyData[monthIndex].total += Number(stream.amount);
      }
    });

    // Calculate cumulative revenue
    let cumulativeTotal = 0;
    const finalData = monthlyData.map(month => {
      cumulativeTotal += month.total;
      return {
        ...month,
        monthlyRevenue: month.total,
        total: cumulativeTotal
      };
    });

    return finalData;
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <div className="mt-2 space-y-1">
            <p className="text-green-500 text-sm flex justify-between">
              <span>Monthly:</span> 
              <span className="font-bold">${payload[0].value.toLocaleString()}</span>
            </p>
            <p className="text-blue-500 text-sm flex justify-between">
              <span>Cumulative:</span> 
              <span className="font-bold">${payload[1].value.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              tickLine={false}
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
            />
            <Line 
              type="monotone" 
              dataKey="monthlyRevenue" 
              stroke="#10b981" 
              name="Monthly Revenue" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#3b82f6" 
              name="Cumulative Revenue" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )}
    </div>
  );
};

export default RevenueGrowthChart;
