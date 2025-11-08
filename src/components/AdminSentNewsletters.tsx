import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Mail, Eye, Calendar, Users, Send } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';
import { useNavigate } from 'react-router-dom';

interface SentNewsletter {
  id: string;
  subject: string;
  content: string;
  template_id: string | null;
  recipient_count: number;
  sent_at: string;
  sent_by: string | null;
}

interface NewsletterWithStatus extends SentNewsletter {
  remaining: number;
  totalSubscribers: number;
}

export function AdminSentNewsletters() {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<NewsletterWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState<SentNewsletter | null>(null);

  useEffect(() => {
    loadSentNewsletters();
  }, []);

  const loadSentNewsletters = async () => {
    try {
      setIsLoading(true);
      
      // Get all sent newsletters
      const { data: sentData, error: sentError } = await supabase
        .from('sent_newsletters')
        .select('*')
        .order('sent_at', { ascending: false });

      if (sentError) throw sentError;

      // Get total active subscribers count
      const { count: totalSubscribers } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // For each newsletter, calculate remaining recipients
      const newslettersWithStatus: NewsletterWithStatus[] = await Promise.all(
        (sentData || []).map(async (newsletter) => {
          const { data: recipients } = await supabase
            .from('newsletter_recipients')
            .select('subscriber_email')
            .eq('sent_newsletter_id', newsletter.id);

          const alreadySent = recipients?.length || 0;
          const remaining = (totalSubscribers || 0) - alreadySent;

          return {
            ...newsletter,
            remaining,
            totalSubscribers: totalSubscribers || 0
          };
        })
      );

      setNewsletters(newslettersWithStatus);
    } catch (error: any) {
      console.error('Error loading sent newsletters:', error);
      toast.error('Kunde inte ladda skickade nyhetsbrev');
    } finally {
      setIsLoading(false);
    }
  };

  const continueNewsletter = (newsletter: NewsletterWithStatus) => {
    navigate('/admin/newsletter', {
      state: {
        subject: newsletter.subject,
        content: newsletter.content,
        newsletterId: newsletter.id
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-medium">Skickade nyhetsbrev</h2>
        <p className="text-muted-foreground">Historik över alla nyhetsbrev som skickats</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Laddar...</p>
          </CardContent>
        </Card>
      ) : newsletters.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Inga skickade nyhetsbrev ännu</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {newsletters.map((newsletter) => (
            <Card key={newsletter.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      {newsletter.subject}
                    </CardTitle>
                    <CardDescription className="flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(newsletter.sent_at)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {newsletter.recipient_count} skickade av {newsletter.totalSubscribers} totalt
                      </span>
                      {newsletter.remaining > 0 && (
                        <span className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium">
                          {newsletter.remaining} prenumeranter återstår
                        </span>
                      )}
                      {newsletter.sent_by && (
                        <span className="text-xs">Skickat av: {newsletter.sent_by}</span>
                      )}
                    </CardDescription>
                   </div>
                   <div className="flex gap-2">
                     {newsletter.remaining > 0 && (
                       <Button 
                         variant="default" 
                         size="sm"
                         onClick={() => continueNewsletter(newsletter)}
                       >
                         <Send className="w-4 h-4 mr-2" />
                         Fortsätt skicka
                       </Button>
                     )}
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => setSelectedNewsletter(newsletter)}
                         >
                           <Eye className="w-4 h-4 mr-2" />
                           Visa
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-3xl max-h-[80vh]">
                         <DialogHeader>
                           <DialogTitle>{newsletter.subject}</DialogTitle>
                           <DialogDescription>
                             Skickat {formatDate(newsletter.sent_at)} till {newsletter.recipient_count} mottagare
                           </DialogDescription>
                         </DialogHeader>
                         <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                           <div 
                             className="prose prose-sm max-w-none"
                             dangerouslySetInnerHTML={{ __html: sanitizeHtml(newsletter.content) }}
                           />
                         </ScrollArea>
                       </DialogContent>
                     </Dialog>
                   </div>
                 </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
