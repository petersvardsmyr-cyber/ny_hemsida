import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Fel",
        description: "Vänligen ange din e-postadress",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const { data: existingSubscriber } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active')
        .eq('email', email)
        .single();

      if (existingSubscriber) {
        if (existingSubscriber.is_active) {
          toast({
            title: "Redan prenumerant",
            description: "Du prenumererar redan på vårt nyhetsbrev!",
          });
        } else {
          // Reactivate subscription
          await supabase
            .from('newsletter_subscribers')
            .update({ is_active: true, name })
            .eq('email', email);
          
          toast({
            title: "Välkommen tillbaka!",
            description: "Din prenumeration har aktiverats igen.",
          });
        }
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert([{ email, name }]);

        if (error) throw error;

        toast({
          title: "Tack!",
          description: "Du kommer nu att få mina nyhetsbrev. Vi ses i inkorgen! :) /Peter",
        });
      }

      setEmail('');
      setName('');
    } catch (error: any) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Fel",
        description: "Något gick fel. Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Prenumerera på nyhetsbrevet</CardTitle>
        <CardDescription>
          Få de senaste nyheterna och uppdateringarna direkt i din inkorg
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Ditt namn (valfritt)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Din e-postadress"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Prenumererar...' : 'Prenumerera'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}