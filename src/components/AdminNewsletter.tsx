import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Users, Send } from 'lucide-react';

export function AdminNewsletter() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const { toast } = useToast();

  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
      setShowSubscribers(true);
    } catch (error: any) {
      console.error('Error loading subscribers:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda prenumeranter",
        variant: "destructive",
      });
    }
  };

  const sendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Fel",
        description: "Både ämne och innehåll krävs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('newsletter', {
        body: {
          subject: subject.trim(),
          content: content.trim(),
          from: "Peter Svärdsmyr <hej@petersvardsmyr.se>"
        }
      });

      if (error) throw error;

      toast({
        title: "Nyhetsbrev skickat!",
        description: data?.message || "Nyhetsbrevet har skickats till alla prenumeranter",
      });

      setSubject('');
      setContent('');
    } catch (error: any) {
      console.error('Newsletter send error:', error);
      toast({
        title: "Fel",
        description: error.message || "Kunde inte skicka nyhetsbrev",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-medium">Nyhetsbrev</h2>
          <p className="text-muted-foreground">Hantera och skicka nyhetsbrev</p>
        </div>
        <Button onClick={loadSubscribers} variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Visa prenumeranter ({subscribers.length})
        </Button>
      </div>

      {/* Subscribers List */}
      {showSubscribers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Prenumeranter ({subscribers.length})
            </CardTitle>
            <CardDescription>
              Lista över alla registrerade prenumeranter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{subscriber.name || 'Ej angivet'}</p>
                    <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(subscriber.subscribed_at).toLocaleDateString('sv-SE')}
                    {!subscriber.is_active && (
                      <span className="ml-2 text-red-500">(Inaktiv)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Newsletter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Skicka nyhetsbrev
          </CardTitle>
          <CardDescription>
            Komponera och skicka ett nyhetsbrev till alla aktiva prenumeranter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendNewsletter} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ämne</label>
              <Input
                type="text"
                placeholder="Ämnesrad för nyhetsbrevet"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Innehåll (HTML)</label>
              <Textarea
                placeholder="Skriv innehållet för ditt nyhetsbrev här. Du kan använda HTML-taggar för formatering."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Du kan använda HTML för formatering: &lt;p&gt;, &lt;br&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, etc.
              </p>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isLoading ? 'Skickar...' : 'Skicka nyhetsbrev'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}