import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serviceRequests } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { SYSTEM_CONSTANTS, validateBookingHours } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      riderId,
      startDate,
      startTime,
      duration,
      description,
      merchantAddress,
      userId,
    } = body;

    // Verifica che userId sia presente (inviato dal client)
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Validazione input
    if (
      !riderId ||
      !startDate ||
      !startTime ||
      !duration ||
      !merchantAddress ||
      !description ||
      description.trim().length < 2
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: riderId, startDate, startTime, duration, merchantAddress, description (min 2 characters)',
        },
        { status: 400 }
      );
    }

    // Validazione ore massime
    if (!validateBookingHours(duration)) {
      return NextResponse.json(
        {
          error: `Invalid booking hours: must be between ${SYSTEM_CONSTANTS.MIN_BOOKING_HOURS} and ${SYSTEM_CONSTANTS.MAX_BOOKING_HOURS} hours`,
        },
        { status: 400 }
      );
    }

    // Crea la service request nel database
    // Fix timezone: assicuriamoci che la data sia interpretata correttamente
    const requestDate = new Date(startDate + 'T00:00:00');

    console.log('📅 Creating service request with date:', {
      originalStartDate: startDate,
      parsedRequestDate: requestDate,
      riderId: riderId,
      merchantId: userId,
    });

    const [newRequest] = await db
      .insert(serviceRequests)
      .values({
        merchantId: userId,
        riderId: riderId,
        requestedDate: requestDate,
        startTime: startTime,
        durationHours: duration.toString(),
        description: description || '',
        merchantAddress: merchantAddress,
        status: 'pending',
      })
      .returning();

    console.log('✅ Service request created:', newRequest);

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: 'Service request created successfully',
    });
  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'merchant' o 'rider'
    const userId = searchParams.get('userId');

    if (!type || !userId) {
      return NextResponse.json(
        { error: 'Missing type or userId parameter' },
        { status: 400 }
      );
    }

    let requests;

    if (type === 'merchant') {
      // Ottieni richieste inviate dal merchant
      requests = await db
        .select({
          id: serviceRequests.id,
          riderId: serviceRequests.riderId,
          requestedDate: serviceRequests.requestedDate,
          startTime: serviceRequests.startTime,
          durationHours: serviceRequests.durationHours,
          description: serviceRequests.description,
          merchantAddress: serviceRequests.merchantAddress,
          status: serviceRequests.status,
          riderResponse: serviceRequests.riderResponse,
          createdAt: serviceRequests.createdAt,
          updatedAt: serviceRequests.updatedAt,
        })
        .from(serviceRequests)
        .where(eq(serviceRequests.merchantId, userId))
        .orderBy(desc(serviceRequests.createdAt));
    } else if (type === 'rider') {
      // Ottieni richieste ricevute dal rider
      requests = await db
        .select({
          id: serviceRequests.id,
          merchantId: serviceRequests.merchantId,
          requestedDate: serviceRequests.requestedDate,
          startTime: serviceRequests.startTime,
          durationHours: serviceRequests.durationHours,
          description: serviceRequests.description,
          merchantAddress: serviceRequests.merchantAddress,
          status: serviceRequests.status,
          riderResponse: serviceRequests.riderResponse,
          createdAt: serviceRequests.createdAt,
          updatedAt: serviceRequests.updatedAt,
        })
        .from(serviceRequests)
        .where(eq(serviceRequests.riderId, userId))
        .orderBy(desc(serviceRequests.createdAt));
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
