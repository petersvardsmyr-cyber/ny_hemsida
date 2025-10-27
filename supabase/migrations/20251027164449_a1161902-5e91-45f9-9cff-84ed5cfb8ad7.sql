-- Add RLS policy for admins to delete newsletter subscribers
CREATE POLICY "Admins can delete subscribers"
ON newsletter_subscribers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);