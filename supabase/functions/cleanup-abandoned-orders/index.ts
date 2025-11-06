import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Delete pending orders older than 24 hours that don't have a payment intent
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseClient
      .from('orders')
      .delete()
      .eq('status', 'pending')
      .is('stripe_payment_intent_id', null)
      .lt('created_at', twentyFourHoursAgo)
      .select();

    if (error) throw error;

    console.log(`Cleaned up ${data?.length || 0} abandoned orders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted: data?.length || 0,
        message: `Deleted ${data?.length || 0} abandoned orders older than 24 hours`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error cleaning up abandoned orders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
