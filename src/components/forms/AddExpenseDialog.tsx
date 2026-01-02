import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';
import { useToast } from '@/hooks/use-toast';
import { ExpenseCategory, expenseCategoryLabels } from '@/types/finance';
import { Check, Receipt } from 'lucide-react';

const expenseSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  category: z.enum([
    'a4_paper',
    'spiral_front',
    'spiral_back',
    'spiral_slip',
    'stationeries',
    'bottle_water',
    'pure_water',
    'toner',
    'maintenance',
    'data_subscription',
    'others',
  ]),
  customCategory: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addExpense } = useFinance();
  const { toast } = useToast();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: '',
      category: 'a4_paper',
      customCategory: '',
      description: '',
    },
  });

  const watchCategory = form.watch('category');

  const onSubmit = (data: ExpenseFormData) => {
    addExpense({
      amount: Number(data.amount),
      category: data.category as ExpenseCategory,
      customCategory: data.category === 'others' ? data.customCategory : undefined,
      description: data.description,
      date: new Date(),
      createdBy: 'admin@nunsa.edu.ng',
    });

    toast({
      title: 'Expense Recorded',
      description: 'The expense has been added to the records.',
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Receipt className="h-5 w-5 text-destructive" />
            </div>
            Add Expense
          </DialogTitle>
          <DialogDescription>
            Record a new expense entry for the café.
          </DialogDescription>
        </DialogHeader>

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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(expenseCategoryLabels).map(([value, label]) => (
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

            {watchCategory === 'others' && (
              <FormField
                control={form.control}
                name="customCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Category</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter custom category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of the expense"
                      rows={3}
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
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
