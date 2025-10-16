import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    if (!webhookSecret) {
      console.log("STRIPE_WEBHOOK_SECRET not configured, skipping signature verification");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(`Webhook signature verification failed`, { status: 400 });
      }
    } else {
      // For development/testing without webhook secret
      event = JSON.parse(body);
    }

    console.log("Received webhook event:", event.type);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed");

        // Update order status to completed
        const { error: updateError } = await supabaseClient
          .from("orders")
          .update({
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent as string,
            email: session.customer_details?.email || session.customer_email || null
          })
          .eq('stripe_session_id', session.id);

        if (updateError) {
          console.error("Error updating order:", updateError);
        } else {
          console.log("Order updated to completed for session:", session.id);
        }

        // Trigger order confirmation emails now that payment is completed
        try {
          const newsletterOptin = (session.metadata?.newsletter_optin === 'true');
          const email = session.customer_details?.email || session.customer_email || '';

          const { error: fnError } = await supabaseClient.functions.invoke('send-order-confirmation', {
            body: {
              session_id: session.id,
              customer_email: email,
              newsletter_subscribed: newsletterOptin,
            }
          });

          if (fnError) {
            console.error('Failed to trigger confirmation emails:', fnError);
          } else {
            console.log('Order confirmation emails sent for session:', session.id);
          }
        } catch (e) {
          console.error('Error invoking confirmation email function:', e);
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        
        // Additional handling if needed
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed");
        
        // Update order status to failed if needed
        const { error: updateError } = await supabaseClient
          .from("orders")
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error("Error updating failed order:", updateError);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});