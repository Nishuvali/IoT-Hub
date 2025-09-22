-- Admin User Setup Script for IoT E-commerce Platform
-- Run this AFTER creating the database schema
-- This script creates an admin user and sets up initial configuration

-- =============================================
-- 1. CREATE ADMIN USER
-- =============================================
-- Note: You need to create the admin user through Supabase Auth UI first
-- Then run this script to update the profile

-- Method 1: If you already have an admin user in auth.users
-- Replace 'admin@iotsolutions.com' with your actual admin email
UPDATE public.profiles 
SET 
  role = 'admin',
  first_name = 'Admin',
  last_name = 'User',
  mobile_verified = true,
  email_verified = true,
  is_active = true
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'admin@iotsolutions.com'
);

-- Method 2: Create admin profile for existing user
-- Replace 'your-admin-user-id' with the actual UUID from auth.users
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  role,
  mobile_verified,
  email_verified,
  is_active
) VALUES (
  'your-admin-user-id'::UUID, -- Replace with actual admin user ID
  'Admin',
  'User',
  'admin',
  true,
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  first_name = 'Admin',
  last_name = 'User',
  mobile_verified = true,
  email_verified = true,
  is_active = true;

-- =============================================
-- 2. CREATE TEST USERS (Optional)
-- =============================================
-- These are for testing purposes only

-- Test User 1
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  role,
  mobile_verified,
  email_verified,
  is_active
) VALUES (
  gen_random_uuid(),
  'John',
  'Doe',
  'user',
  false,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- Test User 2
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  role,
  mobile_verified,
  email_verified,
  is_active
) VALUES (
  gen_random_uuid(),
  'Jane',
  'Smith',
  'user',
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 3. CREATE SAMPLE ORDERS (Optional)
-- =============================================
-- This creates sample orders for testing

-- Get a test user ID (assuming you have users)
DO $$
DECLARE
  test_user_id UUID;
  order_id UUID;
BEGIN
  -- Get first user (non-admin)
  SELECT id INTO test_user_id 
  FROM public.profiles 
  WHERE role = 'user' 
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Create sample order
    INSERT INTO public.orders (
      user_id,
      total_amount,
      status,
      payment_status,
      payment_method,
      shipping_address,
      items
    ) VALUES (
      test_user_id,
      599.00,
      'confirmed',
      'paid',
      'upi',
      '{"name": "John Doe", "address": "123 Main St", "city": "Mumbai", "postalCode": "400001", "email": "john@example.com"}',
      '[{"id": "1", "name": "Arduino Uno R3", "price": 599.00, "quantity": 1, "total": 599.00}]'
    ) RETURNING id INTO order_id;
    
    -- Create order items
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      product_price,
      quantity,
      total_price
    ) VALUES (
      order_id,
      (SELECT id FROM public.products WHERE name = 'Arduino Uno R3' LIMIT 1),
      'Arduino Uno R3',
      599.00,
      1,
      599.00
    );
    
    RAISE NOTICE 'Sample order created with ID: %', order_id;
  END IF;
END $$;

-- =============================================
-- 4. CREATE SAMPLE NOTIFICATIONS
-- =============================================
-- Add welcome notifications for admin

INSERT INTO public.notifications (
  user_id,
  title,
  message,
  type
) 
SELECT 
  id,
  'Welcome to IoT Solutions Hub!',
  'Your admin account has been set up successfully. You can now manage products, orders, and users.',
  'success'
FROM public.profiles 
WHERE role = 'admin'
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. CREATE SAMPLE CHAT SESSION
-- =============================================
-- Add a sample support chat

INSERT INTO public.chat_sessions (
  user_id,
  user_name,
  user_email,
  subject,
  category,
  status
)
SELECT 
  id,
  first_name || ' ' || last_name,
  'admin@iotsolutions.com', -- Replace with actual admin email
  'Welcome to Support',
  'general',
  'active'
FROM public.profiles 
WHERE role = 'admin'
ON CONFLICT DO NOTHING;

-- =============================================
-- 6. CREATE SAMPLE SUPPORT TICKET
-- =============================================
-- Add a sample support ticket

