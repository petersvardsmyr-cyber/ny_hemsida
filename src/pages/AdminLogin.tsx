import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Försöker:', isSignUp ? 'registrera' : 'logga in', 'med email:', email);

    try {
      const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
      
      console.log('Resultat:', { error, isSignUp });
      
      if (error) {
        toast({
          title: isSignUp ? "Registrering misslyckades" : "Inloggning misslyckades",
          description: error.message === 'Invalid login credentials' 
            ? "Ogiltiga inloggningsuppgifter" 
            : error.message === 'User already registered'
            ? "Användaren är redan registrerad"
            : error.message,
          variant: "destructive",
        });
      } else {
        if (isSignUp) {
          toast({
            title: "Konto skapat!",
            description: "Kontrollera din e-post för att verifiera kontot.",
          });
        } else {
          toast({
            title: "Välkommen!",
            description: "Du är nu inloggad i admin-panelen.",
          });
          navigate('/admin');
        }
      }
    } catch (error) {
      toast({
        title: "Ett fel uppstod",
        description: "Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isSignUp ? 'Skapa Admin-konto' : 'Admin Login'}
          </CardTitle>
          <CardDescription>
            {isSignUp ? 'Skapa ditt första admin-konto' : 'Logga in för att hantera blogginlägg'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="din@epost.se"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Skapar konto...' : 'Loggar in...'}
                </>
              ) : (
                isSignUp ? 'Skapa konto' : 'Logga in'
              )}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                className="text-sm"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Har redan ett konto? Logga in' : 'Behöver skapa ett konto? Registrera dig'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}