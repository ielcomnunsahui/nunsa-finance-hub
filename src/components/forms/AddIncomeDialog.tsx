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
import { Textarea } from '@/components/ui/textarea';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { generateReceiptPDF } from '@/lib/pdfGenerator';
import { Check, Receipt, Download, Loader2 } from 'lucide-react';

const incomeSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
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
  const { addIncome, incomeCategories, settings } = useFinanceData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    receiptNumber: string;
    amount: number;
    category: string;
    description?: string;
  } | null>(null);

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: '',
      categoryId: '',
      description: '',
    },
  });

  const onSubmit = async (data: IncomeFormData) => {
    setSubmitting(true);
    try {
      const result = await addIncome(
        Number(data.amount),
        data.categoryId,
        data.description
      );

      if (result) {
        const category = incomeCategories.find(c => c.id === data.categoryId);
        setLastReceipt({
          receiptNumber: result.receipt_number,
          amount: Number(data.amount),
          category: category?.name || 'Unknown',
          description: data.description,
        });

        toast({
          title: 'Income Added Successfully',
          description: `Receipt #${result.receipt_number} has been generated.`,
        });

        form.reset();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add income',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (lastReceipt) {
      generateReceiptPDF({
        receiptNumber: lastReceipt.receiptNumber,
        amount: lastReceipt.amount,
        category: lastReceipt.category,
        description: lastReceipt.description,
        date: new Date(),
        recordedBy: user?.email || 'Unknown',
      }, settings);
    }
  };

  const handleClose = () => {
    setLastReceipt(null);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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

        {lastReceipt ? (
          <div className="space-y-4">
            <div className="bg-success/10 rounded-lg p-4 text-center">
              <Check className="h-12 w-12 text-success mx-auto mb-2" />
              <h3 className="font-semibold text-lg">Income Recorded!</h3>
              <p className="text-sm text-muted-foreground">
                Receipt #{lastReceipt.receiptNumber}
              </p>
              <p className="text-2xl font-bold text-success mt-2">
                ₦{lastReceipt.amount.toLocaleString('en-NG')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadReceipt}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={() => setLastReceipt(null)}
              >
                Add Another
              </Button>
            </div>
          </div>
        ) : (
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source of Income</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {incomeCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add any additional notes..."
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Add Income
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
