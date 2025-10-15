import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  subject?: string;
  content?: string;
  from?: string;
  template_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  try {
    // Require authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create client for auth check
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await authClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Admin role check failed:', roleError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin role required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Newsletter requested by admin user: ${user.email}`);

    // Initialize Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { subject, content, from = "Peter Svärdsmyr <hej@petersvardsmyr.se>", template_id }: NewsletterRequest = await req.json();

    let emailSubject = subject;
    let emailContent = content;

    // If template_id is provided, use template from database
    if (template_id) {
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('subject, content')
        .eq('id', template_id)
        .eq('is_active', true)
        .single();

      if (templateError) {
        console.error("Template error:", templateError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch email template" }),
          { 
            status: 500, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }

      if (template) {
        emailSubject = template.subject;
        emailContent = template.content;
      }
    } else {
      // Fallback: try to get the default newsletter template
      const { data: defaultTemplate } = await supabase
        .from('email_templates')
        .select('subject, content')
        .eq('template_type', 'newsletter')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (defaultTemplate) {
        emailSubject = emailSubject || defaultTemplate.subject;
        emailContent = emailContent || defaultTemplate.content;
      }
    }

    if (!emailSubject || !emailContent) {
      return new Response(
        JSON.stringify({ error: "Subject and content are required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get all active subscribers
    const { data: subscribers, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('is_active', true);

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found" }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Send newsletter to all subscribers
    const emailPromises = subscribers.map(subscriber => 
      resend.emails.send({
        from,
        to: [subscriber.email],
         subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${subscriber.name ? `<p>Hej ${subscriber.name}!</p>` : '<p>Hej!</p>'}
            ${emailContent}
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              Du får detta e-postmeddelande eftersom du prenumererar på vårt nyhetsbrev.
              <br>
              Om du inte längre vill få våra e-postmeddelanden, kontakta oss för att avsluta prenumerationen.
            </p>
          </div>
        `,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Newsletter sent: ${successful} successful, ${failed} failed`);

    if (failed > 0) {
      const failedResults = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);
      console.error("Failed sends:", failedResults);
    }

    // Save to sent_newsletters table
    const { error: saveError } = await supabase
      .from('sent_newsletters')
      .insert({
        subject: emailSubject,
        content: emailContent,
        template_id: template_id || null,
        recipient_count: successful,
        sent_by: user?.email || 'system'
      });

    if (saveError) {
      console.error("Error saving newsletter history:", saveError);
    }

    return new Response(
      JSON.stringify({ 
        message: `Newsletter sent to ${successful} subscribers`,
        successful,
        failed 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);