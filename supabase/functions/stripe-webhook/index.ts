import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  console.log('🚀 === WEBHOOK FUNCTION CALLED ===');
  console.log('📨 Method:', req.method);
  console.log('📨 URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📨 CORS preflight request handled');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verifica che sia una richiesta POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }

    // ENDPOINT DI TEST TEMPORANEO - Rimuovi in produzione!
    const url = new URL(req.url);
    if (url.searchParams.get('test') === 'true') {
      console.log('🧪 === TEST MODE ENABLED ===');

      // Simula un evento account.updated
      const testEvent = {
        type: 'account.updated',
        id: 'evt_test_' + Date.now(),
        data: {
          object: {
            id: 'acct_1S5SV9Ji9MPBvoDo', // Usa un account esistente per test
            details_submitted: true,
            charges_enabled: true,
            payouts_enabled: true,
          },
        },
      };

      console.log('🧪 Simulando evento:', JSON.stringify(testEvent, null, 2));

      // Processa l'evento di test
      const account = testEvent.data.object;
      console.log('📊 Processing account update for:', account.id);

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseServiceKey) {
        return new Response('Supabase configuration error', {
          status: 500,
          headers: corsHeaders,
        });
      }

      const findRiderUrl = `${supabaseUrl}/rest/v1/riders_details?stripe_account_id=eq.${account.id}&select=profile_id,stripe_onboarding_complete`;
      console.log('🔍 Finding rider in test...');

      const findResponse = await fetch(findRiderUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
          'Content-Type': 'application/json',
        },
      });

      if (!findResponse.ok) {
        const errorText = await findResponse.text();
        console.error(
          '❌ Error finding rider in test:',
          findResponse.status,
          errorText
        );
        return new Response('Rider not found', {
          status: 404,
          headers: corsHeaders,
        });
      }

      const riderDetailsArray = await findResponse.json();
      if (!riderDetailsArray || riderDetailsArray.length === 0) {
        console.error('❌ No rider found with Stripe account:', account.id);
        return new Response('Rider not found', {
          status: 404,
          headers: corsHeaders,
        });
      }

      const riderDetails = riderDetailsArray[0];
      console.log('👤 Found rider:', riderDetails.profile_id);

      const onboardingComplete =
        account.details_submitted && account.charges_enabled;
      console.log('✅ Setting onboarding_complete to:', onboardingComplete);

      if (
        riderDetails &&
        riderDetails.stripe_onboarding_complete !== onboardingComplete
      ) {
        const updateUrl = `${supabaseUrl}/rest/v1/riders_details?stripe_account_id=eq.${account.id}`;
        console.log('🔄 Updating rider in test...');

        const updateResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            stripe_onboarding_complete: onboardingComplete,
            updated_at: new Date().toISOString(),
          }),
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error(
            '❌ Error updating rider in test:',
            updateResponse.status,
            errorText
          );
          return new Response('Failed to update rider', {
            status: 500,
            headers: corsHeaders,
          });
        }

        console.log(
          '✅ Successfully updated onboarding status for rider:',
          riderDetails.profile_id
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test completed successfully',
          onboarding_complete: onboardingComplete,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Ottieni il corpo della richiesta
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature found');
      return new Response('No signature found', {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Verifica la firma del webhook (richiede STRIPE_WEBHOOK_SECRET)
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Importa Stripe per la verifica
    const stripe = await import('https://esm.sh/stripe@14.21.0?target=deno');
    const stripeClient = new stripe.default(
      Deno.env.get('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2023-10-16',
      }
    );

    let event;
    try {
      event = await stripeClient.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return new Response('Webhook signature verification failed', {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log('🔔 === STRIPE WEBHOOK RECEIVED ===');
    console.log('📨 Event Type:', event.type);
    console.log('📨 Event ID:', event.id);
    console.log('📨 Timestamp:', new Date().toISOString());
    console.log('📨 Raw Event:', JSON.stringify(event, null, 2));

    // Gestisci l'evento di aggiornamento dell'account
    if (event.type === 'account.updated') {
      const account = event.data.object;

      console.log('📊 Processing account update for:', account.id);
      console.log('📋 Account details_submitted:', account.details_submitted);
      console.log('💳 Account charges_enabled:', account.charges_enabled);
      console.log('💰 Account payouts_enabled:', account.payouts_enabled);

      // Crea il client Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Supabase environment variables not configured');
        console.error(
          'SUPABASE_URL:',
          supabaseUrl ? '✅ Present' : '❌ Missing'
        );
        console.error(
          'SUPABASE_SERVICE_ROLE_KEY:',
          supabaseServiceKey ? '✅ Present' : '❌ Missing'
        );
        return new Response('Supabase configuration error', {
          status: 500,
          headers: corsHeaders,
        });
      }

      console.log('🔧 Using REST API directly');

      // Trova il rider con questo account Stripe usando REST API
      const findRiderUrl = `${supabaseUrl}/rest/v1/riders_details?stripe_account_id=eq.${account.id}&select=profile_id,stripe_onboarding_complete`;
      console.log('🔍 Finding rider...');

      const findResponse = await fetch(findRiderUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
          'Content-Type': 'application/json',
        },
      });

      if (!findResponse.ok) {
        const errorText = await findResponse.text();
        console.error(
          '❌ Error finding rider:',
          findResponse.status,
          errorText
        );
        return new Response('Rider not found', {
          status: 404,
          headers: corsHeaders,
        });
      }

      const riderDetailsArray = await findResponse.json();
      if (!riderDetailsArray || riderDetailsArray.length === 0) {
        console.error('❌ No rider found with Stripe account:', account.id);
        return new Response('Rider not found', {
          status: 404,
          headers: corsHeaders,
        });
      }

      const riderDetails = riderDetailsArray[0];

      // Determina se l'onboarding è completo
      // NOTA: Alcuni account potrebbero non avere payouts_enabled inizialmente
      // Quindi controlliamo solo details_submitted && charges_enabled
      const onboardingComplete =
        account.details_submitted && account.charges_enabled;

      console.log('✅ Setting onboarding_complete to:', onboardingComplete);
      console.log('📊 Account flags:', {
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      });

      // Aggiorna solo se lo stato è cambiato
      if (riderDetails.stripe_onboarding_complete !== onboardingComplete) {
        const updateUrl = `${supabaseUrl}/rest/v1/riders_details?stripe_account_id=eq.${account.id}`;
        console.log('🔄 Updating rider...');

        const updateResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            stripe_onboarding_complete: onboardingComplete,
            updated_at: new Date().toISOString(),
          }),
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error(
            '❌ Error updating rider:',
            updateResponse.status,
            errorText
          );
          return new Response('Failed to update rider', {
            status: 500,
            headers: corsHeaders,
          });
        }

        console.log(
          '✅ Successfully updated onboarding status for rider:',
          riderDetails.profile_id
        );
        console.log('🔄 New status:', onboardingComplete);
        console.log('🎉 Onboarding completed for account:', account.id);
      } else {
        console.log('ℹ️ Onboarding status unchanged, no update needed');
      }

      // Log finale dello stato di onboarding
      if (onboardingComplete) {
        console.log('🎉 STRIPE ONBOARDING COMPLETATO per account:', account.id);
      } else {
        console.log('⏳ Onboarding ancora in corso per account:', account.id);
      }
    } else {
      console.log('📨 === EVENTO NON GESTITO ===');
      console.log('📨 Tipo evento:', event.type);
      console.log('📨 Evento completo:', JSON.stringify(event, null, 2));
    }

    // Restituisci una risposta di successo
    return new Response(JSON.stringify({ received: true, processed: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${error.message}` }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
