-- Add confirmation_token to newsletter_subscribers for double opt-in
ALTER TABLE newsletter_subscribers 
ADD COLUMN confirmation_token text UNIQUE,
ADD COLUMN confirmed_at timestamp with time zone;