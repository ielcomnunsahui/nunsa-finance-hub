import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useFinanceData } from '@/hooks/useFinanceData';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const IncomeExpenseChart: React.FC = () => {
  const { income, expenses } = useFinanceData();

  const data = useMemo(() => {
    const months: { month: string; income: number; expense: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthIncome = income
        .filter(inc => {
          const incDate = new Date(inc.created_at);
          return incDate >= monthStart && incDate <= monthEnd;
        })
        .reduce((sum, inc) => sum + Number(inc.amount), 0);

      const monthExpense = expenses
        .filter(exp => {
          const expDate = new Date(exp.created_at);
          return expDate >= monthStart && expDate <= monthEnd;
        })
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      months.push({
        month: format(date, 'MMM'),
        income: monthIncome,
        expense: monthExpense,
      });
    }

    return months;
  }, [income, expenses]);

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold font-display">Income vs Expenses</h3>
        <p className="text-sm text-muted-foreground">Last 6 months comparison</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="hsl(var(--chart-income))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name="Expenses"
              fill="hsl(var(--chart-expense))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
