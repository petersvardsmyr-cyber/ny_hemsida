-- Add likes column to blog_comments
ALTER TABLE public.blog_comments 
ADD COLUMN likes integer NOT NULL DEFAULT 0;

-- Allow anyone to update the likes count
CREATE POLICY "Anyone can like comments" 
ON public.blog_comments 
FOR UPDATE 
USING (true)
WITH CHECK (true);