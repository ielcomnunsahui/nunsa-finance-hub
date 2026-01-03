import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Building2, Mail, Phone, MessageCircle, FileText, Save, Loader2 } from 'lucide-react';

const settingsSchema = z.object({
  cafe_name: z.string().min(1, 'Required'),
  address: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  whatsapp: z.string().optional(),
  email: z.string().email(),
  report_recipient_email: z.string().email(),
  auto_reports_enabled: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const Settings: React.FC = () => {
  const { settings, updateSettings, loading } = useFinanceData();
  const { toast } = useToast();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { cafe_name: '', address: '', phone: '', whatsapp: '', email: '', report_recipient_email: '', auto_reports_enabled: true },
  });

  useEffect(() => {
    if (settings) form.reset(settings);
  }, [settings, form]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateSettings(data);
      toast({ title: 'Settings Saved' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-primary/10"><SettingsIcon className="h-6 w-6 text-primary" /></div><div><h1 className="text-2xl font-bold font-display">Settings</h1><p className="text-muted-foreground">Manage café details</p></div></div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4"><Building2 className="h-5 w-5 text-primary" /><h2 className="font-semibold">Café Details</h2></div>
              <div className="space-y-4">
                <FormField control={form.control} name="cafe_name" render={({ field }) => (<FormItem><FormLabel>Café Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </div>
            <div className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4"><Phone className="h-5 w-5 text-primary" /><h2 className="font-semibold">Contact</h2></div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="whatsapp" render={({ field }) => (<FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem className="mt-4"><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            </div>
            <div className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4"><FileText className="h-5 w-5 text-primary" /><h2 className="font-semibold">Reports</h2></div>
              <FormField control={form.control} name="report_recipient_email" render={({ field }) => (<FormItem><FormLabel>Report Email</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="auto_reports_enabled" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-4 mt-4"><div><FormLabel>Auto Reports</FormLabel><FormDescription>Send monthly reports automatically</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
            </div>
            <Button type="submit" variant="gradient"><Save className="h-4 w-4 mr-2" />Save Settings</Button>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
