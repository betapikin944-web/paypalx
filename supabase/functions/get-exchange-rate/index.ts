import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { from, to, amount } = await req.json();

    if (!from || !to || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: from, to, amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (from === to) {
      return new Response(
        JSON.stringify({ convertedAmount: amount, rate: 1 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use frankfurter.app - free, no API key needed
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}&amount=${amount}`
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.statusText}`);
    }

    const data = await response.json();
    const convertedAmount = data.rates[to];
    const rate = convertedAmount / amount;

    return new Response(
      JSON.stringify({ convertedAmount, rate }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
