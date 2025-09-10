import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Mail, User, Globe } from 'lucide-react';

export default function AdminEmailSettings() {
  const [settings, setSettings] = useState({
    fromEmail: 'hej@petersvardsmyr.se',
    fromName: 'Peter Svärdsmyr',
    replyToEmail: 'hej@petersvardsmyr.se',
    adminEmail: 'hej@petersvardsmyr.se',
    emailSignature: `
Med vänliga hälsningar,
Peter Svärdsmyr

---
Denna e-post skickades automatiskt från petersvardsmyr.se
    `.trim(),
    enableOrderNotifications: true,
    enableNewsletterWelcome: true,
    enableTestEmails: true,
    maxEmailsPerHour: 100
  });
  
  const { toast } = useToast();

  const handleSave = () => {
    // In a real application, you would save these settings to a database
    // For now, we'll just show a success message
    toast({
      title: "Inställningar sparade",
      description: "E-postinställningarna har uppdaterats.",
    });
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">E-postinställningar</h1>
          <p className="text-muted-foreground">Konfigurera inställningar för e-postutskick</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grundläggande inställningar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Grundläggande inställningar
            </CardTitle>
            <CardDescription>
              Konfigurera avsändarinformation och e-postadresser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="fromEmail">Avsändarens e-postadress</Label>
                <Input
                  id="fromEmail"
                  value={settings.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  placeholder="hej@petersvardsmyr.se"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Denna adress används som avsändare för alla e-post
                </p>
              </div>
              
              <div>
                <Label htmlFor="fromName">Avsändarens namn</Label>
                <Input
                  id="fromName"
                  value={settings.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  placeholder="Peter Svärdsmyr"
                />
              </div>
              
              <div>
                <Label htmlFor="replyToEmail">Svara-till-adress</Label>
                <Input
                  id="replyToEmail"
                  value={settings.replyToEmail}
                  onChange={(e) => handleInputChange('replyToEmail', e.target.value)}
                  placeholder="hej@petersvardsmyr.se"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Mottagarna svarar till denna adress
                </p>
              </div>
              
              <div>
                <Label htmlFor="adminEmail">Admin e-postadress</Label>
                <Input
                  id="adminEmail"
                  value={settings.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  placeholder="hej@petersvardsmyr.se"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Orderbekräftelser och notiser skickas även till denna adress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funktionsinställningar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Funktionsinställningar
            </CardTitle>
            <CardDescription>
              Aktivera eller inaktivera olika e-postfunktioner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Orderbekräftelser</Label>
                <p className="text-sm text-muted-foreground">
                  Skicka automatiska bekräftelser vid order
                </p>
              </div>
              <Switch
                checked={settings.enableOrderNotifications}
                onCheckedChange={(checked) => handleInputChange('enableOrderNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nyhetsbrevs-välkomstmeddelanden</Label>
                <p className="text-sm text-muted-foreground">
                  Skicka välkomstmeddelande till nya prenumeranter
                </p>
              </div>
              <Switch
                checked={settings.enableNewsletterWelcome}
                onCheckedChange={(checked) => handleInputChange('enableNewsletterWelcome', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Test-e-post</Label>
                <p className="text-sm text-muted-foreground">
                  Tillåt skickning av test-e-post
                </p>
              </div>
              <Switch
                checked={settings.enableTestEmails}
                onCheckedChange={(checked) => handleInputChange('enableTestEmails', checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="maxEmails">Max e-post per timme</Label>
              <Input
                id="maxEmails"
                type="number"
                value={settings.maxEmailsPerHour}
                onChange={(e) => handleInputChange('maxEmailsPerHour', parseInt(e.target.value))}
                placeholder="100"
                min="1"
                max="1000"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Begränsar antal e-post som kan skickas per timme
              </p>
            </div>
          </CardContent>
        </Card>

        {/* E-postsignatur */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              E-postsignatur
            </CardTitle>
            <CardDescription>
              Standard signatur som läggs till i alla utskick
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="signature">Signatur</Label>
              <Textarea
                id="signature"
                value={settings.emailSignature}
                onChange={(e) => handleInputChange('emailSignature', e.target.value)}
                rows={6}
                placeholder="Skriv din e-postsignatur här..."
              />
              <p className="text-sm text-muted-foreground mt-1">
                Denna text läggs automatiskt till i slutet av alla e-postmeddelanden
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resend Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Resend konfiguration
            </CardTitle>
            <CardDescription>
              Information om Resend-inställningar för e-postleverans
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Viktigt att kontrollera:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Domänen <strong>petersvardsmyr.se</strong> måste vara verifierad i Resend</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>RESEND_API_KEY måste vara korrekt konfigurerad i Supabase Edge Functions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>DNS-poster (SPF, DKIM, DMARC) måste vara korrekta för bästa leveransgrad</span>
                </li>
              </ul>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Logga in på <strong>resend.com</strong> för att:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Verifiera din domän</li>
                <li>Kontrollera DNS-inställningar</li>
                <li>Övervaka e-postleveranser</li>
                <li>Se statistik över skickade e-post</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Spara inställningar
        </Button>
      </div>
    </div>
  );
}