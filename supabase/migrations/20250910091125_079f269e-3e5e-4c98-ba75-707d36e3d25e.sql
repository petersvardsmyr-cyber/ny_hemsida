-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('newsletter', 'order_confirmation', 'test_email')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for email templates
CREATE POLICY "Authenticated users can view all email templates" 
ON public.email_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create email templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update email templates" 
ON public.email_templates 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete email templates" 
ON public.email_templates 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert current email templates
INSERT INTO public.email_templates (name, subject, content, template_type) VALUES
('Nyhetsbrev', 'Nyhetsbrev från Peter Svärdsmyr', '<h1>Nytt nyhetsbrev</h1><p>Hej!</p><p>Här kommer det senaste nyhetsbrevet från mig.</p><p>Med vänliga hälsningar,<br>Peter Svärdsmyr</p>', 'newsletter'),
('Orderbekräftelse', 'Tack för din beställning!', '<h1>Tack för din beställning!</h1><p>Hej!</p><p>Vi har mottagit din beställning och kommer att behandla den så snart som möjligt.</p><p><strong>Orderdetaljer:</strong></p><p>Din beställning kommer att skickas till den angivna adressen inom 3-5 arbetsdagar.</p><p>Om du har några frågor, tveka inte att kontakta oss.</p><p>Med vänliga hälsningar,<br>Peter Svärdsmyr</p>', 'order_confirmation'),
('Test Email', 'Test av e-postfunktion', '<h1>Test av e-postfunktion</h1><p>Detta är ett testmeddelande för att kontrollera att e-postfunktionen fungerar korrekt.</p><p>Om du får detta meddelande betyder det att systemet fungerar som det ska.</p><p>Med vänliga hälsningar,<br>Peter Svärdsmyr</p>', 'test_email');