import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Income, Expense, DashboardStats, CafeSettings } from '@/types/finance';

interface FinanceContextType {
  incomes: Income[];
  expenses: Expense[];
  stats: DashboardStats;
  settings: CafeSettings;
  addIncome: (income: Omit<Income, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateSettings: (settings: Partial<CafeSettings>) => void;
  getMonthlyData: () => { month: string; income: number; expense: number }[];
  getCategoryBreakdown: (type: 'income' | 'expense') => { name: string; value: number; color: string }[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Demo data for initial load
const generateDemoData = () => {
  const now = new Date();
  const incomes: Income[] = [];
  const expenses: Expense[] = [];

  // Generate last 30 days of demo data
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Random incomes per day (1-4)
    const incomeCount = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < incomeCount; j++) {
      const sources: Income['source'][] = ['printing_services', 'table_water', 'pure_water', 'others'];
      incomes.push({
        id: `inc-${i}-${j}`,
        amount: Math.floor(Math.random() * 5000) + 500,
        source: sources[Math.floor(Math.random() * sources.length)],
        receiptNumber: `NUNSA-${date.toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        date: new Date(date),
        createdBy: 'demo@nunsa.edu.ng',
      });
    }

    // Random expenses per day (0-2)
    const expenseCount = Math.floor(Math.random() * 3);
    for (let j = 0; j < expenseCount; j++) {
      const categories: Expense['category'][] = ['a4_paper', 'spiral_front', 'toner', 'maintenance', 'stationeries'];
      expenses.push({
        id: `exp-${i}-${j}`,
        amount: Math.floor(Math.random() * 8000) + 1000,
        category: categories[Math.floor(Math.random() * categories.length)],
        description: 'Regular purchase',
        date: new Date(date),
        createdBy: 'demo@nunsa.edu.ng',
      });
    }
  }

  return { incomes, expenses };
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<CafeSettings>({
    name: 'NUNSA HUI Café',
    address: 'Al-Hikmah University, Ilorin, Kwara State',
    phone: '+234 800 000 0000',
    whatsapp: '+234 800 000 0000',
    email: 'nunsahui@gmail.com',
    reportEmail: 'nunsahui@gmail.com',
    autoReports: true,
  });

  useEffect(() => {
    // Load demo data on mount
    const { incomes: demoIncomes, expenses: demoExpenses } = generateDemoData();
    setIncomes(demoIncomes);
    setExpenses(demoExpenses);
  }, []);

  const calculateStats = (): DashboardStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const todayIncome = incomes
      .filter(i => new Date(i.date) >= today)
      .reduce((sum, i) => sum + i.amount, 0);

    const todayExpenses = expenses
      .filter(e => new Date(e.date) >= today)
      .reduce((sum, e) => sum + e.amount, 0);

    const weeklyIncome = incomes
      .filter(i => new Date(i.date) >= weekAgo)
      .reduce((sum, i) => sum + i.amount, 0);

    const weeklyExpenses = expenses
      .filter(e => new Date(e.date) >= weekAgo)
      .reduce((sum, e) => sum + e.amount, 0);

    const monthlyIncome = incomes
      .filter(i => new Date(i.date) >= monthAgo)
      .reduce((sum, i) => sum + i.amount, 0);

    const monthlyExpenses = expenses
      .filter(e => new Date(e.date) >= monthAgo)
      .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      todayIncome,
      todayExpenses,
      weeklyTotal: weeklyIncome - weeklyExpenses,
      monthlyTotal: monthlyIncome - monthlyExpenses,
      currentBalance: totalIncome - totalExpenses,
      incomeChange: 12.5, // Demo percentage
      expenseChange: -8.3, // Demo percentage
    };
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      ...income,
      id: `inc-${Date.now()}`,
    };
    setIncomes(prev => [newIncome, ...prev]);
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateSettings = (newSettings: Partial<CafeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getMonthlyData = () => {
    const months: { month: string; income: number; expense: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthIncome = incomes
        .filter(inc => {
          const incDate = new Date(inc.date);
          return incDate >= date && incDate <= monthEnd;
        })
        .reduce((sum, inc) => sum + inc.amount, 0);

      const monthExpense = expenses
        .filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= date && expDate <= monthEnd;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: monthIncome,
        expense: monthExpense,
      });
    }

    return months;
  };

  const getCategoryBreakdown = (type: 'income' | 'expense') => {
    const colors = [
      'hsl(160, 84%, 35%)',
      'hsl(38, 92%, 50%)',
      'hsl(201, 96%, 42%)',
      'hsl(280, 65%, 60%)',
      'hsl(340, 75%, 55%)',
      'hsl(25, 95%, 53%)',
    ];

    if (type === 'income') {
      const sourceMap = new Map<string, number>();
      incomes.forEach(inc => {
        const key = inc.source;
        sourceMap.set(key, (sourceMap.get(key) || 0) + inc.amount);
      });

      return Array.from(sourceMap.entries()).map(([name, value], idx) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        color: colors[idx % colors.length],
      }));
    } else {
      const categoryMap = new Map<string, number>();
      expenses.forEach(exp => {
        const key = exp.category;
        categoryMap.set(key, (categoryMap.get(key) || 0) + exp.amount);
      });

      return Array.from(categoryMap.entries()).map(([name, value], idx) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        color: colors[idx % colors.length],
      }));
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        incomes,
        expenses,
        stats: calculateStats(),
        settings,
        addIncome,
        addExpense,
        updateSettings,
        getMonthlyData,
        getCategoryBreakdown,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
