
CREATE TABLE public.salary_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  monthly_income numeric NOT NULL DEFAULT 0,
  salary_amount numeric NOT NULL DEFAULT 0,
  salary_tier text NOT NULL DEFAULT 'standard',
  is_paid boolean NOT NULL DEFAULT false,
  added_to_expenses boolean NOT NULL DEFAULT false,
  expense_id uuid REFERENCES public.expenses(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, month, year)
);

ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage salary records"
  ON public.salary_records
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own salary"
  ON public.salary_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
