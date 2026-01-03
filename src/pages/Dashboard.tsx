import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AddIncomeDialog } from '@/components/forms/AddIncomeDialog';
import { AddExpenseDialog } from '@/components/forms/AddExpenseDialog';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useToast } from '@/hooks/use-toast';
import { generateReportPDF } from '@/lib/pdfGenerator';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CalendarDays,
  Wallet,
  Loader2,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { stats, income, expenses, settings, loading } = useFinanceData();
  const { toast } = useToast();
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const handleGenerateReport = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    generateReportPDF({
      income,
      expenses,
      startDate: monthStart,
      endDate: now,
      totalIncome: stats.monthlyIncome,
      totalExpenses: stats.monthlyExpenses,
    }, settings);
    
    toast({
      title: 'Report Generated',
      description: 'Monthly financial report has been downloaded.',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
          icon={TrendingUp}
          variant="success"
          delay={100}
        />
        <StatCard
          title="Today's Expenses"
          value={stats.todayExpenses}
          icon={TrendingDown}
          variant="warning"
          delay={150}
        />
        <StatCard
          title="Weekly Income"
          value={stats.weeklyIncome}
          icon={Calendar}
          variant="info"
          delay={200}
        />
        <StatCard
          title="Monthly Income"
          value={stats.monthlyIncome}
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
