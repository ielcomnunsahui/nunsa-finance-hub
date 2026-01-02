import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, incomeSourceLabels, expenseCategoryLabels } from '@/types/finance';
import { cn } from '@/lib/utils';

export const RecentTransactions: React.FC = () => {
  const { incomes, expenses } = useFinance();

  // Combine and sort transactions
  const transactions = [
    ...incomes.slice(0, 5).map(inc => ({
      id: inc.id,
      type: 'income' as const,
      amount: inc.amount,
      label: incomeSourceLabels[inc.source],
      date: new Date(inc.date),
      receiptNumber: inc.receiptNumber,
    })),
    ...expenses.slice(0, 5).map(exp => ({
      id: exp.id,
      type: 'expense' as const,
      amount: exp.amount,
      label: expenseCategoryLabels[exp.category],
      date: new Date(exp.date),
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  return (
    <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '500ms' }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold font-display">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">Latest financial activity</p>
      </div>
      <div className="space-y-3">
        {transactions.map((tx, index) => (
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
                  {tx.date.toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
    </div>
  );
};
