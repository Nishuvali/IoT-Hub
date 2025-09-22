-- Complete Products Table Schema for IoT Hub
-- Run this in your Supabase SQL Editor to create the products table

-- Drop existing products table if it exists (be careful with this in production!)
-- DROP TABLE IF EXISTS public.products CASCADE;

-- Create products table with all required columns
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    brand TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    product_type TEXT CHECK (product_type IN ('physical', 'digital_project')) DEFAULT 'physical',
    specifications JSONB,
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON public.products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products (public read access)
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

-- Allow authenticated users to insert products (for admin functionality)
CREATE POLICY "Authenticated users can insert products" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update products (for admin functionality)
CREATE POLICY "Authenticated users can update products" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete products (for admin functionality)
CREATE POLICY "Authenticated users can delete products" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the table was created
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;
