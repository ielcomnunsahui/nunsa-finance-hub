import React from 'react';
import { Plus, Minus, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onGenerateReport: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddIncome,
  onAddExpense,
  onGenerateReport,
}) => {
  return (
    <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold font-display">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Manage finances instantly</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Button
          variant="gradient"
          className="h-auto py-4 flex-col gap-2"
          onClick={onAddIncome}
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs">Add Income</span>
        </Button>
        <Button
          variant="destructive"
          className="h-auto py-4 flex-col gap-2"
          onClick={onAddExpense}
        >
          <Minus className="h-5 w-5" />
          <span className="text-xs">Add Expense</span>
        </Button>
        <Button
          variant="info"
          className="h-auto py-4 flex-col gap-2"
          onClick={onGenerateReport}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs">Generate Report</span>
        </Button>
        <Button
          variant="secondary"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => {}}
        >
          <Download className="h-5 w-5" />
          <span className="text-xs">Download Receipt</span>
        </Button>
      </div>
    </div>
  );
};
