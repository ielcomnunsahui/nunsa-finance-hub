import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface IncomeRecord {
  id: string;
  amount: number;
  category_id: string;
  category_name?: string;
  description: string | null;
  receipt_number: string;
  recorded_by: string;
  created_at: string;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  category_id: string;
  category_name?: string;
  description: string | null;
  attachment_url: string | null;
  recorded_by: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CafeSettings {
  id: string;
  cafe_name: string;
  address: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  logo_url: string | null;
  report_recipient_email: string;
  auto_reports_enabled: boolean;
  salary_percentage: number;
}

export function useFinanceData() {
  const { user, role } = useAuth();
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<CafeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user || !role) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [incomeRes, expensesRes, incomeCatRes, expenseCatRes, settingsRes] = await Promise.all([
        supabase.from("income").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("created_at", { ascending: false }),
        supabase.from("income_categories").select("*"),
        supabase.from("expense_categories").select("*"),
        supabase.from("cafe_settings").select("*").maybeSingle(),
      ]);

      if (incomeCatRes.data) setIncomeCategories(incomeCatRes.data);
      if (expenseCatRes.data) setExpenseCategories(expenseCatRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);

      // Map category names to income and expenses
      if (incomeRes.data && incomeCatRes.data) {
        const catMap = new Map(incomeCatRes.data.map((c) => [c.id, c.name]));
        setIncome(
          incomeRes.data.map((i) => ({
            ...i,
            category_name: catMap.get(i.category_id) || "Unknown",
          }))
        );
      }

      if (expensesRes.data && expenseCatRes.data) {
        const catMap = new Map(expenseCatRes.data.map((c) => [c.id, c.name]));
        setExpenses(
          expensesRes.data.map((e) => ({
            ...e,
            category_name: catMap.get(e.category_id) || "Unknown",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, role]);

  const addIncome = async (
    amount: number,
    categoryId: string,
    description?: string
  ): Promise<IncomeRecord | null> => {
    if (!user) return null;

    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const { data, error } = await supabase
      .from("income")
      .insert({
        amount,
        category_id: categoryId,
        description: description || null,
        receipt_number: receiptNumber,
        recorded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding income:", error);
      throw error;
    }

    // Log audit
    await supabase.rpc("log_audit_action", {
      _action_type: "income_added",
      _details: { amount, category_id: categoryId, receipt_number: receiptNumber },
    });

    await fetchData();
    return data;
  };

  const addExpense = async (
    amount: number,
    categoryId: string,
    description?: string
  ): Promise<ExpenseRecord | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        amount,
        category_id: categoryId,
        description: description || null,
        recorded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding expense:", error);
      throw error;
    }

    // Log audit
    await supabase.rpc("log_audit_action", {
      _action_type: "expense_added",
      _details: { amount, category_id: categoryId },
    });

    await fetchData();
    return data;
  };

  const updateSettings = async (newSettings: Partial<CafeSettings>) => {
    if (!settings) return;

    const { error } = await supabase
      .from("cafe_settings")
      .update(newSettings)
      .eq("id", settings.id);

    if (error) {
      console.error("Error updating settings:", error);
      throw error;
    }

    await supabase.rpc("log_audit_action", {
      _action_type: "settings_updated",
      _details: newSettings,
    });

    await fetchData();
  };

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayIncome = income
    .filter((i) => new Date(i.created_at) >= today)
    .reduce((sum, i) => sum + Number(i.amount), 0);
  
  const todayExpenses = expenses
    .filter((e) => new Date(e.created_at) >= today)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  const weeklyIncome = income
    .filter((i) => new Date(i.created_at) >= weekAgo)
    .reduce((sum, i) => sum + Number(i.amount), 0);
  
  const weeklyExpenses = expenses
    .filter((e) => new Date(e.created_at) >= weekAgo)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  const monthlyIncome = income
    .filter((i) => new Date(i.created_at) >= monthStart)
    .reduce((sum, i) => sum + Number(i.amount), 0);
  
  const monthlyExpenses = expenses
    .filter((e) => new Date(e.created_at) >= monthStart)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const currentBalance = totalIncome - totalExpenses;

  return {
    income,
    expenses,
    incomeCategories,
    expenseCategories,
    settings,
    loading,
    addIncome,
    addExpense,
    updateSettings,
    refetch: fetchData,
    stats: {
      todayIncome,
      todayExpenses,
      weeklyIncome,
      weeklyExpenses,
      monthlyIncome,
      monthlyExpenses,
      totalIncome,
      totalExpenses,
      currentBalance,
    },
  };
}
