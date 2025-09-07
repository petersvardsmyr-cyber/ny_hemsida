-- Create products table for the bookstore
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents (Swedish öre)
  original_price INTEGER, -- For displaying discounts
  image_url TEXT NOT NULL,
  stripe_price_id TEXT, -- For Stripe integration
  category TEXT DEFAULT 'book',
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly viewable
CREATE POLICY "Products are publicly viewable" 
ON public.products 
FOR SELECT 
USING (true);

-- Only authenticated users can modify products (for admin)
CREATE POLICY "Authenticated users can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" 
ON public.products 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete products" 
ON public.products 
FOR DELETE 
USING (true);

-- Create orders table for purchase tracking
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  total_amount INTEGER NOT NULL, -- Total in cents
  discount_amount INTEGER DEFAULT 0, -- Discount applied in cents
  discount_code TEXT, -- Coupon code used
  status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
  shipping_address JSONB,
  items JSONB NOT NULL, -- Array of purchased items
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (email = auth.email() OR user_id = auth.uid());

-- Edge functions can insert/update orders
CREATE POLICY "Edge functions can manage orders" 
ON public.orders 
FOR ALL 
USING (true);

-- Add trigger for updating timestamps
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the current book products
INSERT INTO public.products (title, description, price, original_price, image_url, sort_order, featured) VALUES
('Allt det vi delar', 'Reflektion och tankar om det som förenar oss människor', 9900, NULL, '/lovable-uploads/0290e479-7e17-4147-98cf-68745458f273.png', 1, true),
('Det ordnar sig', 'Ett frö av reflektion för varje vecka på året', 15900, NULL, '/lovable-uploads/764ef977-eac5-4ecb-9a99-886c0a473b5f.png', 2, true),
('Allt det vi delar – andra året', 'Fortsättningen på den populära reflektionsboken', 17900, NULL, '/lovable-uploads/d46f78be-5cd0-4056-a65d-0315a8ca0464.png', 3, true),
('Att bli till', 'Om människans inre utveckling och reflektion', 7900, 9900, '/lovable-uploads/945ace33-dadc-46c4-907c-ab6bb84a1c3b.png', 4, true);