import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verifica che sia una richiesta POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    // Ottieni il corpo della richiesta
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ No Stripe signature found')
      return new Response('No signature found', { status: 400, headers: corsHeaders })
    }

    // Verifica la firma del webhook (richiede STRIPE_WEBHOOK_SECRET)
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured')
      return new Response('Webhook secret not configured', { status: 500, headers: corsHeaders })
    }

    // Importa Stripe per la verifica
    const stripe = await import('https://esm.sh/stripe@14.10.0?target=deno')
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    let event
    try {
      event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message)
      return new Response('Webhook signature verification failed', { status: 400, headers: corsHeaders })
    }

    console.log('🔔 Received Stripe webhook event:', event.type)

    // Gestisci l'evento di aggiornamento dell'account
    if (event.type === 'account.updated') {
      const account = event.data.object
      
      console.log('📊 Processing account update for:', account.id)
      console.log('📋 Account details_submitted:', account.details_submitted)
      console.log('💳 Account charges_enabled:', account.charges_enabled)
      console.log('💰 Account payouts_enabled:', account.payouts_enabled)

      // Crea il client Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Supabase environment variables not configured')
        return new Response('Supabase configuration error', { status: 500, headers: corsHeaders })
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Trova il rider con questo account Stripe
      const { data: riderDetails, error: findError } = await supabase
        .from('riders_details')
        .select('profile_id, stripe_onboarding_complete')
        .eq('stripe_account_id', account.id)
        .single()

      if (findError) {
        console.error('❌ Error finding rider with Stripe account:', account.id, findError)
        return new Response('Rider not found', { status: 404, headers: corsHeaders })
      }

      console.log('👤 Found rider:', riderDetails.profile_id)
      console.log('🔄 Current onboarding status:', riderDetails.stripe_onboarding_complete)

      // Determina se l'onboarding è completo
      const onboardingComplete =
        account.details_submitted &&
        account.charges_enabled &&
        account.payouts_enabled

      console.log('✅ Setting onboarding_complete to:', onboardingComplete)

      // Aggiorna solo se lo stato è cambiato
      if (riderDetails.stripe_onboarding_complete !== onboardingComplete) {
        const { error: updateError } = await supabase
          .from('riders_details')
          .update({
            stripe_onboarding_complete: onboardingComplete,
            updated_at: new Date().toISOString(),
          })
          .eq('profile_id', riderDetails.profile_id)

        if (updateError) {
          console.error('❌ Error updating rider onboarding status:', updateError)
          return new Response('Failed to update rider', { status: 500, headers: corsHeaders })
        }
        
        console.log('✅ Successfully updated onboarding status for rider:', riderDetails.profile_id)
        console.log('🔄 New status:', onboardingComplete)
      } else {
        console.log('ℹ️ Onboarding status unchanged, no update needed')
      }
    }

    // Restituisci una risposta di successo
    return new Response(
      JSON.stringify({ received: true, processed: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${error.message}` }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
