import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVRow {
  email: string;
  first_name: string;
  last_name: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Not authorized - admin role required');
    }

    const { csvData } = await req.json();
    
    if (!csvData || !Array.isArray(csvData)) {
      throw new Error('Invalid CSV data');
    }

    console.log(`Starting import of ${csvData.length} subscribers`);

    const results = {
      success: 0,
      skipped: 0,
      errors: 0,
      details: [] as string[]
    };

    for (const row of csvData as CSVRow[]) {
      const email = row.email?.trim().toLowerCase();
      
      if (!email || !email.includes('@')) {
        results.skipped++;
        results.details.push(`Skipped invalid email: ${email}`);
        continue;
      }

      // Check if already exists
      const { data: existing } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id, email')
        .eq('email', email)
        .single();

      if (existing) {
        results.skipped++;
        results.details.push(`Already exists: ${email}`);
        continue;
      }

      // Build name from first_name and last_name if they exist and are not "nan"
      let name = null;
      const firstName = row.first_name?.trim();
      const lastName = row.last_name?.trim();
      
      if (firstName && firstName !== 'nan' && lastName && lastName !== 'nan') {
        name = `${firstName} ${lastName}`;
      } else if (firstName && firstName !== 'nan') {
        name = firstName;
      } else if (lastName && lastName !== 'nan') {
        name = lastName;
      }

      // Insert as active subscriber without confirmation
      const { error: insertError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .insert({
          email,
          name,
          is_active: true,
          confirmed_at: new Date().toISOString(),
          confirmation_token: null
        });

      if (insertError) {
        results.errors++;
        results.details.push(`Error for ${email}: ${insertError.message}`);
        console.error(`Error inserting ${email}:`, insertError);
      } else {
        results.success++;
        console.log(`Successfully imported: ${email}`);
      }
    }

    console.log('Import complete:', results);

    return new Response(
      JSON.stringify({
        message: 'Import completed',
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in import-subscribers function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to import subscribers'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
