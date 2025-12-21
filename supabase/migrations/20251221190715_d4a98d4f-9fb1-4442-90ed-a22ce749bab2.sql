-- Create a table for blog comments
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
CREATE POLICY "Comments are publicly readable" 
ON public.blog_comments 
FOR SELECT 
USING (true);

-- Allow anyone to insert comments
CREATE POLICY "Anyone can add comments" 
ON public.blog_comments 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(post_id);