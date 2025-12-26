import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function NewsletterConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmSubscription = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        const { error } = await supabase.functions.invoke('confirm-newsletter', {
          body: { token }
        });

        setStatus(error ? 'error' : 'success');
      } catch {
        setStatus('error');
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <div className="container max-w-md mx-auto px-4 py-24 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Bekräftar...</p>
        </>
      )}
      
      {status === 'success' && (
        <>
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
          <p className="text-foreground mb-6">Prenumeration bekräftad!</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Till startsidan
          </Button>
        </>
      )}
      
      {status === 'error' && (
        <>
          <XCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <p className="text-foreground mb-6">Länken är ogiltig eller utgången</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Till startsidan
          </Button>
        </>
      )}
    </div>
  );
}
