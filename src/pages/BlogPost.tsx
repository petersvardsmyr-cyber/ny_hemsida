import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published_date: string;
  featured_image_url?: string;
  author: string;
  tags?: string[];
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error || !data) {
          console.error('Error fetching post:', error);
          setNotFound(true);
          return;
        }

        setPost(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-12 py-20">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="aspect-video mb-8">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-4xl mx-auto px-12 py-20 text-center">
        <h1 className="text-4xl font-heading font-medium mb-6 text-foreground">
          Inlägget kunde inte hittas
        </h1>
        <p className="text-muted-foreground mb-8">
          Det verkar som att det inlägg du letar efter inte finns.
        </p>
        <Button asChild>
          <Link to="/blogg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till bloggen
          </Link>
        </Button>
      </div>
    );
  }

  // Format content with proper line breaks and styling
  const formattedContent = post.content.split('\n').map((line, index) => {
    if (line.trim() === '') {
      return <br key={index} />;
    }
    
    // Handle headings
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-2xl font-heading font-medium mt-8 mb-4 text-foreground">
          {line.replace('## ', '')}
        </h2>
      );
    }
    
    // Handle bold paragraphs
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={index} className="text-lg leading-relaxed mb-6 font-semibold">
          {line.replace(/\*\*/g, '')}
        </p>
      );
    }
    
    // Handle regular paragraphs with inline bold
    const processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return (
      <p key={index} className="text-lg leading-relaxed mb-6 text-foreground" dangerouslySetInnerHTML={{ __html: processedLine }} />
    );
  });

  return (
    <article className="max-w-4xl mx-auto px-12 py-20">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/blogg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till bloggen
        </Link>
      </Button>

      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-medium mb-6 text-foreground leading-tight">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
          <time className="text-sm">
            {new Date(post.published_date).toLocaleDateString('sv-SE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span>•</span>
          <span className="text-sm">{post.author}</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {post.featured_image_url && (
          <div className="aspect-video overflow-hidden rounded-lg mb-8">
            <img 
              src={post.featured_image_url} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none">
        {formattedContent}
      </div>

      <footer className="mt-12 pt-8 border-t">
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link to="/blogg">Läs fler inlägg</Link>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Publicerad {new Date(post.published_date).toLocaleDateString('sv-SE')}
          </div>
        </div>
      </footer>
    </article>
  );
};

export default BlogPost;