import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { MessageCircle, Send } from 'lucide-react';

interface Comment {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
}

interface BlogCommentsProps {
  postId: string;
}

const RATE_LIMIT_KEY = 'blog_comment_last_post';
const RATE_LIMIT_MS = 60000; // 1 minute

const BlogComments = ({ postId }: BlogCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Hidden field for bots

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - if filled, silently reject (bot detected)
    if (honeypot) {
      toast.success('Kommentar publicerad!'); // Fake success to fool bots
      setContent('');
      setName('');
      setShowForm(false);
      return;
    }

    // Rate limiting check
    const lastPost = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastPost) {
      const timeSince = Date.now() - parseInt(lastPost, 10);
      if (timeSince < RATE_LIMIT_MS) {
        const secondsLeft = Math.ceil((RATE_LIMIT_MS - timeSince) / 1000);
        toast.error(`Vänta ${secondsLeft} sekunder innan du kan kommentera igen`);
        return;
      }
    }
    
    if (!content.trim()) {
      toast.error('Skriv en kommentar');
      return;
    }

    if (content.length > 1000) {
      toast.error('Kommentaren får max vara 1000 tecken');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('blog_comments')
      .insert({
        post_id: postId,
        author_name: name.trim() || null,
        content: content.trim()
      });

    if (error) {
      console.error('Error posting comment:', error);
      toast.error('Kunde inte posta kommentaren');
    } else {
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      toast.success('Kommentar publicerad!');
      setName('');
      setContent('');
      setHoneypot('');
      setShowForm(false);
      fetchComments();
    }

    setSubmitting(false);
  };

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Kommentarer ({comments.length})
        </h3>
        {!showForm && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowForm(true)}
          >
            Skriv kommentar
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 p-4 bg-muted/30 rounded-lg">
          {/* Honeypot field - hidden from users, visible to bots */}
          <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
            <Input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder="Ditt namn (valfritt)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="bg-background"
            />
          </div>
          <div>
            <Textarea
              placeholder="Din kommentar..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              maxLength={1000}
              className="bg-background min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {content.length}/1000
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} size="sm">
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Publicerar...' : 'Publicera'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setShowForm(false);
                setContent('');
                setName('');
              }}
            >
              Avbryt
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Laddar kommentarer...</p>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-sm">Inga kommentarer ännu. Bli först att kommentera!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">
                  {comment.author_name || 'Anonym'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { 
                    addSuffix: true, 
                    locale: sv 
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogComments;
