// ✅ API Route ATTIVA per gestire webhook Stripe
// Gestisce gli aggiornamenti automatici dell'onboarding dei rider

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Inizializziamo un client Supabase speciale con i privilegi di amministratore
// che può bypassare le policy RLS. Usare SOLO sul server.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Stripe richiede il raw body per la verifica della firma
// In App Router questo è gestito automaticamente con req.text()

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Gestisci solo gli eventi account.updated
  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account;
    const accountId = account.id;

    console.log('🔄 Webhook ricevuto per account:', accountId);
    console.log('📊 Account status:', {
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    });

    // The condition to consider onboarding complete is when
    // the details have been submitted AND payments have been enabled.
    if (account.details_submitted && account.charges_enabled) {
      console.log('✅ Onboarding completato per account:', accountId);
      // Aggiorna il rider su Supabase usando il client ADMIN
      const { error } = await supabaseAdmin
        .from('riders_details')
        .update({
          stripe_onboarding_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_account_id', accountId);

      if (error) {
        console.error(
          `❌ ERRORE nell'aggiornamento database per account ${accountId}:`,
          error
        );
        // Anche se c'è un errore, restituiamo 200 a Stripe per evitare che ritenti il webhook.
        // L'errore viene loggato per il debug.
        return NextResponse.json({ received: true, error: error.message });
      }

      console.log(
        '✅ Database aggiornato con successo per account:',
        accountId
      );
    } else {
      console.log('⏳ Onboarding non ancora completo per account:', accountId);
    }
  } else {
    console.log('📨 Webhook ricevuto per evento non gestito:', event.type);
  }

  return NextResponse.json({ received: true });
}
