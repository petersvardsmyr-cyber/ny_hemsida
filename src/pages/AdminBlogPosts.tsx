import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUpDown, Star, Search } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  is_published: boolean;
  is_featured: boolean;
  published_date: string;
  author: string;
  tags: string[];
}

type SortOption = 'newest' | 'oldest' | 'recent' | 'title-asc' | 'title-desc';
type FilterOption = 'all' | 'published' | 'drafts';

export default function AdminBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const filteredPosts = posts.filter(post => {
    // Filter by publish status
    if (filter === 'published' && !post.is_published) return false;
    if (filter === 'drafts' && post.is_published) return false;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = post.title?.toLowerCase().includes(query);
      const matchesExcerpt = post.excerpt?.toLowerCase().includes(query);
      const matchesTags = post.tags?.some(tag => tag.toLowerCase().includes(query));
      const matchesAuthor = post.author?.toLowerCase().includes(query);
      return matchesTitle || matchesExcerpt || matchesTags || matchesAuthor;
    }
    
    return true;
  });

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, is_published, is_featured, published_date, author, tags')
        .order('is_featured', { ascending: false }); // Featured posts always first

      // Apply secondary sorting based on selected option
      switch (sortBy) {
        case 'newest':
          query = query.order('published_date', { ascending: false });
          break;
        case 'oldest':
          query = query.order('published_date', { ascending: true });
          break;
        case 'title-asc':
          query = query.order('title', { ascending: true });
          break;
        case 'title-desc':
          query = query.order('title', { ascending: false });
          break;
        case 'recent':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

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
          <h1 className="text-3xl font-bold">Blogginlägg</h1>
        </div>
        <div>Laddar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Blogginlägg</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sortera efter..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Senast skapade</SelectItem>
              <SelectItem value="newest">Nyast datum</SelectItem>
              <SelectItem value="oldest">Äldst datum</SelectItem>
              <SelectItem value="title-asc">Titel A-Ö</SelectItem>
              <SelectItem value="title-desc">Titel Ö-A</SelectItem>
            </SelectContent>
          </Select>
          <Link to="/admin/posts/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nytt inlägg
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Sök bland inlägg..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={filter} onValueChange={(value: FilterOption) => setFilter(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Alla ({posts.length})</TabsTrigger>
          <TabsTrigger value="published">Publicerade ({posts.filter(p => p.is_published).length})</TabsTrigger>
          <TabsTrigger value="drafts">Utkast ({posts.filter(p => !p.is_published).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="grid gap-4">
            {filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      {filter === 'drafts' ? 'Inga utkast än.' : 
                       filter === 'published' ? 'Inga publicerade inlägg än.' : 
                       'Inga blogginlägg än.'}
                    </p>
                    <Link to="/admin/posts/new">
                      <Button>
                        {filter === 'drafts' ? 'Skapa ditt första utkast' : 'Skapa ditt första inlägg'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      <Link 
                        to={`/admin/posts/edit/${post.id}`}
                        className="hover:underline hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                      {post.is_featured && (
                        <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                          <Star className="h-3 w-3 mr-1 fill-amber-500" />
                          Utvalt
                        </Badge>
                      )}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}