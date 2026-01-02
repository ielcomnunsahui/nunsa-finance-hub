export type IncomeSource = 
  | 'printing_services'
  | 'table_water'
  | 'pure_water'
  | 'others';

export type ExpenseCategory = 
  | 'a4_paper'
  | 'spiral_front'
  | 'spiral_back'
  | 'spiral_slip'
  | 'stationeries'
  | 'bottle_water'
  | 'pure_water'
  | 'toner'
  | 'maintenance'
  | 'data_subscription'
  | 'others';

export interface Income {
  id: string;
  amount: number;
  source: IncomeSource;
  customSource?: string;
  receiptNumber: string;
  date: Date;
  createdBy: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  customCategory?: string;
  description: string;
  date: Date;
  attachmentUrl?: string;
  createdBy: string;
}

export interface DashboardStats {
  todayIncome: number;
  todayExpenses: number;
  weeklyTotal: number;
  monthlyTotal: number;
  currentBalance: number;
  incomeChange: number;
  expenseChange: number;
}

export interface CafeSettings {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  reportEmail: string;
  logoUrl?: string;
  autoReports: boolean;
}

export const incomeSourceLabels: Record<IncomeSource, string> = {
  printing_services: 'Printing Services',
  table_water: 'Table Water',
  pure_water: 'Pure Water',
  others: 'Others',
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  a4_paper: 'Purchase of A4 Paper',
  spiral_front: 'Spiral Binding (Front)',
  spiral_back: 'Spiral Binding (Back)',
  spiral_slip: 'Spiral Binding (Slip)',
  stationeries: 'Stationeries',
  bottle_water: 'Bottle Water',
  pure_water: 'Pure Water',
  toner: 'Toner',
  maintenance: 'Maintenance',
  data_subscription: 'Café Data Subscription',
  others: 'Others',
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NUNSA-${year}${month}${day}-${random}`;
};
