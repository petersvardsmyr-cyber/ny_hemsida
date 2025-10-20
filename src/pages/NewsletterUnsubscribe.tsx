import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const NewsletterUnsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const email = searchParams.get('email');

  useEffect(() => {
    const unsubscribe = async () => {
      if (!email) {
        setStatus('error');
        setMessage('Ingen e-postadress angiven.');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('unsubscribe-newsletter', {
          body: { email }
        });

        if (error) {
          console.error('Error unsubscribing:', error);
          setStatus('error');
          setMessage('Ett fel uppstod vid avregistrering. Försök igen senare.');
          return;
        }

        setStatus('success');
        setMessage(`Du har avregistrerats från nyhetsbrevet.`);
      } catch (error) {
        console.error('Error:', error);
        setStatus('error');
        setMessage('Ett fel uppstod vid avregistrering. Försök igen senare.');
      }
    };

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === 'error' && <XCircle className="h-16 w-16 text-destructive" />}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Avregistrerar...'}
            {status === 'success' && 'Avregistrering genomförd'}
            {status === 'error' && 'Något gick fel'}
          </CardTitle>
          <CardDescription className="text-base mt-4">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="mt-4"
          >
            Tillbaka till startsidan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterUnsubscribe;
