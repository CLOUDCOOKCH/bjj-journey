-- Add monthly_goal column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS monthly_goal INTEGER DEFAULT 12;

-- Update the comment to describe the new column
COMMENT ON COLUMN public.profiles.monthly_goal IS 'Target number of training sessions per month';
