-- Create profiles table for user settings
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  belt VARCHAR(50) DEFAULT 'white',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create achievements table for belt promotions and stripes
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('belt', 'stripe')),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  achieved_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create journal entries table for training sessions
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create techniques table for moves learned
CREATE TABLE IF NOT EXISTS public.techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  youtube_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.techniques ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Achievements RLS Policies
CREATE POLICY "achievements_select_own" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achievements_insert_own" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "achievements_update_own" ON public.achievements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "achievements_delete_own" ON public.achievements FOR DELETE USING (auth.uid() = user_id);

-- Journal Entries RLS Policies
CREATE POLICY "journal_entries_select_own" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "journal_entries_insert_own" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_entries_update_own" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "journal_entries_delete_own" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Techniques RLS Policies (access based on journal entry ownership)
CREATE POLICY "techniques_select_own" ON public.techniques FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.journal_entries 
    WHERE journal_entries.id = techniques.journal_entry_id 
    AND journal_entries.user_id = auth.uid()
  ));

CREATE POLICY "techniques_insert_own" ON public.techniques FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.journal_entries 
    WHERE journal_entries.id = techniques.journal_entry_id 
    AND journal_entries.user_id = auth.uid()
  ));

CREATE POLICY "techniques_update_own" ON public.techniques FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.journal_entries 
    WHERE journal_entries.id = techniques.journal_entry_id 
    AND journal_entries.user_id = auth.uid()
  ));

CREATE POLICY "techniques_delete_own" ON public.techniques FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.journal_entries 
    WHERE journal_entries.id = techniques.journal_entry_id 
    AND journal_entries.user_id = auth.uid()
  ));

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, belt)
  VALUES (new.id, 'white')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
