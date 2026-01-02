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
import { AddIncomeDialog } from '@/components/forms/AddIncomeDialog';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, incomeSourceLabels } from '@/types/finance';
import { Plus, Search, Download, Receipt } from 'lucide-react';

const Income: React.FC = () => {
  const { incomes } = useFinance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIncomes = incomes.filter(
    (inc) =>
      inc.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incomeSourceLabels[inc.source].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display">Income</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all income entries
            </p>
          </div>
          <Button variant="gradient" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Income
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="card-elevated p-4 opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt number or source..."
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
                <TableHead>Receipt #</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No income entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncomes.slice(0, 20).map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="font-mono text-sm">
                      {income.receiptNumber}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        {incomeSourceLabels[income.source]}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-success">
                      {formatCurrency(income.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(income.date).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Receipt className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddIncomeDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </DashboardLayout>
  );
};

export default Income;
