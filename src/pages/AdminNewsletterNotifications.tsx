import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Eye, Users } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  subscribed_at: string;
}

export default function AdminNewsletterNotifications() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    template_type: 'newsletter_welcome'
  });
  const { toast } = useToast();

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .in('template_type', ['newsletter_welcome', 'newsletter'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta e-postmallar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.content.trim()) {
      toast({
        title: "Fel",
        description: "Alla fält måste fyllas i.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: formData.name,
            subject: formData.subject,
            content: formData.content,
            template_type: formData.template_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        
        toast({
          title: "Sparad",
          description: "E-postmallen har uppdaterats.",
        });
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([{
            name: formData.name,
            subject: formData.subject,
            content: formData.content,
            template_type: formData.template_type
          }]);

        if (error) throw error;
        
        toast({
          title: "Sparad",
          description: "E-postmallen har skapats.",
        });
      }

      setFormData({ name: '', subject: '', content: '', template_type: 'newsletter_welcome' });
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Fel",
        description: "Kunde inte spara e-postmallen.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      template_type: template.template_type
    });
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', content: '', template_type: 'newsletter_welcome' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Är du säker på att du vill radera denna mall?')) {
      try {
        const { error } = await supabase
          .from('email_templates')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Raderad",
          description: "E-postmallen har raderats.",
        });
        
        loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
        toast({
          title: "Fel",
          description: "Kunde inte radera e-postmallen.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    loadTemplates();
    loadSubscribers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Nyhetsbrevbekräftelser</h1>
          <p className="text-muted-foreground">Hantera e-postmallar för välkomstmeddelanden och nyhetsbrev</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingTemplate ? 'Redigera e-postmall' : 'Skapa ny e-postmall'}
              </CardTitle>
              <CardDescription>
                Skapa eller redigera mallar för nyhetsbrev och välkomstmeddelanden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Mallnamn</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="T.ex. Välkommen till nyhetsbrevet"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Malltyp</Label>
                  <Select 
                    value={formData.template_type} 
                    onValueChange={(value) => setFormData({ ...formData, template_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj malltyp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter_welcome">Välkomstmeddelande</SelectItem>
                      <SelectItem value="newsletter">Nyhetsbrev</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject">Ämne</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="E-postens ämne"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Innehåll</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Skriv e-postens innehåll här..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {editingTemplate ? 'Uppdatera mall' : 'Spara mall'}
                </Button>
                {editingTemplate && (
                  <Button variant="outline" onClick={handleCancel}>
                    Avbryt
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing Templates */}
          <div className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold">Befintliga mallar</h2>
            {isLoading ? (
              <div>Laddar...</div>
            ) : templates.length === 0 ? (
              <p className="text-muted-foreground">Inga mallar skapade ännu.</p>
            ) : (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                          Typ: {template.template_type === 'newsletter_welcome' ? 'Välkomstmeddelande' : 'Nyhetsbrev'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Redigera
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                        >
                          Radera
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Ämne:</strong> {template.subject}</p>
                    <div className="mt-2">
                      <strong>Innehåll:</strong>
                      <div 
                        className="mt-1 p-3 bg-muted rounded-md prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(template.content) }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Users className="w-5 h-5 mr-2 inline" />
                Prenumeranter
              </CardTitle>
              <CardDescription>
                {subscribers.length} aktiva prenumeranter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subscribers.slice(0, 5).map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{subscriber.email}</span>
                    <span className="text-muted-foreground">
                      {new Date(subscriber.subscribed_at).toLocaleDateString('sv')}
                    </span>
                  </div>
                ))}
                {subscribers.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ... och {subscribers.length - 5} till
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
