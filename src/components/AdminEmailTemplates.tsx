import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

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

export function AdminEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    template_type: 'newsletter',
  });

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_type', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast.error('Kunde inte ladda e-postmallar');
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.content.trim()) {
      toast.error('Fyll i alla obligatoriska fält');
      return;
    }

    setIsLoading(true);
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: formData.name,
            subject: formData.subject,
            content: formData.content,
            template_type: formData.template_type,
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Mall uppdaterad');
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: formData.name,
            subject: formData.subject,
            content: formData.content,
            template_type: formData.template_type,
          });

        if (error) throw error;
        toast.success('Mall skapad');
      }

      setFormData({ name: '', subject: '', content: '', template_type: 'newsletter' });
      setEditingTemplate(null);
      loadTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error('Kunde inte spara mall');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      template_type: template.template_type,
    });
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna mall?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Mall borttagen');
      loadTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error('Kunde inte ta bort mall');
    }
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', content: '', template_type: 'newsletter' });
  };

  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case 'newsletter': return 'Nyhetsbrev';
      case 'order_confirmation': return 'Orderbekräftelse';
      case 'test_email': return 'Test E-post';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">E-postmallar</h1>
          <p className="text-muted-foreground">Hantera mallar för nyhetsbrev och orderbekräftelser</p>
        </div>
      </div>

      {/* Template Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingTemplate ? 'Redigera mall' : 'Skapa ny mall'}
          </CardTitle>
          <CardDescription>
            Skapa och redigera e-postmallar med formatering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Namn på mall *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="T.ex. Välkomstbrev"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_type">Typ av mall *</Label>
              <Select
                value={formData.template_type}
                onValueChange={(value) => setFormData({ ...formData, template_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newsletter">Nyhetsbrev</SelectItem>
                  <SelectItem value="order_confirmation">Orderbekräftelse</SelectItem>
                  <SelectItem value="test_email">Test E-post</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Ämnesrad *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Ämne för e-posten"
            />
          </div>

          <div className="space-y-2">
            <Label>Innehåll *</Label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Skriv ditt e-postmeddelande här..."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {editingTemplate ? 'Uppdatera' : 'Spara'}
            </Button>
            {editingTemplate && (
              <Button variant="outline" onClick={handleCancel}>
                Avbryt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Befintliga mallar</h2>
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {template.name}
                    <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                      {getTemplateTypeLabel(template.template_type)}
                    </span>
                  </CardTitle>
                  <CardDescription>{template.subject}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-foreground [&_strong]:text-foreground [&_em]:text-foreground" 
                dangerouslySetInnerHTML={{ __html: template.content }} 
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}