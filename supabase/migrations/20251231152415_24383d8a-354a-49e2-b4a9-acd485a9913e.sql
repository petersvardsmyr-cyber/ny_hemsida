-- Add parent_id column for comment replies
ALTER TABLE public.blog_comments 
ADD COLUMN parent_id uuid REFERENCES public.blog_comments(id) ON DELETE CASCADE;