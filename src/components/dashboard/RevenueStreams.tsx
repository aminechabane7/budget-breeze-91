
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueStream {
  name: string;
  amount: number;
  color: string;
}

const RevenueStreams: React.FC = () => {
  const data: RevenueStream[] = [
    { name: 'Agribusiness', amount: 4500, color: '#10b981' },
    { name: 'Product Sales', amount: 3200, color: '#3b82f6' },
    { name: 'YouTube Revenue', amount: 2100, color: '#ef4444' },
    { name: 'Consulting', amount: 1800, color: '#8b5cf6' },
    { name: 'Investments', amount: 1200, color: '#f59e0b' },
  ];

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
      </CardContent>
    </Card>
  );
};

export default RevenueStreams;
