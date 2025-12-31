import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { MessageCircle, Send, ThumbsUp } from 'lucide-react';

interface Comment {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
  likes: number;
  parent_id: string | null;
}

interface BlogCommentsProps {
  postId: string;
}

const RATE_LIMIT_KEY = 'blog_comment_last_post';
const RATE_LIMIT_MS = 60000; // 1 minute
const LIKED_COMMENTS_KEY = 'blog_liked_comments';

const getLikedComments = (): string[] => {
  try {
    const stored = localStorage.getItem(LIKED_COMMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLikedComment = (commentId: string) => {
  const liked = getLikedComments();
  if (!liked.includes(commentId)) {
    liked.push(commentId);
    localStorage.setItem(LIKED_COMMENTS_KEY, JSON.stringify(liked));
  }
};

const BlogComments = ({ postId }: BlogCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Hidden field for bots
  const [likedComments, setLikedComments] = useState<string[]>([]);

  useEffect(() => {
    fetchComments();
    setLikedComments(getLikedComments());
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

  // Group comments: top-level and replies
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  const handleLike = async (commentId: string, currentLikes: number) => {
    if (likedComments.includes(commentId)) {
      return; // Already liked
    }

    // Optimistic update
    setComments(prev => 
      prev.map(c => c.id === commentId ? { ...c, likes: currentLikes + 1 } : c)
    );
    setLikedComments(prev => [...prev, commentId]);
    saveLikedComment(commentId);

    const { error } = await supabase
      .from('blog_comments')
      .update({ likes: currentLikes + 1 })
      .eq('id', commentId);

    if (error) {
      console.error('Error liking comment:', error);
      // Revert on error
      setComments(prev => 
        prev.map(c => c.id === commentId ? { ...c, likes: currentLikes } : c)
      );
      setLikedComments(prev => prev.filter(id => id !== commentId));
    }
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
        content: content.trim(),
        parent_id: replyingTo?.id || null
      });

    if (error) {
      console.error('Error posting comment:', error);
      toast.error('Kunde inte posta kommentaren');
    } else {
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      toast.success(replyingTo ? 'Svar publicerat!' : 'Kommentar publicerad!');
      setName('');
      setContent('');
      setHoneypot('');
      setShowForm(false);
      setReplyingTo(null);
      fetchComments();
    }

    setSubmitting(false);
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setReplyingTo(null);
    setContent('');
    setName('');
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
          {replyingTo && (
            <div className="text-sm text-muted-foreground mb-2">
              Svarar på <span className="font-medium">{replyingTo.author_name || 'Anonym'}</span>
            </div>
          )}
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
              placeholder={replyingTo ? "Ditt svar..." : "Din kommentar..."}
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
              {submitting ? 'Publicerar...' : (replyingTo ? 'Svara' : 'Publicera')}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={cancelForm}
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
          {topLevelComments.map((comment) => {
            const hasLiked = likedComments.includes(comment.id);
            const replies = getReplies(comment.id);
            return (
              <div key={comment.id}>
                <div className="p-4 bg-muted/20 rounded-lg">
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
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">
                    {comment.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleReply(comment)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Svara
                    </button>
                    <button
                      onClick={() => handleLike(comment.id, comment.likes)}
                      disabled={hasLiked}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        hasLiked 
                          ? 'text-accent cursor-default' 
                          : 'text-muted-foreground hover:text-accent'
                      }`}
                      title={hasLiked ? 'Du har redan gillat denna kommentar' : 'Gilla kommentar'}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                  </div>
                </div>
                {/* Replies */}
                {replies.length > 0 && (
                  <div className="ml-6 mt-2 space-y-2 border-l-2 border-muted pl-4">
                    {replies.map((reply) => {
                      const hasLikedReply = likedComments.includes(reply.id);
                      return (
                        <div key={reply.id} className="p-3 bg-muted/10 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {reply.author_name || 'Anonym'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.created_at), { 
                                addSuffix: true, 
                                locale: sv 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-2">
                            {reply.content}
                          </p>
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => handleLike(reply.id, reply.likes)}
                              disabled={hasLikedReply}
                              className={`flex items-center gap-1.5 text-xs transition-colors ${
                                hasLikedReply 
                                  ? 'text-accent cursor-default' 
                                  : 'text-muted-foreground hover:text-accent'
                              }`}
                              title={hasLikedReply ? 'Du har redan gillat denna kommentar' : 'Gilla kommentar'}
                            >
                              <ThumbsUp className={`h-3.5 w-3.5 ${hasLikedReply ? 'fill-current' : ''}`} />
                              {reply.likes > 0 && <span>{reply.likes}</span>}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BlogComments;
