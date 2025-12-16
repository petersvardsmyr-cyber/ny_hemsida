-- Add image caption field to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN image_caption text;