import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Eye } from 'lucide-react';
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

export default function AdminOrderNotifications() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    template_type: 'order_confirmation'
  });
  const { toast } = useToast();

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .in('template_type', ['order_confirmation', 'order_shipped', 'test_email'])
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

      setFormData({ name: '', subject: '', content: '', template_type: 'order_confirmation' });
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
    setFormData({ name: '', subject: '', content: '', template_type: 'order_confirmation' });
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

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Fel",
        description: "Ange en e-postadress för testet.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke('test-order-email', {
        body: { customer_email: testEmail }
      });

      if (error) throw error;

      toast({
        title: "Skickat",
        description: `Test-e-post skickad till ${testEmail}`,
      });
      setTestEmail('');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Fel",
        description: "Kunde inte skicka test-e-post.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Orderbekräftelser</h1>
          <p className="text-muted-foreground">Hantera e-postmallar för orderbekräftelser och administrativa meddelanden</p>
        </div>
      </div>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Mail className="w-5 h-5" />
            Hur fungerar orderbekräftelser?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Två e-postmeddelanden skickas automatiskt:</h3>
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-900 p-3 rounded-md border">
                <p className="font-medium text-green-700 dark:text-green-400">📧 Till kunden ({'{kundens e-post}'})</p>
                <ul className="mt-2 space-y-1 text-muted-foreground ml-4 list-disc">
                  <li>Ämne: "Tack för din beställning! - [ordernummer]"</li>
                  <li>Från: Peter Svärdsmyr {'<hej@petersvardsmyr.se>'}</li>
                  <li><strong>Innehåller:</strong> Välkomsttext (från mall nedan) + produktlista + priser + momsspecifikation + leveransadress + leveransinformation</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-3 rounded-md border">
                <p className="font-medium text-orange-700 dark:text-orange-400">📧 Till dig som administratör (hej@petersvardsmyr.se)</p>
                <ul className="mt-2 space-y-1 text-muted-foreground ml-4 list-disc">
                  <li>Ämne: "Ny beställning [ordernummer]"</li>
                  <li>Från: Peter Svärdsmyr {'<hej@petersvardsmyr.se>'}</li>
                  <li><strong>Innehåller:</strong> Orderdetaljer + kundens e-post + produktlista + leveransadress + Stripe Session ID</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-md border border-yellow-200 dark:border-yellow-900">
            <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">⚠️ Viktigt att veta:</p>
            <p className="text-yellow-800 dark:text-yellow-300">Mallen nedan används endast för <strong>välkomsttexten</strong> i kundens e-post. Produktlistan, momsberäkning, leveransadress och övrig formatering är automatiskt genererad och kan inte ändras här.</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md border">
            <p className="font-semibold mb-2">💡 Så här används din mall:</p>
            <p className="text-muted-foreground">
              Din mall (ämne + innehåll) visas högst upp i kundens e-post, precis under orderbekräftelsen. Allt annat (produkter, priser, moms, leveransinfo) läggs till automatiskt under din text.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingTemplate ? 'Redigera e-postmall' : 'Skapa ny e-postmall'}
              </CardTitle>
              <CardDescription>
                Skapa eller redigera mallar för orderbekräftelser
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
                    placeholder="T.ex. Orderbekräftelse"
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
                      <SelectItem value="order_confirmation">Orderbekräftelse</SelectItem>
                      <SelectItem value="order_shipped">Leveransbekräftelse</SelectItem>
                      <SelectItem value="test_email">Test e-post</SelectItem>
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
                          Typ: {template.template_type === 'order_confirmation' ? 'Orderbekräftelse' : 
                                template.template_type === 'order_shipped' ? 'Leveransbekräftelse' : 'Test e-post'}
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
              <CardTitle>Testa e-post</CardTitle>
              <CardDescription>
                Skicka en test-orderbekräftelse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testEmail">E-postadress</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <Button 
                onClick={sendTestEmail} 
                disabled={isSendingTest}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSendingTest ? 'Skickar...' : 'Skicka test'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