INSERT INTO public.support_tickets (
  user_id,
  subject,
  description,
  category,
  priority,
  status
)
SELECT 
  id,
  'System Setup Complete',
  'The IoT e-commerce platform has been successfully set up and is ready for use.',
  'general',
  'low',
  'resolved'
FROM public.profiles 
WHERE role = 'admin'
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. VERIFY SETUP
-- =============================================
-- Check if everything is set up correctly

DO $$
DECLARE
  admin_count INTEGER;
  product_count INTEGER;
  notification_count INTEGER;
BEGIN
  -- Count admin users
  SELECT COUNT(*) INTO admin_count 
  FROM public.profiles 
  WHERE role = 'admin';
  
  -- Count products
  SELECT COUNT(*) INTO product_count 
  FROM public.products;
  
  -- Count notifications
  SELECT COUNT(*) INTO notification_count 
  FROM public.notifications;
  
  RAISE NOTICE '🎉 Admin Setup Complete!';
  RAISE NOTICE '👤 Admin users: %', admin_count;
  RAISE NOTICE '📦 Products: %', product_count;
  RAISE NOTICE '🔔 Notifications: %', notification_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Your IoT E-commerce platform is ready!';
  RAISE NOTICE '🔗 Admin can now access the dashboard';
END $$;

-- =============================================
-- 8. USEFUL QUERIES FOR TESTING
-- =============================================

-- Check admin users
-- SELECT id, first_name, last_name, role, email_verified, mobile_verified 
-- FROM public.profiles 
-- WHERE role = 'admin';

-- Check all products
-- SELECT name, category, price, stock_quantity, featured 
-- FROM public.products 
-- ORDER BY created_at DESC;

-- Check low stock products
-- SELECT * FROM get_low_stock_products();

-- Check recent orders
-- SELECT o.order_number, o.total_amount, o.status, p.first_name, p.last_name
-- FROM public.orders o
-- JOIN public.profiles p ON o.user_id = p.id
-- ORDER BY o.created_at DESC
-- LIMIT 10;

-- Check notifications
-- SELECT title, message, type, created_at 
-- FROM public.notifications 
-- ORDER BY created_at DESC;

-- =============================================
-- 9. CLEANUP COMMANDS (if needed)
-- =============================================

-- To remove test data (uncomment if needed):
-- DELETE FROM public.notifications WHERE title LIKE '%Welcome%';
-- DELETE FROM public.chat_sessions WHERE subject = 'Welcome to Support';
-- DELETE FROM public.support_tickets WHERE subject = 'System Setup Complete';
-- DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE total_amount = 599.00);
-- DELETE FROM public.orders WHERE total_amount = 599.00;

-- =============================================
-- SETUP INSTRUCTIONS
-- =============================================

/*
SETUP INSTRUCTIONS:

1. CREATE SUPABASE PROJECT:
   - Go to https://supabase.com
   - Create a new project
   - Note down your Project URL and API keys

2. RUN DATABASE SCHEMA:
   - Copy and paste the content from 'database-schema.sql'
   - Run it in Supabase SQL Editor

3. CREATE ADMIN USER:
   - Go to Supabase Auth > Users
   - Click "Add user"
   - Enter admin email and password
   - Copy the user ID

4. RUN THIS ADMIN SETUP SCRIPT:
   - Replace 'your-admin-user-id' with the actual admin user ID
   - Run this script in Supabase SQL Editor

5. CONFIGURE ENVIRONMENT:
   - Copy 'env.example' to '.env'
   - Add your Supabase Project ID and API keys
   - Update UPI ID and other service credentials

6. START THE APPLICATION:
   - Run 'npm install' to install dependencies
   - Run 'npm run dev' to start the development server

7. TEST THE SETUP:
   - Login with admin credentials
   - Check admin dashboard
   - Test product management
   - Test order management

TROUBLESHOOTING:
- If admin dashboard doesn't show, check user role in profiles table
- If products don't load, check RLS policies
- If orders fail, check payment configuration
- Check Supabase logs for any errors

SUPPORT:
- Check Supabase documentation
- Review RLS policies
- Test with sample data first
*/
