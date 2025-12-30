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
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Guard: base64 images will explode memory usage in serverless environments.
    // If content contains data:image/... we must block and ask the admin to re-insert the image
    // so it becomes a hosted URL (Supabase Storage) instead.
    if (emailContent.includes('data:image/')) {
      return new Response(
        JSON.stringify({
          error:
            'Nyhetsbrevet innehåller en inbäddad bild (base64). Ta bort bilden i editorn och ladda upp den igen så att den blir en URL (Storage).',
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
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

    // Ensure we have a newsletter record early so we can record recipients incrementally
    if (!newsletterId) {
      const { data: created, error: createdError } = await supabase
        .from('sent_newsletters')
        .insert({
          subject: emailSubject,
          content: emailContent,
          template_id: template_id || null,
          recipient_count: 0,
          sent_by: user?.email || 'system',
        })
        .select('id')
        .single();

      if (createdError) {
        console.error('Error creating sent_newsletters record:', createdError);
        return new Response(
          JSON.stringify({ error: 'Kunde inte skapa nyhetsbrevslogg' }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      newsletterId = created.id;
    }

    // If we have a pending newsletter, get recipients who already received it
    const excludedEmails = new Set<string>();
    if (newsletterId) {
      const { data: alreadySent } = await supabase
        .from('newsletter_recipients')
        .select('subscriber_email')
        .eq('sent_newsletter_id', newsletterId);

      if (alreadySent && alreadySent.length > 0) {
        for (const r of alreadySent) excludedEmails.add(r.subscriber_email);
        console.log(
          `Found ${excludedEmails.size} subscribers who already received this newsletter`
        );
      }
    }

    // Get all active newsletter subscribers (not blog subscribers)
    const { data: allSubscribers, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('is_active', true)
      .eq('subscription_type', 'newsletter');

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to fetch subscribers' }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!allSubscribers || allSubscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscribers found' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Filter out subscribers who already received this newsletter
    const subscribers = allSubscribers.filter((s) => !excludedEmails.has(s.email));

    if (subscribers.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'All subscribers have already received this newsletter',
          total_subscribers: allSubscribers.length,
          already_sent: excludedEmails.size,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Use Resend batch API which can send up to 100 emails in one API call
    // Keep per-run size conservative to avoid serverless memory limits.
    const MAX_EMAILS_PER_RUN = 40;
    // Send in very small chunks to ensure we never exceed memory limits
    const CHUNK_SIZE = 5;

    const subscribersToSend = subscribers.slice(0, MAX_EMAILS_PER_RUN);
    const remainingAfterThis = subscribers.length - subscribersToSend.length;

    console.log(
      `Sending to ${subscribersToSend.length} subscribers (${remainingAfterThis} remaining)`
    );

    let successful = 0;
    let failed = 0;
    
    // Build HTML template once
    // Keep it lightweight: webfont imports increase payload and can contribute to memory pressure.
    // Use inline styles on all elements since email clients don't support CSS classes well.
    // Apply Georgia serif font consistently for elegant typography matching the website.
    const styledContent = emailContent
      // Style h1 headings - large, bold serif
      .replace(/<h1([^>]*)>/gi, '<h1$1 style="font-family: Georgia, \'Times New Roman\', serif; font-size: 28px; font-weight: bold; line-height: 1.3; margin: 0 0 20px 0; color: #1a1a1a;">')
      // Style h2 headings - medium, bold serif  
      .replace(/<h2([^>]*)>/gi, '<h2$1 style="font-family: Georgia, \'Times New Roman\', serif; font-size: 24px; font-weight: bold; line-height: 1.3; margin: 30px 0 15px 0; color: #1a1a1a;">')
      // Style h3 headings
      .replace(/<h3([^>]*)>/gi, '<h3$1 style="font-family: Georgia, \'Times New Roman\', serif; font-size: 20px; font-weight: bold; line-height: 1.3; margin: 25px 0 12px 0; color: #1a1a1a;">')
      // Style paragraphs - readable serif with good line-height
      .replace(/<p([^>]*)>/gi, '<p$1 style="font-family: Georgia, \'Times New Roman\', serif; font-size: 18px; line-height: 1.7; margin: 0 0 18px 0; color: #333;">')
      // Style emphasis/italic text
      .replace(/<em([^>]*)>/gi, '<em$1 style="font-family: Georgia, \'Times New Roman\', serif; font-style: italic;">')
      // Style links
      .replace(/<a ([^>]*)>/gi, '<a $1 style="color: #2563eb; text-decoration: underline;">')
      // Style strong/bold text
      .replace(/<strong([^>]*)>/gi, '<strong$1 style="font-weight: bold;">');

    const emailTemplate = `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; font-size: 18px; line-height: 1.7;">
        ${styledContent}
        <hr style="margin: 40px 0 30px 0; border: none; border-top: 1px solid #ddd;">
        <footer style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin-top: 30px;">
          <div style="text-align: center; margin-bottom: 15px;">
            <a href="https://petersvardsmyr.se" style="color: #2563eb; text-decoration: none; font-weight: 500; font-family: Georgia, 'Times New Roman', serif;">
              petersvardsmyr.se
            </a>
          </div>
          <div style="text-align: center; margin-bottom: 15px;">
            <a href="mailto:hej@petersvardsmyr.se" style="color: #666; text-decoration: none; font-family: Georgia, 'Times New Roman', serif;">
              hej@petersvardsmyr.se
            </a>
          </div>
          <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 13px; color: #666; text-align: center; margin: 10px 0; font-family: Georgia, 'Times New Roman', serif; line-height: 1.5;">
            Du får detta e-postmeddelande eftersom du prenumererar på nyhetsbrevet.
          </p>
          <p style="font-size: 13px; text-align: center; margin: 10px 0; font-family: Georgia, 'Times New Roman', serif;">
            <a href="https://petersvardsmyr.se/nyhetsbrev/avregistrera?email=SUBSCRIBER_EMAIL" style="color: #666; text-decoration: underline;">
              Avregistrera dig här
            </a>
          </p>
        </footer>
      </div>
    `;

    // Create progress tracking record
    await supabase.from('newsletter_send_status').insert({
      run_id: runId,
      started_by: user?.email || 'system',
      total: subscribersToSend.length,
      sent: 0,
      failed: 0,
      status: 'started',
    });

    console.log(
      `Sending newsletter to ${subscribersToSend.length} subscribers in chunks of ${CHUNK_SIZE}`
    );

    // Send in chunks to avoid memory limits
    const totalChunks = Math.ceil(subscribersToSend.length / CHUNK_SIZE);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const chunkStart = chunkIndex * CHUNK_SIZE;
      const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, subscribersToSend.length);
      const chunk = subscribersToSend.slice(chunkStart, chunkEnd);

      console.log(
        `Sending chunk ${chunkIndex + 1}/${totalChunks}: ${chunk.length} emails (${chunkStart + 1}-${chunkEnd} of ${subscribersToSend.length})`
      );

      try {
        const batchEmails = chunk.map((subscriber) => ({
          from,
          to: [subscriber.email],
          subject: emailSubject,
          html: emailTemplate.replace(
            'SUBSCRIBER_EMAIL',
            encodeURIComponent(subscriber.email)
          ),
        }));

        const { data: batchData, error: batchError } = await resend.batch.send(batchEmails);

        if (batchError) {
          console.error(`Chunk ${chunkIndex + 1} send error:`, batchError);
          failed += chunk.length;
        } else {
          const chunkSuccessful = batchData?.data?.length || 0;
          const chunkFailed = chunk.length - chunkSuccessful;
          successful += chunkSuccessful;
          failed += chunkFailed;

          // Record recipients incrementally (prevents memory growth)
          // Use upsert with onConflict to prevent duplicates from retries
          if (chunkSuccessful > 0) {
            const sentEmails = chunk.slice(0, chunkSuccessful).map((s) => s.email);
            const recipientRecords = sentEmails.map((email) => ({
              sent_newsletter_id: newsletterId,
              subscriber_email: email,
            }));

            const { error: recipientsError } = await supabase
              .from('newsletter_recipients')
              .upsert(recipientRecords, {
                onConflict: 'sent_newsletter_id,subscriber_email',
                ignoreDuplicates: true,
              });

            if (recipientsError) {
              console.error('Error recording recipients (chunk):', recipientsError);
            } else {
              for (const email of sentEmails) excludedEmails.add(email);
            }
          }

          console.log(
            `Chunk ${chunkIndex + 1} completed: ${chunkSuccessful} successful, ${chunkFailed} failed. Total so far: ${successful}/${subscribersToSend.length}`
          );
        }

        // Update progress in database after each chunk
        await supabase
          .from('newsletter_send_status')
          .update({
            sent: successful,
            failed: failed,
            status: 'sending',
          })
          .eq('run_id', runId);

        // Wait between chunks to avoid rate limits and memory spikes
        if (chunkIndex < totalChunks - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      } catch (error) {
        console.error(`Chunk ${chunkIndex + 1} exception:`, error);
        failed += chunk.length;
      }
    }

    // Mark as completed
    await supabase
      .from('newsletter_send_status')
      .update({
        sent: successful,
        failed: failed,
        status: 'completed',
      })
      .eq('run_id', runId);

    // Update newsletter record with new recipient count
    const { error: updateError } = await supabase
      .from('sent_newsletters')
      .update({
        recipient_count: excludedEmails.size,
      })
      .eq('id', newsletterId);

    if (updateError) {
      console.error('Error updating newsletter history:', updateError);
    }

    console.log(`Newsletter sent: ${successful} successful, ${failed} failed`);


    return new Response(
      JSON.stringify({
        message: `Newsletter sent to ${successful} subscribers`,
        successful,
        failed,
        run_id: runId,
        remaining: remainingAfterThis,
        total_subscribers: allSubscribers.length,
        already_sent: excludedEmails.size,
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