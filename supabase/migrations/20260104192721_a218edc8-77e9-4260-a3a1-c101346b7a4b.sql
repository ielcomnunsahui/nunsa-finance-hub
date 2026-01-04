-- Add salary_percentage column to cafe_settings
ALTER TABLE public.cafe_settings 
ADD COLUMN salary_percentage numeric NOT NULL DEFAULT 5;

-- Add comment for documentation
COMMENT ON COLUMN public.cafe_settings.salary_percentage IS 'Percentage of monthly income used to calculate staff salary';