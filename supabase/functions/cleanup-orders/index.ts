import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase env vars" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Find the most recent order to keep
    const { data: latest, error: latestError } = await supabase
      .from("orders")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    if (latestError) throw latestError;

    if (!latest || latest.length === 0) {
      return new Response(
        JSON.stringify({ message: "No orders found", deleted: 0, kept_id: null }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const keepId = latest[0].id as string;

    // Count total before deletion
    const { count: totalBefore } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true });

    // Delete all except the most recent one
    const { data: deletedRows, error: deleteError } = await supabase
      .from("orders")
      .delete()
      .neq("id", keepId)
      .select("id");

    if (deleteError) throw deleteError;

    const deletedCount = Array.isArray(deletedRows) ? deletedRows.length : 0;

    console.log("cleanup-orders:", { kept_id: keepId, deleted: deletedCount, total_before: totalBefore });

    return new Response(
      JSON.stringify({ kept_id: keepId, deleted: deletedCount, total_before: totalBefore }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("cleanup-orders error:", error);
    return new Response(
      JSON.stringify({ error: (error as any)?.message ?? "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
