import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const emailSchema = z.string().trim().email({ message: "Ogiltig e-postadress" }).max(255);

export default function BlogSubscribe() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        title: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if subscriber already exists for blog
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active, confirmed_at')
        .eq('email', validation.data.toLowerCase())
        .eq('subscription_type', 'blog')
        .maybeSingle();

      if (existing) {
        if (existing.is_active && existing.confirmed_at) {
          toast({ title: "Du prenumererar redan" });
          setEmail('');
          setIsSubmitting(false);
          return;
        }
        
        // Reactivate inactive subscriber
        const token = crypto.randomUUID();
        await supabase
          .from('newsletter_subscribers')
          .update({ 
            is_active: true, 
            confirmation_token: token,
            unsubscribed_at: null 
          })
          .eq('id', existing.id);

        await supabase.functions.invoke('send-confirmation-email', {
          body: { email: validation.data.toLowerCase(), confirmationToken: token }
        });
      } else {
        // Create new subscriber for blog notifications
        const token = crypto.randomUUID();
        const { error: insertError } = await supabase
          .from('newsletter_subscribers')
          .insert({
            email: validation.data.toLowerCase(),
            is_active: false,
            confirmation_token: token,
            subscription_type: 'blog'
          });

        if (insertError) {
          console.error('Error inserting blog subscriber:', insertError);
          throw insertError;
        }

        await supabase.functions.invoke('send-confirmation-email', {
          body: { email: validation.data.toLowerCase(), confirmationToken: token }
        });
      }

      toast({ title: "Kolla din inkorg för att bekräfta ✓" });
      setEmail('');
    } catch (error) {
      toast({
        title: "Något gick fel, försök igen",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-16 pt-8 border-t border-border">
      <p className="text-muted-foreground mb-4">Mejlnotis för nya inlägg?</p>
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
        <Input
          type="email"
          placeholder="din@email.se"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Prenumerera'}
        </Button>
      </form>
    </section>
  );
}
