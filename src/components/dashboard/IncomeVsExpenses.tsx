
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import BlurredCard from '../shared/BlurredCard';

interface IncomeVsExpensesProps {
  income: number;
  expenses: number;
  isLoading?: boolean;
}

const IncomeVsExpenses: React.FC<IncomeVsExpensesProps> = ({
  income,
  expenses,
  isLoading = false,
}) => {
  const data = [
    { name: 'Income', value: income },
    { name: 'Expenses', value: expenses },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <BlurredCard className="h-full">
      <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border-4 border-gray-200 border-t-gray-400 animate-spin"></div>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                animationDuration={800}
                animationBegin={100}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="none"
                  />
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
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </BlurredCard>
  );
};

export default IncomeVsExpenses;
