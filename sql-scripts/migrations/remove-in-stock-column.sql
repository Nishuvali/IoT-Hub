-- Remove in_stock column and update logic to hide products when out of stock
-- Run this in your Supabase SQL Editor

-- Step 1: Check if in_stock column exists before trying to use it
-- If in_stock column doesn't exist, skip this step
-- UPDATE public.products 
-- SET stock_quantity = 0 
-- WHERE in_stock = false;

-- Step 2: Remove the in_stock column (if it exists)
ALTER TABLE public.products 
DROP COLUMN IF EXISTS in_stock;

-- Step 3: Update any existing products that might have stock_quantity = 0 but should be visible
-- (This is optional - only run if you want to make some out-of-stock products visible)
-- UPDATE public.products 
-- SET stock_quantity = 1 
-- WHERE name = 'Product Name Here';

-- Step 4: Verify the changes
SELECT 
  id,
  name,
  stock_quantity,
  price,
  category,
  created_at
FROM public.products 
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Check if any products have stock_quantity = 0 (these will be hidden)
SELECT 
  COUNT(*) as hidden_products_count
FROM public.products 
WHERE stock_quantity = 0;

-- Step 6: Check visible products (stock_quantity > 0)
SELECT 
  COUNT(*) as visible_products_count
FROM public.products 
WHERE stock_quantity > 0;
