import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, slug, published_date, author, featured_image_url')
          .eq('is_published', true)
          .order('published_date', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }

        setPosts(data || []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
    <div className="space-y-48">
      {posts.map((post) => (
        <Link key={post.id} to={`/blogg/${post.slug}`}>
          <article className="group cursor-pointer">
            <div className="flex gap-6">
              {post.featured_image_url && (
                <div className="w-32 h-24 flex-shrink-0">
                  <img 
                    src={post.featured_image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-heading font-medium mb-2 group-hover:text-accent transition-colors">
                  {post.title}
                </h3>
                <div className="text-sm text-muted-foreground mb-4">
                  {new Date(post.published_date).toLocaleDateString('sv-SE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
};