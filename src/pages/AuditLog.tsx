import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Shield, Plus, Minus, FileText, Settings, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AuditEntry {
  id: string;
  action_type: string;
  user_email: string;
  details: any;
  created_at: string;
}

const actionConfig: Record<string, { icon: any; label: string; color: string }> = {
  income_added: { icon: Plus, label: 'Income Added', color: 'text-success bg-success/10' },
  expense_added: { icon: Minus, label: 'Expense Added', color: 'text-destructive bg-destructive/10' },
  report_generated: { icon: FileText, label: 'Report Generated', color: 'text-info bg-info/10' },
  settings_updated: { icon: Settings, label: 'Settings Changed', color: 'text-warning bg-warning/10' },
};

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (data) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (entry) =>
      entry.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action_type.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display">Audit Log</h1>
            <p className="text-muted-foreground">Immutable record of all financial actions</p>
          </div>
        </div>

        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <p className="font-medium text-info">Read-Only Audit Trail</p>
          <p className="text-sm text-muted-foreground">This log cannot be edited or deleted.</p>
        </div>

        <div className="card-elevated p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No audit entries found</TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((entry) => {
                  const config = actionConfig[entry.action_type] || { icon: FileText, label: entry.action_type, color: 'text-muted-foreground bg-muted' };
                  const Icon = config.icon;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn('p-1.5 rounded-lg', config.color)}><Icon className="h-3.5 w-3.5" /></div>
                          <span className="text-sm font-medium">{config.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{entry.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground truncate">
                        {entry.details ? JSON.stringify(entry.details).slice(0, 50) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), 'd MMM yyyy, HH:mm:ss')}
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
