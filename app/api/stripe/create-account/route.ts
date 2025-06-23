import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
      headers: req.headers,
    }
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'IT',
      email: user.email,
      business_type: 'individual',
      business_profile: {
        mcc: '8299', // Scuole e servizi educativi
        url: `https://bemyrider.com/rider/${user.id}`,
      },
      company: {
        // L'oggetto company è richiesto anche per gli individual in IT
        // per raccogliere Codice Fiscale e Partita IVA. Lasciarlo vuoto
        // forza Stripe a richiederli durante l'onboarding.
      },
      individual: {
        // Idem per l'oggetto individual.
      },
    })

    // Associa l'ID dell'account Stripe all'utente nel tuo DB
    const { error: updateError } = await supabase
      .from('riders_details')
      .update({ stripe_account_id: account.id })
      .eq('id', user.id)

    if (updateError) {
      console.error("Errore nell'aggiornare l'utente con l'ID Stripe:", updateError)
      throw updateError
    }

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: req.nextUrl.origin + '/dashboard/rider',
      return_url: req.nextUrl.origin + '/dashboard/rider',
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Errore nella creazione dell\'account Stripe:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create Stripe account' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 