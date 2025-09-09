import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TestOrderEmail = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async () => {
    if (!email) {
      toast.error('Ange en e-postadress');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-order-email', {
        body: { customer_email: email }
      });

      if (error) throw error;

      toast.success('Test-mejl skickat! Kontrollera din inkorg.');
      console.log('Test email result:', data);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Fel vid skickande av test-mejl: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Testa Orderbekräftelse</CardTitle>
        <CardDescription>
          Skicka ett test-mejl för att kontrollera orderbekräftelse-funktionen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">E-postadress</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="din@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button 
          onClick={sendTestEmail} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Skickar...' : 'Skicka Test-mejl'}
        </Button>
      </CardContent>
    </Card>
  );
};