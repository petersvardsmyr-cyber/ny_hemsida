import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmRequest {
  token: string;
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
    const { token }: ConfirmRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('confirmation_token', token)
      .single();

    if (findError || !subscriber) {
      console.error('Subscriber not found:', findError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid or expired confirmation token",
          message: "Ogiltig eller utgången bekräftelselänk" 
        }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Check if already confirmed
    if (subscriber.is_active && subscriber.confirmed_at) {
      console.log(`Subscriber already confirmed: ${subscriber.email}`);
      return new Response(
        JSON.stringify({ 
          message: "Already confirmed",
          already_confirmed: true,
          email: subscriber.email 
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Confirm subscription
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        is_active: true,
        confirmed_at: new Date().toISOString(),
        confirmation_token: null, // Clear token after confirmation
        updated_at: new Date().toISOString()
      })
      .eq('confirmation_token', token);

    if (updateError) {
      console.error('Error confirming subscription:', updateError);
      return new Response(
        JSON.stringify({ error: "Failed to confirm subscription" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log(`Successfully confirmed: ${subscriber.email}`);

    return new Response(
      JSON.stringify({ 
        message: "Subscription confirmed successfully",
        email: subscriber.email 
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
    console.error("Error in confirm-newsletter function:", error);
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
