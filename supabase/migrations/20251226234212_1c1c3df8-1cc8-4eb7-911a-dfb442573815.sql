-- Add subscription_type column to distinguish between blog and newsletter subscribers
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN subscription_type text NOT NULL DEFAULT 'newsletter';

-- Add a check constraint for valid types
ALTER TABLE public.newsletter_subscribers 
ADD CONSTRAINT valid_subscription_type CHECK (subscription_type IN ('newsletter', 'blog'));

-- Create an index for efficient filtering
CREATE INDEX idx_newsletter_subscribers_type ON public.newsletter_subscribers(subscription_type);

-- Update RLS policy to allow public read for unsubscribe functionality
CREATE POLICY "Anyone can view their own subscription by email" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (true);