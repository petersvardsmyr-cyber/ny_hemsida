-- Add is_featured column to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN is_featured boolean DEFAULT false;

-- Create a function to ensure only one post can be featured at a time
CREATE OR REPLACE FUNCTION public.ensure_single_featured_post()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_featured = true THEN
    UPDATE public.blog_posts 
    SET is_featured = false 
    WHERE id != NEW.id AND is_featured = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce single featured post
CREATE TRIGGER enforce_single_featured_post
BEFORE INSERT OR UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_featured_post();