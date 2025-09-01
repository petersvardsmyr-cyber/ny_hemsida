import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, PenTool, Home, Plus, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Utloggad",
      description: "Du har loggats ut från admin-panelen.",
    });
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border min-h-screen">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <PenTool className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            
            <nav className="space-y-2">
              <Link to="/">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Till webbplatsen
                </Button>
              </Link>
              
              <Link to="/admin">
                <Button
                  variant={isActive('/admin') ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                >
                  <List className="mr-2 h-4 w-4" />
                  Alla inlägg
                </Button>
              </Link>
              
              <Link to="/admin/posts/new">
                <Button
                  variant={isActive('/admin/posts/new') ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nytt inlägg
                </Button>
              </Link>
            </nav>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-sm text-muted-foreground mb-4">
              Inloggad som: {user?.email}
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logga ut
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}