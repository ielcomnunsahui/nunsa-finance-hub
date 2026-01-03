import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { useFinanceData } from '@/hooks/useFinanceData';
import { TrendingUp, TrendingDown, PiggyBank, Target, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

const Analytics: React.FC = () => {
  const { income, expenses, stats, loading } = useFinanceData();

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthIncome = income.filter(inc => { const d = new Date(inc.created_at); return d >= start && d <= end; }).reduce((s, i) => s + Number(i.amount), 0);
      const monthExpense = expenses.filter(exp => { const d = new Date(exp.created_at); return d >= start && d <= end; }).reduce((s, e) => s + Number(e.amount), 0);
      return { month: format(date, 'MMM'), income: monthIncome, expense: monthExpense };
    });
  }, [income, expenses]);

  const cumulativeData = monthlyData.reduce((acc: any[], item, i) => {
    const prevBalance = i > 0 ? acc[i - 1].balance : 0;
    acc.push({ ...item, balance: prevBalance + item.income - item.expense });
    return acc;
  }, []);

  const profitMargin = stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100 : 0;

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl lg:text-3xl font-bold font-display">Analytics</h1><p className="text-muted-foreground mt-1">Detailed financial insights</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Income" value={stats.totalIncome} icon={TrendingUp} variant="success" delay={100} />
          <StatCard title="Total Expenses" value={stats.totalExpenses} icon={TrendingDown} variant="warning" delay={150} />
          <StatCard title="Net Profit" value={stats.currentBalance} icon={PiggyBank} variant="info" delay={200} />
          <div className="stat-card"><div className="flex items-start justify-between"><div className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Profit Margin</p><p className="text-2xl font-bold">{profitMargin.toFixed(1)}%</p><div className="flex items-center gap-1">{profitMargin >= 0 ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}<span className="text-xs text-muted-foreground">of income</span></div></div><div className="p-3 rounded-xl bg-primary/10"><Target className="h-6 w-6 text-primary" /></div></div></div>
        </div>
        <div className="card-elevated p-6"><h3 className="text-lg font-semibold mb-4">Balance Trend</h3><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cumulativeData}><defs><linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--chart-income))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--chart-income))" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} /><YAxis tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} /><Tooltip /><Area type="monotone" dataKey="balance" stroke="hsl(var(--chart-income))" strokeWidth={2} fill="url(#colorBalance)" /></AreaChart></ResponsiveContainer></div></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><IncomeExpenseChart /><div className="grid grid-cols-2 gap-6"><CategoryPieChart type="income" /><CategoryPieChart type="expense" /></div></div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
