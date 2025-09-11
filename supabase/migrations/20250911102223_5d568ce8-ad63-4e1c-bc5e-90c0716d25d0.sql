-- Add shipped_at column to orders table to track when orders are marked as shipped
ALTER TABLE public.orders 
ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN shipping_tracking_number TEXT;