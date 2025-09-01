import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, PenTool, Home, Plus, List, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile header */}
      <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          fixed lg:static 
          inset-y-0 
          left-0 
          z-50 
          w-64 
          bg-card 
          border-r 
          border-border 
          transition-transform 
          duration-300 
          ease-in-out
          ${sidebarOpen ? 'lg:min-h-screen' : 'min-h-screen'}
        `}>
          <div className="p-6">
            {/* Desktop header */}
            <div className="hidden lg:flex items-center gap-2 mb-8">
              <PenTool className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            
            {/* Mobile header inside sidebar */}
            <div className="lg:hidden flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <PenTool className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold">Admin Panel</h1>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="space-y-2">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Till webbplatsen
                </Button>
              </Link>
              
              <Link to="/admin" onClick={() => setSidebarOpen(false)}>
                <Button
                  variant={isActive('/admin') ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                >
                  <List className="mr-2 h-4 w-4" />
                  Alla inlägg
                </Button>
              </Link>
              
              <Link to="/admin/posts/new" onClick={() => setSidebarOpen(false)}>
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
            <div className="text-sm text-muted-foreground mb-4 truncate">
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

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}