import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, PenTool, Home, Plus, List, Menu, X, FileText, BookOpen, Mail, Package, ChevronDown, ChevronRight, Bell, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogMenuOpen, setBlogMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [newsletterMenuOpen, setNewsletterMenuOpen] = useState(false);
  const [emailMenuOpen, setEmailMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Utloggad",
      description: "Du har loggats ut från admin-panelen.",
    });
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isBlogSectionActive = () => {
    return location.pathname.includes('/admin/posts');
  };

  const isShopSectionActive = () => {
    return location.pathname.includes('/admin/products') || 
           location.pathname.includes('/admin/orders');
  };

  const isNewsletterSectionActive = () => {
    return location.pathname.includes('/admin/newsletter');
  };

  const isEmailSectionActive = () => {
    return location.pathname.includes('/admin/email-notifications') || 
           location.pathname.includes('/admin/order-notifications') || 
           location.pathname.includes('/admin/newsletter-notifications') ||
           location.pathname.includes('/admin/email-settings');
  };

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
                  Översikt
                </Button>
              </Link>
              
              {/* Blogg Section */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${isBlogSectionActive() ? 'bg-muted' : ''}`}
                  onClick={() => setBlogMenuOpen(!blogMenuOpen)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Blogg
                  {blogMenuOpen ? 
                    <ChevronDown className="ml-auto h-4 w-4" /> : 
                    <ChevronRight className="ml-auto h-4 w-4" />
                  }
                </Button>
                
                {blogMenuOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    <Link to="/admin/posts" onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive('/admin/posts') ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Blogginlägg
                      </Button>
                    </Link>
                    
                    <Link to="/admin/posts/new" onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive('/admin/posts/new') ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Nytt inlägg
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Butik Section */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${isShopSectionActive() ? 'bg-muted' : ''}`}
                  onClick={() => setShopMenuOpen(!shopMenuOpen)}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Butik
                  {shopMenuOpen ? 
                    <ChevronDown className="ml-auto h-4 w-4" /> : 
                    <ChevronRight className="ml-auto h-4 w-4" />
                  }
                </Button>
                
                {shopMenuOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    <Link to="/admin/products" onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive('/admin/products') ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Produkter
                      </Button>
                    </Link>
                    
                    <Link to="/admin/orders" onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive('/admin/orders') ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Beställningar
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Nyhetsbrev Section */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${isNewsletterSectionActive() ? 'bg-muted' : ''}`}
                  onClick={() => setNewsletterMenuOpen(!newsletterMenuOpen)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Nyhetsbrev
                  {newsletterMenuOpen ? 
                    <ChevronDown className="ml-auto h-4 w-4" /> : 
                    <ChevronRight className="ml-auto h-4 w-4" />
                  }
                </Button>
                
                {newsletterMenuOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    <Link to="/admin/newsletter" onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={location.pathname === '/admin/newsletter' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Skicka nyhetsbrev
                      </Button>
                    </Link>
                    
                    <Link to="/admin/newsletter/sent" onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive('/admin/newsletter/sent') ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <List className="mr-2 h-4 w-4" />
                        Skickade nyhetsbrev
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* E-postnotiser Section */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${isEmailSectionActive() ? 'bg-muted' : ''}`}
                  onClick={() => setEmailMenuOpen(!emailMenuOpen)}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  E-postnotiser
                  {emailMenuOpen ? 
                    <ChevronDown className="ml-auto h-4 w-4" /> : 
                    <ChevronRight className="ml-auto h-4 w-4" />
                  }
                </Button>
                
                {emailMenuOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    <Link to="/admin/order-notifications" onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive('/admin/order-notifications') ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Orderbekräftelser
                      </Button>
                    </Link>
                    
                    <Link to="/admin/newsletter-notifications" onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive('/admin/newsletter-notifications') ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Nyhetsbrevbekräftelser
                      </Button>
                    </Link>
                    
                    <Link to="/admin/email-settings" onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive('/admin/email-settings') ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Inställningar
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
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