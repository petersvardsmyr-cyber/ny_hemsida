import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published_date: string;
  author: string;
  featured_image_url: string;
}

export const BlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_PAGE = 3;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, slug, published_date, author, featured_image_url')
          .eq('is_published', true)
          .order('published_date', { ascending: false })
          .limit(POSTS_PER_PAGE);

        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }

        setPosts(data || []);
        setHasMore(data?.length === POSTS_PER_PAGE);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, published_date, author, featured_image_url')
        .eq('is_published', true)
        .order('published_date', { ascending: false })
        .range(posts.length, posts.length + POSTS_PER_PAGE - 1);

      if (error) {
        console.error('Error fetching more posts:', error);
        return;
      }

      // Add a small delay for smoother animation
      setTimeout(() => {
        if (data && data.length > 0) {
          setPosts(prev => [...prev, ...data]);
          setHasMore(data.length === POSTS_PER_PAGE);
        } else {
          setHasMore(false);
        }
        setTimeout(() => setLoadingMore(false), 200);
      }, 300);
    } catch (err) {
      console.error('Load more error:', err);
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-48">
      {[1, 2, 3].map((i) => (
        <article key={i} className="animate-pulse">
          <div className="flex gap-6">
            <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-24 mb-3"></div>
              <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </article>
      ))}
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-64 transition-all duration-500">
        {posts.map((post, index) => {
          const isNewPost = index >= posts.length - POSTS_PER_PAGE && posts.length > POSTS_PER_PAGE && !loadingMore;
          return (
            <Link key={post.id} to={`/blogg/${post.slug}`}>
              <article className={`group cursor-pointer transition-all duration-500 ${
                isNewPost 
                  ? 'animate-fade-in opacity-0' 
                  : index < POSTS_PER_PAGE 
                    ? 'animate-fade-in' 
                    : 'opacity-100'
              }`} style={{
                animationDelay: isNewPost 
                  ? `${(index - (posts.length - POSTS_PER_PAGE)) * 200}ms`
                  : index < POSTS_PER_PAGE 
                    ? `${index * 150}ms`
                    : '0ms',
                animationFillMode: 'both'
              }}>
                <div className="flex gap-6 min-h-[120px]">
                {post.featured_image_url && (
                  <div className="w-32 h-24 flex-shrink-0">
                    <img 
                      src={post.featured_image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col mb-16">
                  <h3 className="text-xl font-heading font-medium mb-2 group-hover:text-accent transition-all duration-300 group-hover:translate-x-1">
                    {post.title}
                  </h3>
                  <div className="text-sm text-muted-foreground mb-4">
                    {new Date(post.published_date).toLocaleDateString('sv-SE', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
      
      {/* Loading skeleton for new posts */}
      {loadingMore && (
        <div className="space-y-64 mt-64">
          {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
            <article key={`skeleton-${i}`} className="animate-pulse">
              <div className="flex gap-6 min-h-[120px]">
                <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0"></div>
                <div className="flex-1 flex flex-col mb-16">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-32 mb-4"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div className="flex justify-center mt-16">
          <Button 
            variant="outline" 
            onClick={loadMorePosts}
            disabled={loadingMore}
            className="px-8 py-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            <span className={`transition-opacity duration-200 ${loadingMore ? 'opacity-50' : 'opacity-100'}`}>
              {loadingMore ? "Laddar..." : "Visa fler inlägg"}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};