import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { riderId, merchantId, startTime, endTime, hours, riderAmount } =
      await request.json();

    if (
      !riderId ||
      !merchantId ||
      !startTime ||
      !endTime ||
      !hours ||
      !riderAmount
    ) {
      return NextResponse.json(
        { error: 'All booking details are required, including riderAmount' },
        { status: 400 }
      );
    }

    // --- Logica di calcolo dinamico ---
    const PLATFORM_FEE_PERCENTAGE = 0.15; // 15%
    const platformFee = riderAmount * PLATFORM_FEE_PERCENTAGE;
    const totalAmount = riderAmount + platformFee;
    // ------------------------------------

    // Get rider's Stripe account ID
    const { data: riderDetails, error: riderError } = await supabase
      .from('riders_details')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('profile_id', riderId)
      .single();

    if (riderError || !riderDetails) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    if (!riderDetails.stripe_account_id) {
      return NextResponse.json(
        { error: 'Rider has not completed Stripe onboarding' },
        { status: 400 }
      );
    }

    if (!riderDetails.stripe_onboarding_complete) {
      return NextResponse.json(
        { error: 'Rider has not completed Stripe onboarding' },
        { status: 400 }
      );
    }

    // Create payment intent with destination charges
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'eur',
      application_fee_amount: Math.round(platformFee * 100), // Platform fee in cents
      transfer_data: {
        destination: riderDetails.stripe_account_id,
      },
      metadata: {
        riderId,
        merchantId,
        startTime,
        endTime,
        hours: hours.toString(),
        riderAmount: riderAmount.toString(),
        platformFee: platformFee.toString(),
        totalAmount: totalAmount.toString(),
      },
    });

    // Create booking record
    const { error: bookingError } = await supabase.from('bookings').insert({
      rider_id: riderId,
      merchant_id: merchantId,
      start_time: startTime,
      end_time: endTime,
      rider_amount: riderAmount,
      platform_fee: platformFee,
      total_amount: totalAmount,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'confermata',
    });

    if (bookingError) {
      return NextResponse.json(
        { error: 'Failed to create booking record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
