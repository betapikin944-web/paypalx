import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Auth client to validate the token
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const user = { id: claimsData.claims.sub };

    const { recipientId, amount, description, senderCurrency, recipientCurrency } = await req.json();

    if (!recipientId || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate converted amount if currencies differ
    let convertedAmount = amount;
    let rate = 1;

    if (senderCurrency && recipientCurrency && senderCurrency !== recipientCurrency) {
      const rateRes = await fetch(
        `https://api.frankfurter.app/latest?from=${senderCurrency}&to=${recipientCurrency}&amount=${amount}`
      );
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        convertedAmount = rateData.rates[recipientCurrency];
        rate = convertedAmount / amount;
      }
    }

    // Use service role client for the actual transfer
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // Atomic transfer in a single transaction via SQL
    const { data, error } = await admin.rpc('transfer_funds', {
      _sender_id: user.id,
      _recipient_id: recipientId,
      _amount: amount,
      _description: description || null,
      _converted_amount: convertedAmount,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      transactionId: data,
      convertedAmount,
      rate,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
