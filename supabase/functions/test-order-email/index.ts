import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing order confirmation email...');

    // Create test data that mimics a real Stripe session
    const testSessionData = {
      session_id: 'cs_test_123456789',
      customer_email: 'test@example.com' // Du kan ändra denna till din egen mejl för att testa
    };

    // Call the send-order-confirmation function
    const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-confirmation`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSessionData)
    });

    const result = await response.text();
    console.log('Order email test result:', result);

    if (!response.ok) {
      throw new Error(`Failed to send test email: ${result}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test order confirmation email sent successfully!',
      details: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error sending test order email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});