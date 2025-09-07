import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderRequest {
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  total_amount: number;
  discount_amount?: number;
  discount_code?: string;
  email?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing payment request...");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    // Parse request body
    const orderData: OrderRequest = await req.json();
    console.log("Order data:", JSON.stringify(orderData, null, 2));

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Create line items for Stripe
    const lineItems = orderData.items.map(item => ({
      price_data: {
        currency: "sek",
        product_data: {
          name: item.title,
        },
        unit_amount: item.price * 100, // Convert to öre (SEK cents)
      },
      quantity: item.quantity,
    }));

    // Add discount as a line item if applicable
    if (orderData.discount_amount && orderData.discount_amount > 0) {
      lineItems.push({
        price_data: {
          currency: "sek",
          product_data: {
            name: `Rabatt (${orderData.discount_code || 'Kod'})`,
          },
          unit_amount: -orderData.discount_amount * 100, // Negative amount for discount
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "klarna"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin") || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "http://localhost:3000"}/butik`,
      customer_email: orderData.email === 'guest@example.com' ? undefined : orderData.email,
      shipping_address_collection: {
        allowed_countries: ['SE', 'NO', 'DK', 'FI'],
      },
      billing_address_collection: 'required',
      payment_intent_data: {
        metadata: {
          order_items: JSON.stringify(orderData.items),
          discount_code: orderData.discount_code || '',
          discount_amount: (orderData.discount_amount || 0).toString(),
        }
      },
      metadata: {
        order_items: JSON.stringify(orderData.items),
        discount_code: orderData.discount_code || '',
        discount_amount: (orderData.discount_amount || 0).toString(),
      }
    });

    console.log("Stripe session created:", session.id);

    // Save order to database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseClient
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        email: orderData.email || 'guest@example.com',
        total_amount: orderData.total_amount * 100, // Store in öre
        discount_amount: (orderData.discount_amount || 0) * 100,
        discount_code: orderData.discount_code,
        items: orderData.items,
        status: 'pending',
      });

    if (insertError) {
      console.error("Error saving order:", insertError);
      // Don't fail the request, just log the error
    } else {
      console.log("Order saved to database");
    }

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error creating payment session:", error);
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