-- Add more columns to the blog_posts table to better match Peters content structure
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS author text DEFAULT 'Peter Svärdsmyr',
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;

-- Create an index on the slug for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- Create an index on published_date for sorting
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON public.blog_posts(published_date DESC);