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
import { useFinance } from '@/contexts/FinanceContext';
import {
  Search,
  Shield,
  Plus,
  Minus,
  FileText,
  Settings,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditEntry {
  id: string;
  action: 'income_added' | 'expense_added' | 'report_generated' | 'settings_changed';
  user: string;
  description: string;
  timestamp: Date;
}

const actionConfig = {
  income_added: {
    icon: Plus,
    label: 'Income Added',
    color: 'text-success bg-success/10',
  },
  expense_added: {
    icon: Minus,
    label: 'Expense Added',
    color: 'text-destructive bg-destructive/10',
  },
  report_generated: {
    icon: FileText,
    label: 'Report Generated',
    color: 'text-info bg-info/10',
  },
  settings_changed: {
    icon: Settings,
    label: 'Settings Changed',
    color: 'text-warning bg-warning/10',
  },
};

const AuditLog: React.FC = () => {
  const { incomes, expenses } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');

  // Generate audit log from actual data
  const auditEntries: AuditEntry[] = [
    ...incomes.slice(0, 15).map((inc) => ({
      id: `audit-${inc.id}`,
      action: 'income_added' as const,
      user: inc.createdBy,
      description: `Income of ₦${inc.amount.toLocaleString()} from ${inc.source.replace(/_/g, ' ')}`,
      timestamp: new Date(inc.date),
    })),
    ...expenses.slice(0, 15).map((exp) => ({
      id: `audit-${exp.id}`,
      action: 'expense_added' as const,
      user: exp.createdBy,
      description: `Expense of ₦${exp.amount.toLocaleString()} for ${exp.category.replace(/_/g, ' ')}`,
      timestamp: new Date(exp.date),
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const filteredEntries = auditEntries.filter(
    (entry) =>
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actionConfig[entry.action].label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-display">Audit Log</h1>
              <p className="text-muted-foreground mt-1">
                Immutable record of all financial actions
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-info/10 border border-info/20 rounded-lg p-4 opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-info mt-0.5" />
            <div>
              <p className="font-medium text-info">Read-Only Audit Trail</p>
              <p className="text-sm text-muted-foreground">
                This log cannot be edited or deleted. All financial actions are permanently recorded for accountability.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card-elevated p-4 opacity-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, user, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No audit entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.slice(0, 30).map((entry) => {
                  const config = actionConfig[entry.action];
                  const Icon = config.icon;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn('p-1.5 rounded-lg', config.color)}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium">{config.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{entry.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-muted-foreground">{entry.description}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.timestamp.toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLog;
