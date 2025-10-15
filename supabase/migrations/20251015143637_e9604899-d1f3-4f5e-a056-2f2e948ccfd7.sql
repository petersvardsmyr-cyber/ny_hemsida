-- 1. Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy for user_roles table
CREATE POLICY "Authenticated users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Fix newsletter_subscribers SELECT policy - require authentication
DROP POLICY IF EXISTS "Authenticated users can view all subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view all subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Fix orders SELECT policy - explicit authentication checks
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.email() IS NOT NULL AND email = auth.email())
);

-- 5. Update all admin-related policies to require admin role

-- Blog posts
DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON public.blog_posts;
CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON public.blog_posts;
CREATE POLICY "Admins can update blog posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete blog posts" ON public.blog_posts;
CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Products
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Newsletter subscribers
DROP POLICY IF EXISTS "Authenticated users can update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can update subscribers"
ON public.newsletter_subscribers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Email templates
DROP POLICY IF EXISTS "Authenticated users can view all email templates" ON public.email_templates;
CREATE POLICY "Admins can view all email templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can create email templates" ON public.email_templates;
CREATE POLICY "Admins can create email templates"
ON public.email_templates
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can update email templates" ON public.email_templates;
CREATE POLICY "Admins can update email templates"
ON public.email_templates
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete email templates" ON public.email_templates;
CREATE POLICY "Admins can delete email templates"
ON public.email_templates
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));