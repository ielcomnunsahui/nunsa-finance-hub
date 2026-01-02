import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/types/finance';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Analytics: React.FC = () => {
  const { stats, getMonthlyData, incomes, expenses } = useFinance();
  const monthlyData = getMonthlyData();

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Calculate cumulative data for area chart
  const cumulativeData = monthlyData.reduce((acc: any[], item, index) => {
    const prevBalance = index > 0 ? acc[index - 1].balance : 0;
    const newBalance = prevBalance + item.income - item.expense;
    acc.push({
      ...item,
      balance: newBalance,
      profit: item.income - item.expense,
    });
    return acc;
  }, []);

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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold font-display">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Detailed financial insights and trends
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Income"
            value={totalIncome}
            icon={TrendingUp}
            variant="success"
            delay={100}
          />
          <StatCard
            title="Total Expenses"
            value={totalExpenses}
            icon={TrendingDown}
            variant="warning"
            delay={150}
          />
          <StatCard
            title="Net Profit"
            value={totalIncome - totalExpenses}
            icon={PiggyBank}
            variant="info"
            delay={200}
          />
          <div
            className="stat-card opacity-0 animate-slide-up"
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <p className="text-2xl lg:text-3xl font-bold font-display tracking-tight">
                  {profitMargin.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1">
                  {profitMargin >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-xs text-muted-foreground">of total income</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Balance Trend Chart */}
        <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold font-display">Balance Trend</h3>
            <p className="text-sm text-muted-foreground">Cumulative balance over time</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-income))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-income))" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Balance"
                  stroke="hsl(var(--chart-income))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeExpenseChart />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CategoryPieChart type="income" />
            <CategoryPieChart type="expense" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
