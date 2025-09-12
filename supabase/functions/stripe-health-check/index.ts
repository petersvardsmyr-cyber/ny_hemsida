import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking Stripe connection...');
    
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not found');
      return new Response(
        JSON.stringify({ 
          error: 'STRIPE_SECRET_KEY not configured',
          status: 'error',
          details: 'Secret key missing from environment' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Test the connection by retrieving account information
    const account = await stripe.accounts.retrieve();
    
    console.log('Stripe connection successful:', {
      accountId: account.id,
      country: account.country,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted
    });

    return new Response(
      JSON.stringify({
        status: 'success',
        account: {
          id: account.id,
          country: account.country,
          charges_enabled: account.charges_enabled,
          details_submitted: account.details_submitted,
          business_profile: account.business_profile
        },
        key_type: stripeSecretKey.startsWith('sk_live_') ? 'live' : 'test',
        webhook_secret_configured: !!Deno.env.get('STRIPE_WEBHOOK_SECRET')
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Stripe health check failed:', error);
    
    let errorMessage = 'Unknown error';
    let errorType = 'unknown';
    
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid API key or request';
      errorType = 'invalid_key';
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Authentication failed - check API key';
      errorType = 'auth_error';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({
        status: 'error',
        error: errorMessage,
        error_type: errorType,
        details: error.type || 'Connection failed'
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);