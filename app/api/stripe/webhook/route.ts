import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Inizializziamo un client Supabase speciale con i privilegi di amministratore
// che può bypassare le policy RLS. Usare SOLO sul server.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Stripe richiede il raw body per la verifica della firma
export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      chunks.push(value);
    }
  }

  // Concatena tutti i chunk in un unico Buffer
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const rawBody = await buffer(req.body as any)

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Gestisci solo gli eventi account.updated
  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account
    const accountId = account.id

    // La condizione migliore per considerare l'onboarding completo è quando
    // i dettagli sono stati inviati E i pagamenti sono stati abilitati.
    if (account.details_submitted && account.charges_enabled) {
      // Aggiorna il rider su Supabase usando il client ADMIN
      const { error } = await supabaseAdmin
        .from('riders_details')
        .update({ stripe_onboarding_complete: true })
        .eq('stripe_account_id', accountId)

      if (error) {
        console.error(`ERRORE nell'aggiornamento Supabase per l'account ${accountId}:`, error)
        // Anche se c'è un errore, restituiamo 200 a Stripe per evitare che ritenti il webhook.
        // L'errore viene loggato per il debug.
        return NextResponse.json({ received: true, error: error.message })
      }
    }
  }

  return NextResponse.json({ received: true })
} 