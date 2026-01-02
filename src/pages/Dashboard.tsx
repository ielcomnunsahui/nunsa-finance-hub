import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AddIncomeDialog } from '@/components/forms/AddIncomeDialog';
import { AddExpenseDialog } from '@/components/forms/AddExpenseDialog';
import { useFinance } from '@/contexts/FinanceContext';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CalendarDays,
  Wallet,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { stats } = useFinance();
  const { toast } = useToast();
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const handleGenerateReport = () => {
    toast({
      title: 'Report Generation',
      description: 'Monthly report is being generated. This feature will be available soon.',
    });
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 opacity-0 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your financial overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Today's Income"
          value={stats.todayIncome}
          change={stats.incomeChange}
          icon={TrendingUp}
          variant="success"
          delay={100}
        />
        <StatCard
          title="Today's Expenses"
          value={stats.todayExpenses}
          change={stats.expenseChange}
          icon={TrendingDown}
          variant="warning"
          delay={150}
        />
        <StatCard
          title="Weekly Total"
          value={stats.weeklyTotal}
          icon={Calendar}
          variant="info"
          delay={200}
        />
        <StatCard
          title="Monthly Total"
          value={stats.monthlyTotal}
          icon={CalendarDays}
          variant="default"
          delay={250}
        />
        <StatCard
          title="Current Balance"
          value={stats.currentBalance}
          icon={Wallet}
          variant="success"
          delay={300}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions
        onAddIncome={() => setIncomeDialogOpen(true)}
        onAddExpense={() => setExpenseDialogOpen(true)}
        onGenerateReport={handleGenerateReport}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <IncomeExpenseChart />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <CategoryPieChart type="income" />
          <CategoryPieChart type="expense" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6">
        <RecentTransactions />
      </div>

      {/* Dialogs */}
      <AddIncomeDialog
        open={incomeDialogOpen}
        onOpenChange={setIncomeDialogOpen}
      />
      <AddExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
