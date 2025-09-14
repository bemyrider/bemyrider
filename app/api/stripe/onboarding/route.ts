import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';
import type { NextRequest } from 'next/server';

// Funzione per verificare e aggiornare lo stato di onboarding
async function checkAndUpdateOnboardingStatus(
  stripeAccountId: string,
  supabase: any
) {
  try {
    console.log(
      '🔍 Checking onboarding status for Stripe account:',
      stripeAccountId
    );

    // Ottieni i dettagli dell'account Stripe
    const account = await stripe.accounts.retrieve(stripeAccountId);

    console.log('📊 Account details:', {
      id: account.id,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    });

    // Determina se l'onboarding è completo
    // NOTA: Alcuni account potrebbero non avere payouts_enabled inizialmente
    // Quindi controlliamo solo details_submitted && charges_enabled
    const onboardingComplete =
      account.details_submitted && account.charges_enabled;

    console.log('✅ Onboarding complete status:', onboardingComplete);
    console.log('📊 Account flags:', {
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    });

    // Aggiorna il database
    const { error: updateError } = await supabase
      .from('riders_details')
      .update({
        stripe_onboarding_complete: onboardingComplete,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', stripeAccountId);

    if (updateError) {
      console.error('❌ Error updating onboarding status:', updateError);
      return false;
    }

    console.log('✅ Database updated successfully');
    return onboardingComplete;
  } catch (error) {
    console.error('❌ Error checking onboarding status:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();

  // Inizializza Supabase con il cookie store
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  try {
    console.log('🚀 Starting Stripe onboarding process...');

    // Verifica l'utente autenticato per sicurezza
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ User authentication error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verifica anche la sessione per compatibilità API
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('❌ Session error:', sessionError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user) {
      console.error('❌ No user in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 User authenticated:', user.id, user.email);

    // Verifica se l'utente ha già un account Stripe
    const { data: existingRider, error: checkError } = await supabase
      .from('riders_details')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('profile_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('❌ Error checking existing rider:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing rider' },
        { status: 500 }
      );
    }

    if (existingRider?.stripe_account_id) {
      console.log(
        'ℹ️ User already has Stripe account:',
        existingRider.stripe_account_id
      );
      console.log(
        '🔄 Current onboarding status:',
        existingRider.stripe_onboarding_complete
      );

      // Verifica e aggiorna lo stato di onboarding
      const currentStatus = await checkAndUpdateOnboardingStatus(
        existingRider.stripe_account_id,
        supabase
      );

      // Se l'onboarding è già completo, reindirizza alla dashboard
      if (currentStatus) {
        console.log('✅ Onboarding already complete, redirecting to dashboard');
        const origin = request.headers.get('origin') || 'http://localhost:3000';
        return NextResponse.json({
          url: `${origin}/dashboard/rider?onboarding_complete=true`,
          status: 'already_complete',
        });
      }
    }

    console.log('🏗️ Creating new Stripe Express account...');

    // Crea l'account Stripe Express
    const stripeAccount = await stripe.accounts.create({
      type: 'express',
      country: 'IT',
      email: user.email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    console.log('✅ Stripe account created:', stripeAccount.id);

    // Aggiorna il database con l'ID dell'account Stripe
    const { error: updateError } = await supabase
      .from('riders_details')
      .update({
        stripe_account_id: stripeAccount.id,
        stripe_onboarding_complete: false, // Inizialmente false
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', user.id);

    if (updateError) {
      console.error('❌ Error updating rider profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    console.log('✅ Database updated with Stripe account ID');

    // Crea il link di onboarding
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${origin}/dashboard/rider`,
      return_url: `${origin}/dashboard/rider?onboarding_complete=true`,
      type: 'account_onboarding',
    });

    console.log('🔗 Onboarding link created:', accountLink.url);
    console.log('✅ Onboarding process completed successfully');

    return NextResponse.json({
      url: accountLink.url,
      stripe_account_id: stripeAccount.id,
      status: 'created',
    });
  } catch (error) {
    console.error('❌ Error in onboarding process:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    );
  }
}

// Endpoint per verificare lo stato di onboarding
export async function GET(request: NextRequest) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  try {
    // Verifica la sessione
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ottieni i dettagli del rider
    const { data: riderDetails, error: fetchError } = await supabase
      .from('riders_details')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('profile_id', user.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    if (!riderDetails.stripe_account_id) {
      return NextResponse.json({
        status: 'no_stripe_account',
        stripe_onboarding_complete: false,
      });
    }

    // Verifica lo stato attuale su Stripe
    const currentStatus = await checkAndUpdateOnboardingStatus(
      riderDetails.stripe_account_id,
      supabase
    );

    return NextResponse.json({
      status: 'has_stripe_account',
      stripe_account_id: riderDetails.stripe_account_id,
      stripe_onboarding_complete: currentStatus,
    });
  } catch (error) {
    console.error('❌ Error in onboarding process:', error);
    // Restituisci l'errore specifico invece del messaggio generico
    return NextResponse.json(
      {
        error: 'Failed to create Stripe account',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ENDPOINT DI TEST TEMPORANEO - Rimuovi in produzione!
export async function PUT(request: NextRequest) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  try {
    const { stripeAccountId } = await request.json();
    console.log(
      '🧪 TEST: Checking onboarding status for account:',
      stripeAccountId
    );

    const account = await stripe.accounts.retrieve(stripeAccountId);
    console.log('📊 Account status:', {
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    });

    const onboardingComplete =
      account.details_submitted && account.charges_enabled;
    console.log('✅ Onboarding complete:', onboardingComplete);

    // Aggiorna il database
    const { error } = await supabase
      .from('riders_details')
      .update({
        stripe_onboarding_complete: onboardingComplete,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', stripeAccountId);

    if (error) {
      console.error('❌ Database update error:', error);
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }

    console.log('✅ Database updated successfully');
    return NextResponse.json({
      success: true,
      onboarding_complete: onboardingComplete,
      account_status: {
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      },
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}
