import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published_date: string;
  featured_image_url?: string;
  author: string;
  tags?: string[];
}

interface BlogListProps {
  filterTag?: string;
}

export const BlogList = ({ filterTag }: BlogListProps) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('Fetching blog posts...', filterTag ? `filtered by tag: ${filterTag}` : '');
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, slug, published_date, featured_image_url, author, tags')
          .eq('is_published', true)
          .order('published_date', { ascending: false });

        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }

        console.log('Fetched posts:', data);
        
        // Filter by tag if provided
        let filteredData = data || [];
        if (filterTag && data) {
          filteredData = data.filter(post => 
            post.tags && Array.isArray(post.tags) && 
            post.tags.some(tag => tag.toLowerCase() === filterTag.toLowerCase())
          );
        }
        
        setPosts(filteredData);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filterTag]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-12 py-20">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={filterTag ? "" : "max-w-4xl mx-auto px-12 py-20"}>
      {!filterTag && (
        <h1 className="text-4xl font-heading font-medium mb-12 text-foreground">Alla inlägg</h1>
      )}
      
      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          {filterTag 
            ? `Inga inlägg hittades med taggen "${filterTag}".`
            : "Inga inlägg hittades. Kontrollera konsollen för felbuggar."
          }
        </p>
      ) : (
        <div className="space-y-12">
          {posts.map((post) => {
            const isNew = new Date(post.published_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            return (
              <Link key={post.id} to={`/blogg/${post.slug}`} className="block">
                <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-300">
                  {post.featured_image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img 
                        src={post.featured_image_url} 
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <time>{new Date(post.published_date).toLocaleDateString('sv-SE', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</time>
                      <span>•</span>
                      <span>{post.author}</span>
                      {isNew && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="bg-accent/10 text-accent text-xs animate-pulse">
                            Nytt
                          </Badge>
                        </>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-accent transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Link 
                            key={tag} 
                            to={`/blogg/tag/${encodeURIComponent(tag)}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Badge 
                              variant="secondary" 
                              className="text-xs hover:bg-accent/20 cursor-pointer transition-colors"
                            >
                              {tag}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};