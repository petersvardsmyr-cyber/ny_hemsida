-- Create table for sent newsletters
CREATE TABLE public.sent_newsletters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sent_newsletters ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view sent newsletters"
ON public.sent_newsletters
FOR SELECT
USING (true);

CREATE POLICY "Edge functions can insert sent newsletters"
ON public.sent_newsletters
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_sent_newsletters_sent_at ON public.sent_newsletters(sent_at DESC);