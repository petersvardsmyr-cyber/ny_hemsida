import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BlogNotificationRequest {
  post_id: string;
  title: string;
  excerpt: string;
  slug: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.error("Not admin:", roleError);
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { post_id, title, excerpt, slug }: BlogNotificationRequest = await req.json();
    console.log("Sending blog notification for:", title);

    // Get blog subscribers only (subscription_type = 'blog')
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: subscribers, error: subError } = await adminClient
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true)
      .eq("subscription_type", "blog");

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      throw subError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No blog subscribers found");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscribers" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscribers.length} blog subscribers`);

    const siteUrl = "https://petersvardsmyr.se";
    const postUrl = `${siteUrl}/blogg/${slug}`;
    const unsubscribeBaseUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/unsubscribe-newsletter`;

    let successCount = 0;
    let errorCount = 0;

    // Send emails in batches
    const batchSize = 5;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (subscriber) => {
          try {
            const unsubscribeUrl = `${unsubscribeBaseUrl}?email=${encodeURIComponent(subscriber.email)}`;
            
            const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="font-size: 24px; margin-bottom: 16px;">${title}</h1>
  
  ${excerpt ? `<p style="color: #666; margin-bottom: 24px;">${excerpt}</p>` : ''}
  
  <p>
    <a href="${postUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
      Läs inlägget
    </a>
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  
  <p style="font-size: 12px; color: #999;">
    Du får detta mejl för att du prenumererar på bloggen.<br>
    <a href="${unsubscribeUrl}" style="color: #999;">Avsluta prenumeration</a>
  </p>
</body>
</html>`;

            await resend.emails.send({
              from: "Peter Svärdsmyr <info@petersvardsmyr.se>",
              to: [subscriber.email],
              subject: `Nytt blogginlägg: ${title}`,
              html,
            });
            
            successCount++;
            console.log(`Email sent to: ${subscriber.email}`);
          } catch (err) {
            errorCount++;
            console.error(`Failed to send to ${subscriber.email}:`, err);
          }
        })
      );
      
      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Blog notification complete: ${successCount} sent, ${errorCount} failed`);

    return new Response(
      JSON.stringify({ success: true, sent: successCount, failed: errorCount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-blog-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
