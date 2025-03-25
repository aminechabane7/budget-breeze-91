
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AnalyticsChartProps {
  data?: any[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data = [
    { name: 'JAN', value: 5000 },
    { name: 'FEB', value: 8000 },
    { name: 'MAR', value: 12000 },
    { name: 'APR', value: 15000 },
    { name: 'MAY', value: 10000 },
    { name: 'JUN', value: 8000 },
    { name: 'JUL', value: 6000 },
    { name: 'AUG', value: 14000 },
    { name: 'SEP', value: 12000 },
    { name: 'OCT', value: 10000 },
    { name: 'NOV', value: 12000 }
  ]
}) => {
  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">Balance</CardTitle>
          <p className="text-3xl font-bold">$1500</p>
        </div>
        <div className="text-sm text-gray-500">PAST 30 DAYS</div>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 25, left: 25, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `${value / 1000}K`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                ticks={[0, 5000, 10000, 50000, 100000]}
              />
              <Tooltip
                formatter={(value) => [`$${value}`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: 'none',
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar 
                dataKey="value" 
                fill="#111111" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
