import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  id: string;
  title: string;
  featured_image_url: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting migration of Base64 blog images to Storage...');

    // Fetch all blog posts with featured images
    const { data: posts, error: fetchError } = await supabaseClient
      .from('blog_posts')
      .select('id, title, featured_image_url')
      .not('featured_image_url', 'is', null);

    if (fetchError) {
      console.error('Error fetching posts:', fetchError);
      throw fetchError;
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No posts with images found',
          migratedCount: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Found ${posts.length} posts to check`);

    const migratedPosts: string[] = [];
    const skippedPosts: string[] = [];
    const errors: Array<{ postId: string; error: string }> = [];

    for (const post of posts) {
      try {
        const imageUrl = post.featured_image_url;
        
        // Skip if already a URL (not Base64)
        if (!imageUrl || imageUrl.startsWith('http')) {
          console.log(`Skipping post ${post.id} - already has URL`);
          skippedPosts.push(post.id);
          continue;
        }

        // Check if it's a data URL
        if (!imageUrl.startsWith('data:image/')) {
          console.log(`Skipping post ${post.id} - not a Base64 image`);
          skippedPosts.push(post.id);
          continue;
        }

        console.log(`Migrating image for post: ${post.title} (${post.id})`);

        // Extract mime type and base64 data
        const matches = imageUrl.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/);
        if (!matches) {
          console.error(`Invalid Base64 format for post ${post.id}`);
          errors.push({ postId: post.id, error: 'Invalid Base64 format' });
          continue;
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        // Convert Base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Generate filename
        const fileName = `migrated-${post.id}.${mimeType}`;
        const filePath = `${fileName}`;

        console.log(`Uploading ${filePath} to Storage...`);

        // Upload to Storage
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('blog-images')
          .upload(filePath, bytes, {
            contentType: `image/${mimeType}`,
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for post ${post.id}:`, uploadError);
          errors.push({ postId: post.id, error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
          .from('blog-images')
          .getPublicUrl(filePath);

        console.log(`New public URL: ${publicUrl}`);

        // Update blog post with new URL
        const { error: updateError } = await supabaseClient
          .from('blog_posts')
          .update({ featured_image_url: publicUrl })
          .eq('id', post.id);

        if (updateError) {
          console.error(`Update error for post ${post.id}:`, updateError);
          errors.push({ postId: post.id, error: updateError.message });
          continue;
        }

        migratedPosts.push(post.id);
        console.log(`Successfully migrated post ${post.id}`);

      } catch (error: any) {
        console.error(`Error processing post ${post.id}:`, error);
        errors.push({ postId: post.id, error: error.message });
      }
    }

    const result = {
      message: 'Migration completed',
      total: posts.length,
      migrated: migratedPosts.length,
      skipped: skippedPosts.length,
      errors: errors.length,
      migratedPosts,
      skippedPosts,
      errorDetails: errors
    };

    console.log('Migration summary:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to migrate blog images'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});