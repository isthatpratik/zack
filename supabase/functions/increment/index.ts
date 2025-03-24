import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { row_id, table_name, column_name, increment_amount } =
      await req.json();

    if (
      !row_id ||
      !table_name ||
      !column_name ||
      increment_amount === undefined
    ) {
      throw new Error("Missing required parameters");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get current value
    const { data: currentData, error: fetchError } = await supabaseClient
      .from(table_name)
      .select(column_name)
      .eq("id", row_id)
      .single();

    if (fetchError) {
      throw new Error(`Error fetching current value: ${fetchError.message}`);
    }

    const currentValue = currentData[column_name] || 0;
    const newValue = currentValue + increment_amount;

    // Update with new value
    const { error: updateError } = await supabaseClient
      .from(table_name)
      .update({ [column_name]: newValue })
      .eq("id", row_id);

    if (updateError) {
      throw new Error(`Error updating value: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ success: true, newValue }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error incrementing value:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
