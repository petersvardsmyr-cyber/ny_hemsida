import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { RichTextEditor } from '@/components/RichTextEditor';
import { toast } from 'sonner';
import { Users, Send, Mail, Save, Trash2, FileText } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export function AdminNewsletter() {
  console.log('AdminNewsletter component rendering');
  
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

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

  const loadDrafts = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_drafts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
      setShowDrafts(true);
    } catch (error: any) {
      console.error('Error loading drafts:', error);
      toast.error('Kunde inte ladda utkast');
    }
  };

  const saveDraft = async () => {
    if (!subject.trim() && !content.trim()) {
      toast.error('Ämne eller innehåll krävs för att spara utkast');
      return;
    }

    setIsLoading(true);
    try {
      if (currentDraftId) {
        // Update existing draft
        const { error } = await supabase
          .from('newsletter_drafts')
          .update({ subject: subject.trim(), content: content.trim() })
          .eq('id', currentDraftId);

        if (error) throw error;
        toast.success('Utkast uppdaterat!');
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('newsletter_drafts')
          .insert({ subject: subject.trim(), content: content.trim() })
          .select()
          .single();

        if (error) throw error;
        setCurrentDraftId(data.id);
        toast.success('Utkast sparat!');
      }
      
      loadDrafts();
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error('Kunde inte spara utkast');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDraft = (draft: any) => {
    setSubject(draft.subject);
    setContent(draft.content);
    setCurrentDraftId(draft.id);
    toast.success('Utkast laddat!');
  };

  const deleteDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from('newsletter_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      if (currentDraftId === draftId) {
        setSubject('');
        setContent('');
        setCurrentDraftId(null);
      }

      toast.success('Utkast raderat!');
      loadDrafts();
    } catch (error: any) {
      console.error('Error deleting draft:', error);
      toast.error('Kunde inte radera utkast');
    } finally {
      setDraftToDelete(null);
    }
  };

  const newDraft = () => {
    setSubject('');
    setContent('');
    setCurrentDraftId(null);
  };

  const sendNewsletter = async () => {
    console.log('[Newsletter] Send start', { hasSubject: !!subject.trim(), hasContent: !!content.trim() });

    if (!subject.trim() || !content.trim()) {
      toast.error('Både ämne och innehåll krävs');
      return;
    }

    setIsLoading(true);

    try {
      const payload = { 
        subject: subject.trim(), 
        content: content.trim(), 
        from: "Peter Svärdsmyr <hej@petersvardsmyr.se>" 
      };

      const { data, error } = await supabase.functions.invoke('newsletter', { body: payload });

      if (error) throw error;

      console.log('[Newsletter] Send response', data);

      toast.success('Nyhetsbrev skickat!', {
        description: (data as any)?.message || 'Nyhetsbrevet har skickats till alla prenumeranter'
      });

      // Delete draft if it exists
      if (currentDraftId) {
        await supabase
          .from('newsletter_drafts')
          .delete()
          .eq('id', currentDraftId);
      }

      setSubject('');
      setContent('');
      setCurrentDraftId(null);
      loadDrafts();
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
        <div className="flex gap-2">
          <Button onClick={loadDrafts} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Visa utkast
          </Button>
          <Button onClick={loadSubscribers} variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Visa prenumeranter ({subscribers.length})
          </Button>
        </div>
      </div>

      {/* Drafts List */}
      {showDrafts && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Sparade utkast ({drafts.length})
                </CardTitle>
                <CardDescription>
                  Dina sparade nyhetsbrevsutkast
                </CardDescription>
              </div>
              <Button onClick={newDraft} size="sm" variant="outline">
                Nytt utkast
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {drafts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Inga utkast sparade ännu</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {drafts.map((draft) => (
                  <div 
                    key={draft.id} 
                    className={`flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors ${currentDraftId === draft.id ? 'bg-muted border-primary' : ''}`}
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => loadDraft(draft)}>
                      <p className="font-medium">{draft.subject || 'Utan ämne'}</p>
                      <p className="text-sm text-muted-foreground">
                        Senast uppdaterad: {new Date(draft.updated_at).toLocaleString('sv-SE')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDraftToDelete(draft.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
              <Label htmlFor="subject">Ämne</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Ämnesrad för nyhetsbrevet"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content">Innehåll</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Skriv innehållet för ditt nyhetsbrev här. Använd verktygsfältet för formatering och lägg till bilder."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Förhandsgranskning</Label>
                <div className="border border-input rounded-md bg-muted/30 p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
                  <style>
                    {`@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');`}
                  </style>
                  <div 
                    style={{ 
                      fontFamily: "'Crimson Text', Georgia, serif", 
                      maxWidth: '600px', 
                      margin: '0 auto',
                      color: '#000000'
                    }}
                  >
                    {subject && (
                      <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #eee' }}>
                        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 5px 0' }}>Ämne:</p>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#000' }}>{subject}</h2>
                      </div>
                    )}
                    <div 
                      dangerouslySetInnerHTML={{ __html: content || '<p style="color: #999;">Inget innehåll än...</p>' }}
                      style={{
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: '#000000'
                      }}
                      className="[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-black [&_h1]:font-['Playfair_Display',Georgia,serif] [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-black [&_h2]:font-['Playfair_Display',Georgia,serif] [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-black [&_h3]:font-['Playfair_Display',Georgia,serif] [&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-3 [&_p]:text-black [&_p]:font-['Crimson_Text',Georgia,serif] [&_strong]:font-bold [&_strong]:text-black [&_em]:italic [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_ul]:font-['Crimson_Text',Georgia,serif] [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2 [&_ol]:font-['Crimson_Text',Georgia,serif] [&_blockquote]:border-l-4 [&_blockquote]:border-gray-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:font-['Crimson_Text',Georgia,serif] [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4"
                    />
                    <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />
                    <footer style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
                      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <a href="https://petersvardsmyr.se" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                          petersvardsmyr.se
                        </a>
                      </div>
                      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <a href="mailto:hej@petersvardsmyr.se" style={{ color: '#666', textDecoration: 'none' }}>
                          hej@petersvardsmyr.se
                        </a>
                      </div>
                      <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                      <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', margin: '10px 0' }}>
                        Du får detta e-postmeddelande eftersom du prenumererar på vårt nyhetsbrev.
                      </p>
                      <p style={{ fontSize: '12px', textAlign: 'center', margin: '10px 0' }}>
                        <a href="#" style={{ color: '#666', textDecoration: 'underline' }}>
                          Avregistrera dig här
                        </a>
                      </p>
                    </footer>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={saveDraft}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {currentDraftId ? 'Uppdatera utkast' : 'Spara som utkast'}
              </Button>
              <Button 
                type="button"
                onClick={sendNewsletter}
                disabled={isLoading}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? 'Skickar...' : 'Skicka nyhetsbrev'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!draftToDelete} onOpenChange={(open) => !open && setDraftToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Radera utkast?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill radera detta utkast? Denna åtgärd kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={() => draftToDelete && deleteDraft(draftToDelete)}>
              Radera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}