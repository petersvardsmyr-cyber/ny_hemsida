-- Add unique constraint to prevent duplicate newsletter sends to same subscriber for same newsletter
ALTER TABLE public.newsletter_recipients
ADD CONSTRAINT newsletter_recipients_unique_send UNIQUE (sent_newsletter_id, subscriber_email);