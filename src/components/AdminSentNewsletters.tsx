import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Mail, Eye, Calendar, Users } from 'lucide-react';

interface SentNewsletter {
  id: string;
  subject: string;
  content: string;
  template_id: string | null;
  recipient_count: number;
  sent_at: string;
  sent_by: string | null;
}

export function AdminSentNewsletters() {
  const [newsletters, setNewsletters] = useState<SentNewsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState<SentNewsletter | null>(null);

  useEffect(() => {
    loadSentNewsletters();
  }, []);

  const loadSentNewsletters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sent_newsletters')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (error: any) {
      console.error('Error loading sent newsletters:', error);
      toast.error('Kunde inte ladda skickade nyhetsbrev');
    } finally {
      setIsLoading(false);
    }
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
                        {newsletter.recipient_count} mottagare
                      </span>
                      {newsletter.sent_by && (
                        <span className="text-xs">Skickat av: {newsletter.sent_by}</span>
                      )}
                    </CardDescription>
                  </div>
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
                          dangerouslySetInnerHTML={{ __html: newsletter.content }}
                        />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
