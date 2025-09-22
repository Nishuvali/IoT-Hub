-- Create Admin User Script
-- Run this in your Supabase SQL Editor

-- Step 1: Create the user in auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'iothub1324@gmail.com',
  crypt('Sidnish@1101', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "IoT Hub", "last_name": "Admin"}',
  NOW(),
  NOW()
);

-- Step 2: Create the profile for the admin user
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  role,
  mobile_number,
  mobile_verified,
  created_at,
  updated_at
)
SELECT
  u.id,
  'IoT Hub',
  'Admin',
  'admin',
  '+919876543210',
  false,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'iothub1324@gmail.com';

-- Step 3: Verify the admin user was created
SELECT
  u.email,
  u.email_confirmed_at,
  p.first_name,
  p.last_name,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'iothub1324@gmail.com';