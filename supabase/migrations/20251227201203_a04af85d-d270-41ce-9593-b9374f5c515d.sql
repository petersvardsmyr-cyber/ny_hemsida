-- Remove the old unique constraint on email only
ALTER TABLE public.newsletter_subscribers 
DROP CONSTRAINT newsletter_subscribers_email_key;

-- Add a new unique constraint on email + subscription_type combination
ALTER TABLE public.newsletter_subscribers 
ADD CONSTRAINT newsletter_subscribers_email_subscription_type_key 
UNIQUE (email, subscription_type);