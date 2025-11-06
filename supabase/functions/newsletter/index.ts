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

    console.log('Newsletter requested by admin user');

    // Initialize Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { subject, content, from = "Peter Svärdsmyr <hej@petersvardsmyr.se>", template_id }: NewsletterRequest = await req.json();
    
    // Create a unique run ID for tracking progress
    const runId = crypto.randomUUID();

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

    // First, check if we have a pending newsletter (one that was partially sent)
    const { data: lastNewsletter } = await supabase
      .from('sent_newsletters')
      .select('id')
      .eq('subject', emailSubject)
      .eq('sent_by', user?.email || 'system')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let newsletterId = lastNewsletter?.id;

    // If we have a pending newsletter, get recipients who already received it
    let excludedEmails: string[] = [];
    if (newsletterId) {
      const { data: alreadySent } = await supabase
        .from('newsletter_recipients')
        .select('subscriber_email')
        .eq('sent_newsletter_id', newsletterId);
      
      if (alreadySent && alreadySent.length > 0) {
        excludedEmails = alreadySent.map(r => r.subscriber_email);
        console.log(`Found ${excludedEmails.length} subscribers who already received this newsletter`);
      }
    }

    // Get all active subscribers
    const { data: allSubscribers, error: dbError } = await supabase
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

    if (!allSubscribers || allSubscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found" }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Filter out subscribers who already received this newsletter
    const subscribers = allSubscribers.filter(s => !excludedEmails.includes(s.email));

    if (subscribers.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "All subscribers have already received this newsletter",
          total_subscribers: allSubscribers.length,
          already_sent: excludedEmails.length
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Use Resend batch API which can send up to 100 emails in one API call
    // This respects the rate limit of 2 requests per second
    const MAX_EMAILS_PER_RUN = 100;
    const subscribersToSend = subscribers.slice(0, MAX_EMAILS_PER_RUN);
    const remainingAfterThis = subscribers.length - subscribersToSend.length;

    console.log(`Sending to ${subscribersToSend.length} subscribers (${remainingAfterThis} remaining)`);

    let successful = 0;
    let failed = 0;
    
    // Build HTML template once
    const emailTemplate = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        body { font-family: 'Crimson Text', Georgia, serif; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', Georgia, serif; }
        p, li, blockquote, span, div { font-family: 'Crimson Text', Georgia, serif; }
      </style>
      <div style="font-family: 'Crimson Text', Georgia, serif; max-width: 600px; margin: 0 auto;">
        ${emailContent}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <footer style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 30px;">
          <div style="text-align: center; margin-bottom: 15px;">
            <a href="https://petersvardsmyr.se" style="color: #2563eb; text-decoration: none; font-weight: 500;">
              petersvardsmyr.se
            </a>
          </div>
          <div style="text-align: center; margin-bottom: 15px;">
            <a href="mailto:hej@petersvardsmyr.se" style="color: #666; text-decoration: none;">
              hej@petersvardsmyr.se
            </a>
          </div>
          <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666; text-align: center; margin: 10px 0;">
            Du får detta e-postmeddelande eftersom du prenumererar på vårt nyhetsbrev.
          </p>
          <p style="font-size: 12px; text-align: center; margin: 10px 0;">
            <a href="https://petersvardsmyr.se/nyhetsbrev/avregistrera?email=SUBSCRIBER_EMAIL" style="color: #666; text-decoration: underline;">
              Avregistrera dig här
            </a>
          </p>
        </footer>
      </div>
    `;
    
    // Create progress tracking record
    await supabase
      .from('newsletter_send_status')
      .insert({
        run_id: runId,
        started_by: user?.email || 'system',
        total: subscribersToSend.length,
        sent: 0,
        failed: 0,
        status: 'started'
      });
    
    console.log(`Sending newsletter to ${subscribersToSend.length} subscribers using batch API`);
    
    // Use Resend batch API to send all emails in one request
    try {
      const batchEmails = subscribersToSend.map(subscriber => ({
        from,
        to: [subscriber.email],
        subject: emailSubject,
        html: emailTemplate.replace('SUBSCRIBER_EMAIL', encodeURIComponent(subscriber.email)),
      }));

      const { data: batchData, error: batchError } = await resend.batch.send(batchEmails);
      
      if (batchError) {
        console.error('Batch send error:', batchError);
        failed = subscribersToSend.length;
      } else {
        // Count successful and failed sends
        successful = batchData?.data?.length || 0;
        failed = subscribersToSend.length - successful;
        console.log(`Batch send completed: ${successful} successful, ${failed} failed`);
      }
      
      // Update progress in database
      await supabase
        .from('newsletter_send_status')
        .update({
          sent: successful,
          failed: failed,
          status: 'sending'
        })
        .eq('run_id', runId);
    } catch (error) {
      console.error('Batch send exception:', error);
      failed = subscribersToSend.length;
    }
    
    // Mark as completed
    await supabase
      .from('newsletter_send_status')
      .update({
        sent: successful,
        failed: failed,
        status: 'completed'
      })
      .eq('run_id', runId);

    console.log(`Newsletter sent: ${successful} successful, ${failed} failed`);

    // Create or update newsletter record
    if (!newsletterId) {
      const { data: newNewsletter, error: saveError } = await supabase
        .from('sent_newsletters')
        .insert({
          subject: emailSubject,
          content: emailContent,
          template_id: template_id || null,
          recipient_count: successful,
          sent_by: user?.email || 'system'
        })
        .select()
        .single();

      if (saveError) {
        console.error("Error saving newsletter history:", saveError);
      } else {
        newsletterId = newNewsletter.id;
      }
    } else {
      // Update existing newsletter with new recipient count
      const { error: updateError } = await supabase
        .from('sent_newsletters')
        .update({
          recipient_count: (excludedEmails.length + successful)
        })
        .eq('id', newsletterId);

      if (updateError) {
        console.error("Error updating newsletter history:", updateError);
      }
    }

    // Record which subscribers received this newsletter
    if (newsletterId && successful > 0) {
      const recipientRecords = subscribersToSend.slice(0, successful).map(subscriber => ({
        sent_newsletter_id: newsletterId,
        subscriber_email: subscriber.email
      }));

      const { error: recipientsError } = await supabase
        .from('newsletter_recipients')
        .insert(recipientRecords);

      if (recipientsError) {
        console.error("Error recording recipients:", recipientsError);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Newsletter sent to ${successful} subscribers`,
        successful,
        failed,
        run_id: runId,
        remaining: remainingAfterThis,
        total_subscribers: allSubscribers.length,
        already_sent: excludedEmails.length
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