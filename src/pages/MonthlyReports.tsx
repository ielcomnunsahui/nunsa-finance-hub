import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useAuth } from '@/hooks/useAuth';
import { generateMonthlyReportPDF, generateMonthlySalaryReportPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Mail, Calendar, Users, Loader2, Send } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, getMonth, getYear } from 'date-fns';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface UserSalaryData {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  monthly_income: number;
  estimated_salary: number;
}

const MonthlyReports: React.FC = () => {
  const { income, expenses, settings, loading } = useFinanceData();
  const { role } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'M'));
  const [selectedYear, setSelectedYear] = useState<string>(format(new Date(), 'yyyy'));
  const [sendingEmail, setSendingEmail] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const getMonthData = () => {
    const monthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthIncome = income.filter(i => {
      const date = new Date(i.created_at);
      return date >= monthStart && date <= monthEnd;
    });
    
    const monthExpenses = expenses.filter(e => {
      const date = new Date(e.created_at);
      return date >= monthStart && date <= monthEnd;
    });
    
    const totalIncome = monthIncome.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    
    return { monthIncome, monthExpenses, totalIncome, totalExpenses, monthStart, monthEnd };
  };

  const handleDownloadFinancialReport = () => {
    const { monthIncome, monthExpenses, totalIncome, totalExpenses, monthStart, monthEnd } = getMonthData();
    generateMonthlyReportPDF(
      { income: monthIncome, expenses: monthExpenses, startDate: monthStart, endDate: monthEnd, totalIncome, totalExpenses },
      settings,
      MONTHS[parseInt(selectedMonth) - 1],
      parseInt(selectedYear)
    );
    toast({ title: 'Report Downloaded', description: `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear} financial report downloaded.` });
  };

  const handleDownloadSalaryReport = async () => {
    const monthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    // Fetch user salary data for the selected month
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('*');
    const { data: allIncome } = await supabase.from('income').select('*');
    
    if (!profiles) return;
    
    const salaryPercentage = settings?.salary_percentage || 5;
    
    const usersWithSalary: UserSalaryData[] = profiles.map(profile => {
      const userRole = roles?.find(r => r.user_id === profile.id);
      const userMonthlyIncome = allIncome
        ?.filter(i => {
          const date = new Date(i.created_at);
          return i.recorded_by === profile.id && date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, i) => sum + Number(i.amount), 0) || 0;
      
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: userRole?.role || null,
        monthly_income: userMonthlyIncome,
        estimated_salary: userMonthlyIncome * (salaryPercentage / 100),
      };
    });
    
    generateMonthlySalaryReportPDF(usersWithSalary, salaryPercentage, settings, MONTHS[parseInt(selectedMonth) - 1], parseInt(selectedYear));
    toast({ title: 'Salary Report Downloaded', description: `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear} salary report downloaded.` });
  };

  const handleSendEmailReport = async () => {
    setSendingEmail(true);
    try {
      const { monthIncome, monthExpenses, totalIncome, totalExpenses, monthStart, monthEnd } = getMonthData();
      
      const response = await supabase.functions.invoke('send-monthly-report', {
        body: {
          month: MONTHS[parseInt(selectedMonth) - 1],
          year: parseInt(selectedYear),
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          incomeCount: monthIncome.length,
          expenseCount: monthExpenses.length,
          recipientEmail: settings?.report_recipient_email || 'nunsahui@gmail.com',
        },
      });
      
      if (response.error) throw response.error;
      
      toast({ title: 'Email Sent', description: `Monthly report sent to ${settings?.report_recipient_email || 'nunsahui@gmail.com'}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send email', variant: 'destructive' });
    } finally {
      setSendingEmail(false);
    }
  };

  const { totalIncome, totalExpenses } = getMonthData();

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
          <h1 className="text-2xl lg:text-3xl font-bold font-display">Monthly Reports</h1>
          <p className="text-muted-foreground mt-1">Download individual monthly financial and salary reports</p>
        </div>

        {/* Month/Year Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Select Report Period
            </CardTitle>
            <CardDescription>Choose the month and year for your report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={month} value={String(index + 1)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary for Selected Month */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-success/5 border-success/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-success">₦{totalIncome.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">₦{totalExpenses.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-info/5 border-info/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p className="text-2xl font-bold text-info">₦{(totalIncome - totalExpenses).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Report */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Financial Report</CardTitle>
                  <CardDescription>Income & expenses for {MONTHS[parseInt(selectedMonth) - 1]} {selectedYear}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="gradient" onClick={handleDownloadFinancialReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {(role === 'super_admin' || role === 'admin') && (
                <Button 
                  variant="outline" 
                  onClick={handleSendEmailReport} 
                  className="w-full"
                  disabled={sendingEmail}
                >
                  {sendingEmail ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send via Email
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Salary Report */}
          {(role === 'super_admin' || role === 'admin') && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle>Salary Report</CardTitle>
                    <CardDescription>Staff salaries for {MONTHS[parseInt(selectedMonth) - 1]} {selectedYear}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="gradient" onClick={handleDownloadSalaryReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Salary PDF
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Salary calculated at {settings?.salary_percentage || 5}% of income generated
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MonthlyReports;
