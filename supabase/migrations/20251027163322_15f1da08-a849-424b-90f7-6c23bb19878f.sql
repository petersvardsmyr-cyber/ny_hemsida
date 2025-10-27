-- Add unsubscribed_at column to newsletter_subscribers
ALTER TABLE newsletter_subscribers 
ADD COLUMN unsubscribed_at timestamp with time zone;