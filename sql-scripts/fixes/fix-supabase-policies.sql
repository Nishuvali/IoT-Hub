-- Fix Supabase RLS Policy Infinite Recursion
-- Run this in your Supabase SQL Editor to fix the profiles table policies

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Create a simpler admin policy that doesn't cause recursion
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Alternative: Use a function-based approach (more reliable)
-- First, create a function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  );
$$;

-- Drop the previous policy and create a new one using the function
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR ALL USING (is_admin());

-- Also ensure users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
