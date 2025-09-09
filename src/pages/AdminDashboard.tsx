import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, BookOpen, Mail, Plus, Users, Eye, Package } from 'lucide-react';
import { TestOrderEmail } from "@/components/TestOrderEmail";

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  totalProducts: number;
  totalSubscribers: number;
  totalOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    totalProducts: 0,
    totalSubscribers: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch blog posts stats
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('is_published');
      
      if (postsError) throw postsError;

      // Fetch products stats
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id');
      
      if (productsError) throw productsError;

      // Fetch newsletter subscribers stats
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('is_active', true);
      
      if (subscribersError) throw subscribersError;

      // Fetch orders stats
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id');
      
      if (ordersError) throw ordersError;

      const totalPosts = postsData?.length || 0;
      const publishedPosts = postsData?.filter(post => post.is_published).length || 0;
      const totalProducts = productsData?.length || 0;
      const totalSubscribers = subscribersData?.length || 0;
      const totalOrders = ordersData?.length || 0;

      setStats({
        totalPosts,
        publishedPosts,
        totalProducts,
        totalSubscribers,
        totalOrders
      });
    } catch (error) {
      toast({
        title: "Fel vid hämtning av statistik",
        description: "Kunde inte hämta dashboard-statistik.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div>Laddar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Översikt</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Blogginlägg
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedPosts} publicerade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produkter
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              I butiken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Beställningar
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Totalt antal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nyhetsbrev
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              Aktiva prenumeranter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Webbplats
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">Visa webbplats</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Blogginlägg
            </CardTitle>
            <CardDescription>
              Hantera dina blogginlägg och artiklar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/posts">
              <Button variant="outline" className="w-full">
                Visa alla inlägg
              </Button>
            </Link>
            <Link to="/admin/posts/new">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Nytt inlägg
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Butik
            </CardTitle>
            <CardDescription>
              Hantera produkter, beställningar och nyhetsbrev
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/products">
              <Button variant="outline" className="w-full">
                Hantera produkter
              </Button>
            </Link>
            <Link to="/admin/orders">
              <Button variant="outline" className="w-full">
                Visa beställningar
              </Button>
            </Link>
            <Link to="/admin/newsletter">
              <Button variant="outline" className="w-full">
                Nyhetsbrevsprenumeranter
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-post Test
            </CardTitle>
            <CardDescription>
              Testa orderbekräftelse-mejl
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestOrderEmail />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}