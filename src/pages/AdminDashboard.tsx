import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  is_published: boolean;
  published_date: string;
  author: string;
  tags: string[];
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, is_published, published_date, author, tags')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      toast({
        title: "Fel vid hämtning av inlägg",
        description: "Kunde inte hämta blogginlägg.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.map(post => 
        post.id === id ? { ...post, is_published: !currentStatus } : post
      ));

      toast({
        title: currentStatus ? "Inlägg dolt" : "Inlägg publicerat",
        description: currentStatus ? "Inlägget är nu dolt." : "Inlägget är nu publikt.",
      });
    } catch (error) {
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte uppdatera inlägget.",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`Är du säker på att du vill radera "${title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== id));
      toast({
        title: "Inlägg raderat",
        description: "Inlägget har raderats permanent.",
      });
    } catch (error) {
      toast({
        title: "Fel vid radering",
        description: "Kunde inte radera inlägget.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Alla blogginlägg</h1>
        </div>
        <div>Laddar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Alla blogginlägg</h1>
        <Link to="/admin/posts/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nytt inlägg
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Inga blogginlägg än.</p>
                <Link to="/admin/posts/new">
                  <Button>Skapa ditt första inlägg</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {post.title}
                      {post.is_published ? (
                        <Badge variant="default">Publicerad</Badge>
                      ) : (
                        <Badge variant="secondary">Utkast</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {post.excerpt && post.excerpt.length > 100 
                        ? `${post.excerpt.substring(0, 100)}...` 
                        : post.excerpt}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <span className="whitespace-nowrap">
                      {format(new Date(post.published_date), 'PPP', { locale: sv })}
                    </span>
                    <span className="whitespace-nowrap">av {post.author}</span>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 justify-end lg:justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(post.id, post.is_published)}
                      title={post.is_published ? 'Dölj inlägg' : 'Publicera inlägg'}
                    >
                      {post.is_published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Link to={`/admin/posts/edit/${post.id}`}>
                      <Button variant="ghost" size="sm" title="Redigera inlägg">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePost(post.id, post.title)}
                      className="text-destructive hover:text-destructive"
                      title="Radera inlägg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}