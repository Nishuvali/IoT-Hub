# Database Setup Guide for IoT Hub

## Issue Identified
The Products and Projects pages were failing to load because:
1. The database queries were using incorrect column names (`type` instead of `product_type`)
2. The products table schema was missing required columns
3. No sample data was populated in the database

## Solution Implemented

### 1. Fixed Database Schema
- Created `products-table-schema.sql` with proper column structure
- Added all required columns: `product_type`, `brand`, `rating`, `specifications`, etc.
- Added proper indexes for performance
- Added Row Level Security (RLS) policies

### 2. Fixed Component Queries
- Updated `IoTComponentsPage.tsx` to use `.eq('product_type', 'physical')`
- Updated `ReadyMadeProjectsPage.tsx` to use `.eq('product_type', 'digital')`
- Updated `sample-products.sql` with correct column names and sample data

## Steps to Fix the Issue

### Step 1: Run the Database Schema
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `products-table-schema.sql`
4. Click "Run" to create the products table

### Step 2: Populate Sample Data
1. In the same SQL Editor
2. Copy and paste the contents of `sample-products.sql`
3. Click "Run" to insert sample products

### Step 3: Verify the Setup
Run this query to verify everything is working:
```sql
SELECT 
  id,
  name,
  price,
  category,
  subcategory,
  product_type,
  brand,
  rating,
  stock_quantity
FROM products 
ORDER BY product_type, category;
```

## Expected Results

After running these SQL scripts, you should have:
- **Physical Products (IoT Components)**: 8 items including Arduino Uno, ESP32, Raspberry Pi, sensors, and actuators
- **Digital Projects (Ready-Made Projects)**: 3 items including Smart Home Automation, Weather Monitoring, and IoT Security Camera

## Testing the Fix

1. Navigate to the IoT Components page - should show 8 physical products
2. Navigate to the Ready-Made Projects page - should show 3 digital projects
3. Both pages should now load without errors
4. Filtering and search should work properly

## Additional Notes

- The `product_type` column distinguishes between 'physical' (IoT Components) and 'digital_project' (Ready-Made Projects)
- All products have proper ratings, brands, and stock quantities
- The schema includes JSONB `specifications` column for future extensibility
- RLS policies ensure proper access control

If you encounter any issues, check the Supabase logs for specific error messages.
