-- Add additional_images column to products table
ALTER TABLE public.products
ADD COLUMN additional_images JSONB DEFAULT '[]'::jsonb;