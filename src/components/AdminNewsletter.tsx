import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/RichTextEditor';
import { toast } from 'sonner';
import { Users, Send, Mail, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function AdminNewsletter() {
  console.log('AdminNewsletter component rendering');
  
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const isMobile = useIsMobile();

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
      toast.error('Kunde inte ladda prenumeranter');
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_type', 'newsletter')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) {
      setSubject('');
      setContent('');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('subject, content')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      if (data) {
        setSubject(data.subject);
        setContent(data.content);
      }
    } catch (error: any) {
      console.error('Error loading template:', error);
      toast.error('Kunde inte ladda mall');
    }
  };

  const sendNewsletter = async () => {
    console.log('[Newsletter] Send start', { selectedTemplate, hasSubject: !!subject.trim(), hasContent: !!content.trim() });

    if (!selectedTemplate && (!subject.trim() || !content.trim())) {
      toast.error('Både ämne och innehåll krävs (eller välj en mall)');
      return;
    }

    setIsLoading(true);

    try {
      const payload = selectedTemplate
        ? { template_id: selectedTemplate, from: "Peter Svärdsmyr <hej@petersvardsmyr.se>" }
        : { subject: subject.trim(), content: content.trim(), from: "Peter Svärdsmyr <hej@petersvardsmyr.se>" };

      const { data, error } = await supabase.functions.invoke('newsletter', { body: payload });

      if (error) throw error;

      console.log('[Newsletter] Send response', data);

      toast.success('Nyhetsbrev skickat!', {
        description: (data as any)?.message || 'Nyhetsbrevet har skickats till alla prenumeranter'
      });

      setSubject('');
      setContent('');
      setSelectedTemplate('');
    } catch (error: any) {
      console.error('Newsletter send error:', error);
      toast.error('Kunde inte skicka nyhetsbrev', {
        description: error?.message || 'Ett oväntat fel uppstod'
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
          <form onSubmit={(e) => { e.preventDefault(); sendNewsletter(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-select">Välj mall (valfritt)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj en befintlig mall eller skriv egen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Skriv egen (tom mall)</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {template.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Ämne</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Ämnesrad för nyhetsbrevet"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required={!selectedTemplate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Innehåll</Label>
              {isMobile ? (
                <Textarea
                  id="content"
                  placeholder="Skriv innehållet för ditt nyhetsbrev här."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[240px]"
                  required={!selectedTemplate}
                />
              ) : (
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Skriv innehållet för ditt nyhetsbrev här. Använd verktygsfältet för formatering."
                />
              )}
            </div>

            <Button 
              type="button"
              onClick={sendNewsletter}
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