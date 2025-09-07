-- Add discount_active column to products table
ALTER TABLE public.products 
ADD COLUMN discount_active boolean DEFAULT false;