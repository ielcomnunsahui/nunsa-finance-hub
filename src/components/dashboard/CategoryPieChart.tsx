import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/types/finance';

interface CategoryPieChartProps {
  type: 'income' | 'expense';
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ type }) => {
  const { getCategoryBreakdown } = useFinance();
  const data = getCategoryBreakdown(type);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-foreground">{item.name}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(item.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={index} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  if (data.length === 0) {
    return (
      <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold font-display capitalize">
            {type} Distribution
          </h3>
          <p className="text-sm text-muted-foreground">By category</p>
        </div>
        <div className="h-[250px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '400ms' }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold font-display capitalize">
          {type} Distribution
        </h3>
        <p className="text-sm text-muted-foreground">By category</p>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
