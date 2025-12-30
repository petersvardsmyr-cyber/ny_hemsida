-- Add policy for admins to delete comments
CREATE POLICY "Admins can delete comments" 
ON public.blog_comments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));