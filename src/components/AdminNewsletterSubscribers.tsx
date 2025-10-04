import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Users, Mail, Pencil, Trash2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  subscribed_at: string;
}

export function AdminNewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', is_active: true });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadSubscribers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      console.error('Error loading subscribers:', error);
      toast.error('Kunde inte ladda prenumeranter');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleEdit = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
    setEditForm({
      name: subscriber.name || '',
      email: subscriber.email,
      is_active: subscriber.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingSubscriber) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          name: editForm.name || null,
          email: editForm.email,
          is_active: editForm.is_active
        })
        .eq('id', editingSubscriber.id);

      if (error) throw error;

      toast.success('Prenumerant uppdaterad');
      setIsDialogOpen(false);
      loadSubscribers();
    } catch (error: any) {
      console.error('Error updating subscriber:', error);
      toast.error('Kunde inte uppdatera prenumerant');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna prenumerant?')) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Prenumerant borttagen');
      loadSubscribers();
    } catch (error: any) {
      console.error('Error deleting subscriber:', error);
      toast.error('Kunde inte ta bort prenumerant');
    }
  };

  const handleResendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-confirmation-email', {
        body: { email }
      });

      if (error) throw error;

      toast.success('Bekräftelsemail skickat', {
        description: `Ett nytt bekräftelsemail har skickats till ${email}`
      });
    } catch (error: any) {
      console.error('Error sending confirmation:', error);
      toast.error('Kunde inte skicka bekräftelsemail');
    }
  };

  const activeCount = subscribers.filter(s => s.is_active).length;
  const inactiveCount = subscribers.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt prenumeranter</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiva</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inaktiva</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prenumeranter</CardTitle>
          <CardDescription>
            Hantera alla dina nyhetsbrevsprenumeranter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Laddar prenumeranter...</p>
          ) : subscribers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Inga prenumeranter ännu</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prenumererad</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>{subscriber.name || '-'}</TableCell>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        subscriber.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {subscriber.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(subscriber.subscribed_at).toLocaleDateString('sv-SE')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(subscriber)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!subscriber.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendConfirmation(subscriber.email)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(subscriber.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redigera prenumerant</DialogTitle>
            <DialogDescription>
              Uppdatera information för prenumeranten
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Namn</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Ange namn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-post</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="namn@exempel.se"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={editForm.is_active}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
              />
              <Label htmlFor="edit-active">Aktiv prenumeration</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={handleSave}>
                Spara ändringar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
