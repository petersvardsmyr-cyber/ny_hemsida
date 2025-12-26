import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Star } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published_date: string;
  author: string;
  featured_image_url: string;
  is_featured: boolean;
  comment_count?: number;
  tags?: string[];
}

export const BlogPosts = () => {
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_PAGE = 3;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // First, fetch the featured post
        const { data: featuredData, error: featuredError } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, slug, published_date, author, featured_image_url, is_featured, tags')
          .eq('is_published', true)
          .eq('is_featured', true)
          .limit(1)
          .maybeSingle();

        // Fetch all tags from all published posts
        const { data: allPostsForTags } = await supabase
          .from('blog_posts')
          .select('tags')
          .eq('is_published', true);

        if (allPostsForTags) {
          const tagCounts = new Map<string, number>();
          allPostsForTags.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
              });
            }
          });
        // Sort by count (descending) and take top 10
        const sortedTags = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag]) => tag);
          setAllTags(sortedTags);
        }

        if (featuredError) {
          console.error('Error fetching featured post:', featuredError);
        }

        let featuredWithComments: BlogPost | null = null;
        if (featuredData) {
          const { count } = await supabase
            .from('blog_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', featuredData.id);
          featuredWithComments = { ...featuredData, comment_count: count || 0 };
          setFeaturedPost(featuredWithComments);
        }

        // Fetch regular posts, excluding featured one
        let query = supabase
          .from('blog_posts')
          .select('id, title, excerpt, slug, published_date, author, featured_image_url, is_featured, tags')
          .eq('is_published', true)
          .order('published_date', { ascending: false })
          .limit(POSTS_PER_PAGE);

        if (featuredData) {
          query = query.neq('id', featuredData.id);
        }

        const { data, error } = await query;

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
      // Calculate the correct offset considering the featured post is excluded
      const offset = posts.length + (featuredPost ? 1 : 0);
      
      let query = supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, published_date, author, featured_image_url, is_featured, tags')
        .eq('is_published', true)
        .order('published_date', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (featuredPost) {
        query = query.neq('id', featuredPost.id);
      }

      const { data, error } = await query;

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
      {/* Featured Post */}
      {featuredPost && (
        <Link to={`/blogg/${featuredPost.slug}`} className="block mb-12 md:mb-16">
          <article className="group cursor-pointer animate-fade-in border border-border/50 rounded-xl p-4 md:p-6 bg-muted/60">
            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="uppercase tracking-wider">Utvalt inlägg</span>
            </div>
            {featuredPost.featured_image_url && (
              <div className="w-full h-48 sm:h-56 md:h-64 mb-4 md:mb-5">
                <img 
                  src={featuredPost.featured_image_url} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            <h3 className="text-lg md:text-xl font-heading font-medium mb-2 md:mb-3 group-hover:text-accent transition-all duration-300 group-hover:translate-x-1">
              {featuredPost.title}
            </h3>
            <div className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 flex items-center gap-2 flex-wrap">
              <span>{new Date(featuredPost.published_date).toLocaleDateString('sv-SE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              {new Date(featuredPost.published_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="bg-accent/10 text-accent text-xs animate-pulse">
                    Nytt
                  </Badge>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                {featuredPost.comment_count && featuredPost.comment_count > 0 && featuredPost.comment_count}
              </span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
              {featuredPost.excerpt}
            </p>
          </article>
        </Link>
      )}

      {/* Tags Section */}
      {allTags.length > 0 && (
        <div className="mb-10 md:mb-12">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Utforska ämnen</h4>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Link 
                key={tag} 
                to={`/blogg/tag/${encodeURIComponent(tag)}`}
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
        </div>
      )}

      {/* Regular Posts */}
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
                    <span>•</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      {post.comment_count && post.comment_count > 0 && post.comment_count}
                    </span>
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