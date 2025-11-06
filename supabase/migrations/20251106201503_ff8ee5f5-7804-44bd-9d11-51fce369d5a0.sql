-- Create table to track which subscribers received which newsletters
CREATE TABLE public.newsletter_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_newsletter_id UUID NOT NULL REFERENCES public.sent_newsletters(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_newsletter_recipients_newsletter ON public.newsletter_recipients(sent_newsletter_id);
CREATE INDEX idx_newsletter_recipients_email ON public.newsletter_recipients(subscriber_email);

-- Enable RLS
ALTER TABLE public.newsletter_recipients ENABLE ROW LEVEL SECURITY;

-- Admins can view all recipients
CREATE POLICY "Admins can view all recipients"
ON public.newsletter_recipients
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Edge functions can insert recipients
CREATE POLICY "Edge functions can insert recipients"
ON public.newsletter_recipients
FOR INSERT
TO authenticated
WITH CHECK (true);