import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return new Response('Missing slug parameter', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch blog post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !post) {
      console.error('Error fetching post:', error);
      return new Response('Post not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Build absolute URLs
    const baseUrl = 'https://petersvardsmyr.com';
    const pageUrl = `${baseUrl}/blogg/${post.slug}`;
    
    // Use featured image if available, otherwise fallback to profile image
    let ogImage = `${baseUrl}/peter-profile.jpg`;
    if (post.featured_image_url) {
      // If it's a data URL, keep it as is, otherwise make it absolute
      if (post.featured_image_url.startsWith('data:')) {
        ogImage = post.featured_image_url;
      } else if (post.featured_image_url.startsWith('http')) {
        ogImage = post.featured_image_url;
      } else {
        ogImage = `${baseUrl}${post.featured_image_url}`;
      }
    }

    // Generate HTML with proper OG tags
    const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} | Peter Svärdsmyr</title>
  <meta name="description" content="${post.excerpt || post.title}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.excerpt || post.title}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="article:published_time" content="${post.published_date}">
  <meta property="article:author" content="${post.author}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${post.title}">
  <meta name="twitter:description" content="${post.excerpt || post.title}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- Redirect to actual page after metadata is read -->
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
  <script>window.location.href = "${pageUrl}";</script>
</head>
<body>
  <h1>${post.title}</h1>
  <p>Om du inte blir omdirigerad automatiskt, <a href="${pageUrl}">klicka här</a>.</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error in og-meta function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
