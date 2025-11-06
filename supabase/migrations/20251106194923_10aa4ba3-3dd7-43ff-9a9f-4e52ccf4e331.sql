-- Create table to track newsletter send progress
CREATE TABLE IF NOT EXISTS public.newsletter_send_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL,
  started_by TEXT,
  total INTEGER NOT NULL DEFAULT 0,
  sent INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'started',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_send_status ENABLE ROW LEVEL SECURITY;

-- Allow admins to view statuses
CREATE POLICY "Admins can view newsletter send status"
ON public.newsletter_send_status
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role to insert/update (for edge functions)
CREATE POLICY "Service role can manage newsletter send status"
ON public.newsletter_send_status
FOR ALL
USING (true);

-- Timestamp trigger
DROP TRIGGER IF EXISTS trg_newsletter_send_status_updated_at ON public.newsletter_send_status;
CREATE TRIGGER trg_newsletter_send_status_updated_at
BEFORE UPDATE ON public.newsletter_send_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();