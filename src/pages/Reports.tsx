import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/types/finance';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Download,
  Mail,
  MessageCircle,
  Calendar,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';

const Reports: React.FC = () => {
  const { stats, incomes, expenses, settings } = useFinance();
  const { toast } = useToast();

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleGenerateReport = (type: 'monthly' | 'annual') => {
    toast({
      title: 'Report Generated',
      description: `${type === 'monthly' ? 'Monthly' : 'Annual'} report has been generated successfully.`,
    });
  };

  const handleShareReport = (method: 'email' | 'whatsapp') => {
    toast({
      title: 'Share Report',
      description: `Report sharing via ${method === 'email' ? 'email' : 'WhatsApp'} will be available soon.`,
    });
  };

  const reportCards = [
    {
      title: 'Monthly Report',
      description: 'Detailed financial summary for the current month',
      icon: Calendar,
      period: 'January 2026',
      income: stats.monthlyTotal > 0 ? stats.monthlyTotal + stats.todayExpenses : 0,
      expenses: Math.abs(stats.monthlyTotal - stats.weeklyTotal),
    },
    {
      title: 'Annual Report',
      description: 'Complete yearly financial overview',
      icon: CalendarDays,
      period: '2025 - 2026',
      income: totalIncome,
      expenses: totalExpenses,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold font-display">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and share financial reports
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportCards.map((report, index) => (
            <div
              key={report.title}
              className="card-elevated p-6 opacity-0 animate-slide-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <report.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-display">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                  {report.period}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-success/5 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Income</p>
                  <p className="font-semibold text-success">
                    {formatCurrency(report.income)}
                  </p>
                </div>
                <div className="text-center p-3 bg-destructive/5 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                  <p className="font-semibold text-destructive">
                    {formatCurrency(report.expenses)}
                  </p>
                </div>
                <div className="text-center p-3 bg-info/5 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Net</p>
                  <p className="font-semibold text-info">
                    {formatCurrency(report.income - report.expenses)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => handleGenerateReport(index === 0 ? 'monthly' : 'annual')}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Generate
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShareReport('email')}>
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShareReport('whatsapp')}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Auto Report Settings */}
        <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold font-display">Automatic Reports</h3>
              <p className="text-sm text-muted-foreground">
                Reports are automatically sent to {settings.reportEmail}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium">Monthly Report</p>
              <p className="text-sm text-muted-foreground">
                Sent on the 1st of every month
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="font-semibold font-display mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {['December 2025', 'November 2025', 'October 2025'].map((month, index) => (
              <div
                key={month}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Monthly Report - {month}</p>
                    <p className="text-xs text-muted-foreground">
                      Generated automatically
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
