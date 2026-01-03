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
import { useFinanceData } from '@/hooks/useFinanceData';
import { useAuth } from '@/hooks/useAuth';
import { generateReceiptPDF } from '@/lib/pdfGenerator';
import { Plus, Search, Download, Receipt, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Income: React.FC = () => {
  const { income, settings, loading } = useFinanceData();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIncomes = income.filter(
    (inc) =>
      inc.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadReceipt = (inc: typeof income[0]) => {
    generateReceiptPDF({
      receiptNumber: inc.receipt_number,
      amount: Number(inc.amount),
      category: inc.category_name || 'Unknown',
      description: inc.description || undefined,
      date: new Date(inc.created_at),
      recordedBy: user?.email || 'Unknown',
    }, settings);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display">Income</h1>
            <p className="text-muted-foreground mt-1">Manage and track all income entries</p>
          </div>
          <Button variant="gradient" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Income
          </Button>
        </div>

        <div className="card-elevated p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by receipt number or source..."
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
                filteredIncomes.slice(0, 20).map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-mono text-sm">{inc.receipt_number}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        {inc.category_name}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-success">
                      ₦{Number(inc.amount).toLocaleString('en-NG')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(inc.created_at), 'd MMM yyyy, HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(inc)}>
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
