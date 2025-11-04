-- Create newsletter_drafts table for saving newsletter drafts
CREATE TABLE IF NOT EXISTS public.newsletter_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.newsletter_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all drafts"
ON public.newsletter_drafts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create drafts"
ON public.newsletter_drafts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update drafts"
ON public.newsletter_drafts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete drafts"
ON public.newsletter_drafts
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_newsletter_drafts_updated_at
BEFORE UPDATE ON public.newsletter_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();