import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { db } from '@/lib/db';
import { prenotazioni } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: cookieStore }
    );

    // Verifica autenticazione
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verifica che l'utente sia un merchant
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'merchant') {
      return NextResponse.json(
        { error: 'Only merchants can create bookings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { riderId, startDate, startTime, duration, description } = body;

    // Validazione input
    if (!riderId || !startDate || !startTime || !duration) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: riderId, startDate, startTime, duration',
        },
        { status: 400 }
      );
    }

    // Verifica che il rider esista
    const { data: rider } = await supabase
      .from('profiles')
      .select('id, riders_details(hourly_rate)')
      .eq('id', riderId)
      .eq('role', 'rider')
      .single();

    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    // Calcola date e importi
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(
      startDateTime.getTime() + parseFloat(duration) * 60 * 60 * 1000
    );

    const hourlyRate =
      rider.riders_details && rider.riders_details.length > 0
        ? rider.riders_details[0].hourly_rate || 0
        : 0;
    const grossAmount = parseFloat(duration) * hourlyRate;
    const netAmount = grossAmount; // Semplificato - in produzione calcolare tasse

    // Creazione prenotazione nel database con Drizzle
    const newBooking = await db
      .insert(prenotazioni)
      .values({
        esercenteId: user.id,
        riderId: riderId,
        startTime: startDateTime,
        endTime: endDateTime,
        serviceDurationHours: duration, // Passa come stringa
        grossAmount: grossAmount.toString(),
        netAmount: netAmount.toString(),
        taxWithholdingAmount: undefined, // Campo opzionale, non specificato
        status: 'in_attesa',
        paymentStatus: 'in_attesa',
      })
      .returning();

    console.log('📝 Booking created:', {
      id: newBooking[0].id,
      merchantId: user.id,
      riderId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: parseFloat(duration),
      grossAmount,
      netAmount,
      description,
      status: 'in_attesa',
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: newBooking[0].id,
        merchantId: user.id,
        riderId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: parseFloat(duration),
        grossAmount,
        netAmount,
        description: description || '',
        status: 'in_attesa',
        message:
          'Prenotazione simulata creata con successo. Il rider riceverà una notifica.',
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: cookieStore }
    );

    // Verifica autenticazione
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simula recupero prenotazioni per l'utente corrente
    const mockBookings = [
      {
        id: 'booking_demo_1',
        merchantId: user.id,
        riderId: '0e498736-28b8-427b-a45a-2426b3ac8962',
        riderName: 'Marco Rossi',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Domani
        endTime: new Date(
          Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ).toISOString(), // Domani + 2h
        duration: 2,
        grossAmount: 17.0,
        status: 'in_attesa',
        description: 'Consegne zona centro',
      },
    ];

    return NextResponse.json({
      success: true,
      bookings: mockBookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
