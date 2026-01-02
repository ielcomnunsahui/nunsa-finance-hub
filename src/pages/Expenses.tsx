import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddExpenseDialog } from '@/components/forms/AddExpenseDialog';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, expenseCategoryLabels } from '@/types/finance';
import { Plus, Search, Download } from 'lucide-react';

const Expenses: React.FC = () => {
  const { expenses } = useFinance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expenseCategoryLabels[exp.category].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display">Expenses</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all expense entries
            </p>
          </div>
          <Button variant="destructive" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="card-elevated p-4 opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
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
                        {expenseCategoryLabels[expense.category]}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell className="font-semibold text-destructive">
                      -{formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
