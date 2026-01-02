import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';
import { useToast } from '@/hooks/use-toast';
import { IncomeSource, incomeSourceLabels, generateReceiptNumber } from '@/types/finance';
import { Check, Receipt } from 'lucide-react';

const incomeSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  source: z.enum(['printing_services', 'table_water', 'pure_water', 'others']),
  customSource: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddIncomeDialog: React.FC<AddIncomeDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addIncome } = useFinance();
  const { toast } = useToast();
  const [receiptNumber] = useState(generateReceiptNumber());

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: '',
      source: 'printing_services',
      customSource: '',
    },
  });

  const watchSource = form.watch('source');

  const onSubmit = (data: IncomeFormData) => {
    addIncome({
      amount: Number(data.amount),
      source: data.source as IncomeSource,
      customSource: data.source === 'others' ? data.customSource : undefined,
      receiptNumber,
      date: new Date(),
      createdBy: 'admin@nunsa.edu.ng',
    });

    toast({
      title: 'Income Added Successfully',
      description: `Receipt #${receiptNumber} has been generated.`,
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="p-2 rounded-lg bg-success/10">
              <Receipt className="h-5 w-5 text-success" />
            </div>
            Add Income
          </DialogTitle>
          <DialogDescription>
            Record a new income entry. A receipt will be automatically generated.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-muted-foreground">Receipt Number</p>
          <p className="font-mono font-semibold text-primary">{receiptNumber}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₦)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₦
                      </span>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source of Income</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(incomeSourceLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchSource === 'others' && (
              <FormField
                control={form.control}
                name="customSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Source</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter custom source" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
