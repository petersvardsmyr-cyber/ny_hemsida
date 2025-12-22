import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published_date: string;
  author: string;
  featured_image_url: string;
  comment_count?: number;
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

        // Fetch comment counts for all posts
        const postsWithComments = await Promise.all(
          (data || []).map(async (post) => {
            const { count } = await supabase
              .from('blog_comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);
            return { ...post, comment_count: count || 0 };
          })
        );

        setPosts(postsWithComments);
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

      // Fetch comment counts for loaded posts
      const postsWithComments = await Promise.all(
        (data || []).map(async (post) => {
          const { count } = await supabase
            .from('blog_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
          return { ...post, comment_count: count || 0 };
        })
      );

      // Add a small delay for smoother animation
      setTimeout(() => {
        if (postsWithComments.length > 0) {
          setPosts(prev => [...prev, ...postsWithComments]);
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
      <div className="space-y-8 md:space-y-12">
      {[1, 2, 3].map((i) => (
        <article key={i} className="animate-pulse">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <div className="w-full sm:w-32 h-32 sm:h-24 bg-muted rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-3 md:h-4 bg-muted rounded w-20 md:w-24 mb-2 md:mb-3"></div>
              <div className="h-5 md:h-6 bg-muted rounded w-3/4 mb-3 md:mb-4"></div>
              <div className="h-3 md:h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 md:h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </article>
      ))}
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-12 md:space-y-16 transition-all duration-500">
        {posts.map((post, index) => {
          const isNewPost = index >= posts.length - POSTS_PER_PAGE && posts.length > POSTS_PER_PAGE && !loadingMore;
          return (
            <Link key={post.id} to={`/blogg/${post.slug}`} className="block">
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
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 min-h-[120px]">
                {post.featured_image_url && (
                  <div className="w-full sm:w-32 h-32 sm:h-24 flex-shrink-0">
                    <img 
                      src={post.featured_image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg md:text-xl font-heading font-medium mb-2 group-hover:text-accent transition-all duration-300 group-hover:translate-x-1">
                    {post.title}
                  </h3>
                  <div className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 flex items-center gap-2 flex-wrap">
                    <span>{new Date(post.published_date).toLocaleDateString('sv-SE', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    {new Date(post.published_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="bg-accent/10 text-accent text-xs animate-pulse">
                          Nytt
                        </Badge>
                      </>
                    )}
                    {post.comment_count && post.comment_count > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          {post.comment_count}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed flex-1">
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
        <div className="space-y-12 md:space-y-16 mt-16 md:mt-20">
          {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
            <article key={`skeleton-${i}`} className="animate-pulse">
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 min-h-[120px]">
                <div className="w-full sm:w-32 h-32 sm:h-24 bg-muted rounded-lg flex-shrink-0"></div>
                <div className="flex-1 flex flex-col">
                  <div className="h-5 md:h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 md:h-4 bg-muted rounded w-24 md:w-32 mb-3 md:mb-4"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 md:h-4 bg-muted rounded w-full"></div>
                    <div className="h-3 md:h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-3 md:h-4 bg-muted rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div className="flex justify-center mt-12 md:mt-16">
          <Button 
            variant="outline" 
            onClick={loadMorePosts}
            disabled={loadingMore}
            className="px-6 md:px-8 py-2 text-sm md:text-base transition-all duration-300 hover:scale-105 hover:shadow-md"
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