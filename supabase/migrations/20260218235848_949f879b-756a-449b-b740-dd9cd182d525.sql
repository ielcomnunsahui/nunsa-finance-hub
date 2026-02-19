
-- Create inventory items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  unit TEXT NOT NULL DEFAULT 'pieces',
  initial_stock INTEGER NOT NULL DEFAULT 0,
  current_stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  cost_price NUMERIC DEFAULT 0,
  sell_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory transactions table (buy/sell/adjust)
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment')),
  quantity INTEGER NOT NULL,
  note TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory_items
CREATE POLICY "Users with role can view inventory" ON public.inventory_items
  FOR SELECT USING (has_any_role(auth.uid()));

CREATE POLICY "Admins can manage inventory" ON public.inventory_items
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for inventory_transactions
CREATE POLICY "Users with role can view transactions" ON public.inventory_transactions
  FOR SELECT USING (has_any_role(auth.uid()));

CREATE POLICY "Users with role can insert transactions" ON public.inventory_transactions
  FOR INSERT WITH CHECK (has_any_role(auth.uid()) AND recorded_by = auth.uid());

CREATE POLICY "Admins can manage transactions" ON public.inventory_transactions
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
