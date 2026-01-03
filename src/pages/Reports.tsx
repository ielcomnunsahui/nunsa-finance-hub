import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useFinanceData } from '@/hooks/useFinanceData';
import { generateReportPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Calendar, CalendarDays, RefreshCw, Loader2 } from 'lucide-react';
import { startOfMonth, startOfYear } from 'date-fns';

const Reports: React.FC = () => {
  const { income, expenses, settings, stats, loading } = useFinanceData();
  const { toast } = useToast();

  const handleGenerateReport = (type: 'monthly' | 'annual') => {
    const now = new Date();
    const startDate = type === 'monthly' ? startOfMonth(now) : startOfYear(now);
    const filteredIncome = income.filter(i => new Date(i.created_at) >= startDate);
    const filteredExpenses = expenses.filter(e => new Date(e.created_at) >= startDate);
    const totalIncome = filteredIncome.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    generateReportPDF({ income: filteredIncome, expenses: filteredExpenses, startDate, endDate: now, totalIncome, totalExpenses }, settings);
    toast({ title: 'Report Generated', description: `${type === 'monthly' ? 'Monthly' : 'Annual'} report downloaded.` });
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-display">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and download financial reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[{ title: 'Monthly Report', type: 'monthly' as const, icon: Calendar, income: stats.monthlyIncome, expenses: stats.monthlyExpenses },
            { title: 'Annual Report', type: 'annual' as const, icon: CalendarDays, income: stats.totalIncome, expenses: stats.totalExpenses }].map((report) => (
            <div key={report.type} className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <report.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold font-display">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">Download {report.type} summary</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-success/5 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Income</p>
                  <p className="font-semibold text-success">₦{report.income.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-destructive/5 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                  <p className="font-semibold text-destructive">₦{report.expenses.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-info/5 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Net</p>
                  <p className="font-semibold text-info">₦{(report.income - report.expenses).toLocaleString()}</p>
                </div>
              </div>
              <Button variant="gradient" onClick={() => handleGenerateReport(report.type)} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
