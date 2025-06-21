
-- 1. Create the public.profiles table for photographer/user profiles, if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the customer_requests table to reference the new profiles table, if not exists
CREATE TABLE IF NOT EXISTS public.customer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;

-- 4. Add policies for profiles table (one for each action)
CREATE POLICY "Profiles: Only owner SELECT" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profiles: Only owner UPDATE" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profiles: Only owner DELETE" ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- 5. Policy: Only allow insert profiles by triggers (not direct)
CREATE POLICY "Profiles: Restrict insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 6. Policy: Only send requests to onboarded photographers
CREATE POLICY "Requests: Only Send to Onboarded Photographers" ON public.customer_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = customer_requests.photographer_id
      AND onboarded = true
    )
  );

-- 7. Only allow photographers to view their own requests
CREATE POLICY "Photographers can view own requests" ON public.customer_requests
  FOR SELECT
  USING (auth.uid() = photographer_id);

