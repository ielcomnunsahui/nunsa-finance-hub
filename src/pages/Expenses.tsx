import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AddExpenseDialog } from '@/components/forms/AddExpenseDialog';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Plus, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Expenses: React.FC = () => {
  const { expenses, loading } = useFinanceData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = expenses.filter(
    (exp) =>
      (exp.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display">Expenses</h1>
            <p className="text-muted-foreground mt-1">Track and manage all expense entries</p>
          </div>
          <Button variant="gradient" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <div className="card-elevated p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No expense entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.slice(0, 20).map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                        {expense.category_name}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{expense.description || '-'}</TableCell>
                    <TableCell className="font-semibold text-destructive">
                      -₦{Number(expense.amount).toLocaleString('en-NG')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(expense.created_at), 'd MMM yyyy, HH:mm')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <AddExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </DashboardLayout>
  );
};

export default Expenses;
