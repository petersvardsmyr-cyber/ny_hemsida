import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function AdminImportSubscribers() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    skipped: number;
    errors: number;
    details: string[];
  } | null>(null);

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Endast CSV-filer är tillåtna');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const text = await file.text();
      const csvData = parseCSV(text);

      console.log(`Parsed ${csvData.length} rows from CSV`);

      const { data, error } = await supabase.functions.invoke('import-subscribers', {
        body: { csvData }
      });

      if (error) throw error;

      setResults(data.results);
      toast.success(`Import klar! ${data.results.success} prenumeranter tillagda.`);
    } catch (error) {
      console.error('Error importing subscribers:', error);
      toast.error('Kunde inte importera prenumeranter');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importera prenumeranter</CardTitle>
        <CardDescription>
          Ladda upp en CSV-fil med prenumeranter. Filen ska ha kolumnerna: email, first_name, last_name.
          Prenumeranterna läggs till som aktiva utan bekräftelsemail.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
            className="max-w-md"
          />
          <Button disabled={loading} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            {loading ? 'Importerar...' : 'Välj fil'}
          </Button>
        </div>

        {results && (
          <div className="space-y-3 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tillagda</p>
                      <p className="text-2xl font-bold">{results.success}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hoppade över</p>
                      <p className="text-2xl font-bold">{results.skipped}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fel</p>
                      <p className="text-2xl font-bold">{results.errors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {results.details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Detaljer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {results.details.slice(0, 50).map((detail, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                    {results.details.length > 50 && (
                      <p className="text-xs text-muted-foreground italic">
                        ...och {results.details.length - 50} fler
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
