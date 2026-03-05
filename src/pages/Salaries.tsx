import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, Plus, TrendingUp, AlertCircle, CheckCircle2, Loader2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface SalaryRecord {
  id: string;
  user_id: string;
  user_name: string;
  month: number;
  year: number;
  monthly_income: number;
  salary_amount: number;
  salary_tier: string;
  is_paid: boolean;
  added_to_expenses: boolean;
  created_at: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getSalaryTier = (monthlyIncome: number): { amount: number; tier: string } => {
  if (monthlyIncome >= 100000) return { amount: 15000, tier: '₦100k+ income' };
  if (monthlyIncome >= 50000) return { amount: 10000, tier: '₦50k-99k income' };
  return { amount: 5000, tier: 'Below ₦50k income' };
};

const Salaries: React.FC = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Form state
  const [formUserName, setFormUserName] = useState('');
  const [formUserId, setFormUserId] = useState('');
  const [formMonth, setFormMonth] = useState((new Date().getMonth() + 1).toString());
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formIncome, setFormIncome] = useState('');
  const [formSalary, setFormSalary] = useState('');
  const [formIsPaid, setFormIsPaid] = useState(false);

  // Known active staff
  const [staffList, setStaffList] = useState<{ id: string; name: string; email: string }[]>([]);

  const fetchStaff = async () => {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email');
    if (profiles) {
      setStaffList(profiles.map(p => ({ id: p.id, name: p.full_name || p.email, email: p.email })));
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('salary_records')
      .select('*')
      .eq('year', selectedYear)
      .order('month', { ascending: false });

    if (error) {
      console.error('Error fetching salary records:', error);
    } else {
      setRecords((data as SalaryRecord[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedYear]);

  const handleIncomeChange = (value: string) => {
    setFormIncome(value);
    const income = parseFloat(value) || 0;
    const { amount } = getSalaryTier(income);
    setFormSalary(amount.toString());
  };

  const handleAddRecord = async () => {
    if (!formUserName || !formMonth || !formYear || !formSalary) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('salary_records').insert({
        user_id: formUserId || '00000000-0000-0000-0000-000000000000',
        user_name: formUserName,
        month: parseInt(formMonth),
        year: parseInt(formYear),
        monthly_income: parseFloat(formIncome) || 0,
        salary_amount: parseFloat(formSalary),
        salary_tier: getSalaryTier(parseFloat(formIncome) || 0).tier,
        is_paid: formIsPaid,
      });

      if (error) throw error;

      await supabase.rpc('log_audit_action', {
        _action_type: 'salary_recorded',
        _details: { user_name: formUserName, month: formMonth, year: formYear, amount: formSalary },
      });

      toast({ title: 'Salary Record Added' });
      setDialogOpen(false);
      resetForm();
      fetchRecords();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (record: SalaryRecord) => {
    try {
      const { error } = await supabase
        .from('salary_records')
        .update({ is_paid: true })
        .eq('id', record.id);

      if (error) throw error;
      toast({ title: 'Marked as Paid' });
      fetchRecords();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddToExpenses = async (record: SalaryRecord) => {
    try {
      // First get or create a "Salaries" expense category
      let { data: categories } = await supabase
        .from('expense_categories')
        .select('id')
        .eq('name', 'Salaries')
        .maybeSingle();

      let categoryId = categories?.id;
      if (!categoryId) {
        const { data: newCat, error: catErr } = await supabase
          .from('expense_categories')
          .insert({ name: 'Salaries' })
          .select('id')
          .single();
        if (catErr) throw catErr;
        categoryId = newCat.id;
      }

      // Add as expense
      const { data: expense, error: expErr } = await supabase
        .from('expenses')
        .insert({
          amount: record.salary_amount,
          category_id: categoryId,
          description: `Salary: ${record.user_name} - ${MONTHS[record.month - 1]} ${record.year}`,
          recorded_by: user!.id,
        })
        .select('id')
        .single();

      if (expErr) throw expErr;

      // Mark as added to expenses
      await supabase
        .from('salary_records')
        .update({ added_to_expenses: true, is_paid: true, expense_id: expense.id })
        .eq('id', record.id);

      await supabase.rpc('log_audit_action', {
        _action_type: 'salary_expensed',
        _details: { user_name: record.user_name, amount: record.salary_amount, month: record.month, year: record.year },
      });

      toast({ title: 'Added to Expenses', description: `₦${record.salary_amount.toLocaleString()} salary added as expense` });
      fetchRecords();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormUserName('');
    setFormUserId('');
    setFormMonth((new Date().getMonth() + 1).toString());
    setFormYear(new Date().getFullYear().toString());
    setFormIncome('');
    setFormSalary('');
    setFormIsPaid(false);
  };

  const totalSalaries = records.reduce((sum, r) => sum + Number(r.salary_amount), 0);
  const paidSalaries = records.filter(r => r.is_paid).reduce((sum, r) => sum + Number(r.salary_amount), 0);
  const unpaidSalaries = totalSalaries - paidSalaries;
  const isAdmin = role === 'super_admin' || role === 'admin';

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Salaries</h1>
              <p className="text-muted-foreground">Track staff salary payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gradient" onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Salary Record
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Salary Record</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Staff Member</Label>
                      <Select
                        value={formUserId}
                        onValueChange={(v) => {
                          setFormUserId(v);
                          const staff = staffList.find(s => s.id === v);
                          if (staff) setFormUserName(staff.name);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff or type below" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffList.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="mt-2"
                        placeholder="Or type name manually"
                        value={formUserName}
                        onChange={(e) => setFormUserName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Month</Label>
                        <Select value={formMonth} onValueChange={setFormMonth}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MONTHS.map((m, i) => (
                              <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Year</Label>
                        <Select value={formYear} onValueChange={setFormYear}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map(y => (
                              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Monthly Income Generated (₦)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 100000"
                        value={formIncome}
                        onChange={(e) => handleIncomeChange(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Salary tiers: ≥₦100k → ₦15,000 | ≥₦50k → ₦10,000 | &lt;₦50k → ₦5,000
                      </p>
                    </div>
                    <div>
                      <Label>Salary Amount (₦)</Label>
                      <Input
                        type="number"
                        value={formSalary}
                        onChange={(e) => setFormSalary(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPaid"
                        checked={formIsPaid}
                        onChange={(e) => setFormIsPaid(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="isPaid">Already paid</Label>
                    </div>
                    <Button onClick={handleAddRecord} disabled={saving} className="w-full" variant="gradient">
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                      Add Record
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Salaries ({selectedYear})</p>
                  <p className="text-2xl font-bold">₦{totalSalaries.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold text-green-600">₦{paidSalaries.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unpaid</p>
                  <p className="text-2xl font-bold text-amber-600">₦{unpaidSalaries.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Tier Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Salary Structure
            </CardTitle>
            <CardDescription>Salary is based on monthly income generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <p className="font-semibold text-green-700 dark:text-green-400">₦15,000/month</p>
                <p className="text-sm text-muted-foreground">Income ≥ ₦100,000</p>
              </div>
              <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-700 dark:text-blue-400">₦10,000/month</p>
                <p className="text-sm text-muted-foreground">Income ₦50,000 – ₦99,999</p>
              </div>
              <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <p className="font-semibold text-amber-700 dark:text-amber-400">₦5,000/month</p>
                <p className="text-sm text-muted-foreground">Income &lt; ₦50,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Salary Records — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No salary records for {selectedYear}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.user_name}</TableCell>
                        <TableCell>{MONTHS[record.month - 1]}</TableCell>
                        <TableCell>₦{Number(record.monthly_income).toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">₦{Number(record.salary_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{record.salary_tier}</Badge>
                        </TableCell>
                        <TableCell>
                          {record.added_to_expenses ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Expensed
                            </Badge>
                          ) : record.is_paid ? (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Paid
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex gap-2">
                              {!record.is_paid && (
                                <Button size="sm" variant="outline" onClick={() => handleMarkPaid(record)}>
                                  Mark Paid
                                </Button>
                              )}
                              {!record.added_to_expenses && (
                                <Button size="sm" variant="default" onClick={() => handleAddToExpenses(record)}>
                                  Add to Expenses
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Salaries;
