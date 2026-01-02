import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFinance } from '@/contexts/FinanceContext';
import { useToast } from '@/hooks/use-toast';
import {
  Settings as SettingsIcon,
  Building2,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  Save,
} from 'lucide-react';

const settingsSchema = z.object({
  name: z.string().min(1, 'Café name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  whatsapp: z.string().min(1, 'WhatsApp number is required'),
  email: z.string().email('Invalid email address'),
  reportEmail: z.string().email('Invalid email address'),
  autoReports: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const Settings: React.FC = () => {
  const { settings, updateSettings } = useFinance();
  const { toast } = useToast();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const onSubmit = (data: SettingsFormData) => {
    updateSettings(data);
    toast({
      title: 'Settings Saved',
      description: 'Your café settings have been updated successfully.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 opacity-0 animate-fade-in">
          <div className="p-3 rounded-xl bg-primary/10">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage café details and preferences
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Café Details */}
            <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold font-display">Café Details</h2>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Café Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="NUNSA HUI Café" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Al-Hikmah University, Ilorin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <Phone className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold font-display">Contact Information</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} className="pl-10" placeholder="+234 800 000 0000" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} className="pl-10" placeholder="+234 800 000 0000" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Official Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} className="pl-10" placeholder="nunsahui@gmail.com" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Report Settings */}
            <div className="card-elevated p-6 opacity-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold font-display">Report Settings</h2>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="reportEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Recipient Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} className="pl-10" placeholder="nunsahui@gmail.com" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Automatic reports will be sent to this email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoReports"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Automatic Reports</FormLabel>
                        <FormDescription>
                          Send monthly and annual reports automatically
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Save Button */}
            <Button type="submit" variant="gradient" size="lg" className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
