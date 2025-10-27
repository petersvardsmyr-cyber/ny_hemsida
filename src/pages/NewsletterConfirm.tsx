import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function NewsletterConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-confirmed'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmSubscription = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Ingen bekräftelsetoken hittades.');
        return;
      }

      try {
        console.log('Confirming subscription with token:', token);
        const { data, error } = await supabase.functions.invoke('confirm-newsletter', {
          body: { token }
        });

        console.log('Confirmation response:', { data, error });

        if (error) {
          console.error('Error confirming subscription:', error);
          setStatus('error');
          setMessage('Kunde inte bekräfta prenumerationen. Länken kan vara ogiltig eller utgången.');
          return;
        }

        // Check if already confirmed
        if (data?.already_confirmed) {
          setStatus('already-confirmed');
          setMessage('Din prenumeration har redan bekräftats tidigare.');
          return;
        }

        setStatus('success');
        setMessage('Tack! Din prenumeration är nu bekräftad. Du kommer att få mina nyhetsbrev.');
      } catch (error) {
        console.error('Error:', error);
        setStatus('error');
        setMessage('Ett oväntat fel uppstod. Försök igen senare.');
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <CardTitle>Bekräftar din prenumeration</CardTitle>
              <CardDescription>Vänligen vänta...</CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle>Prenumeration bekräftad!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === 'already-confirmed' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-blue-500" />
              </div>
              <CardTitle>Redan bekräftad</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle>Kunde inte bekräfta</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        
        {status !== 'loading' && (
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')}>
              Till startsidan
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
