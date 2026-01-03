import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const RecentTransactions: React.FC = () => {
  const { income, expenses } = useFinanceData();

  // Combine and sort transactions
  const transactions = [
    ...income.slice(0, 5).map(inc => ({
      id: inc.id,
      type: 'income' as const,
      amount: Number(inc.amount),
      label: inc.category_name || 'Income',
      date: new Date(inc.created_at),
      receiptNumber: inc.receipt_number,
    })),
    ...expenses.slice(0, 5).map(exp => ({
      id: exp.id,
      type: 'expense' as const,
      amount: Number(exp.amount),
      label: exp.category_name || 'Expense',
      date: new Date(exp.created_at),
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '500ms' }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold font-display">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">Latest financial activity</p>
      </div>
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No transactions yet
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg transition-colors',
                'hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    tx.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                  )}
                >
                  {tx.type === 'income' ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{tx.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(tx.date, 'd MMM, HH:mm')}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'font-semibold text-sm',
                  tx.type === 'income' ? 'text-success' : 'text-destructive'
                )}
              >
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
