import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  prenotazioni,
  esercenti,
  profiles,
  ridersDetails,
} from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { merchantId: string } }
) {
  try {
    const merchantId = params.merchantId;

    // Query Drizzle per ottenere le prenotazioni del merchant
    const bookings = await db
      .select({
        id: prenotazioni.id,
        startTime: prenotazioni.startTime,
        endTime: prenotazioni.endTime,
        serviceDurationHours: prenotazioni.serviceDurationHours,
        grossAmount: prenotazioni.grossAmount,
        netAmount: prenotazioni.netAmount,
        status: prenotazioni.status,
        paymentStatus: prenotazioni.paymentStatus,
        createdAt: prenotazioni.createdAt,
        // Informazioni merchant
        merchantName: profiles.fullName,
        businessName: esercenti.businessName,
        merchantAddress: esercenti.address,
        merchantCity: esercenti.city,
        // Informazioni rider
        riderId: ridersDetails.profileId,
        riderName: profiles.fullName,
        hourlyRate: ridersDetails.hourlyRate,
        vehicleType: ridersDetails.vehicleType,
        activeLocation: ridersDetails.activeLocation,
        rating: ridersDetails.rating,
        isVerified: ridersDetails.isVerified,
      })
      .from(prenotazioni)
      .innerJoin(esercenti, eq(prenotazioni.esercenteId, esercenti.id))
      .innerJoin(profiles, eq(esercenti.id, profiles.id)) // Merchant profile
      .innerJoin(
        ridersDetails,
        eq(prenotazioni.riderId, ridersDetails.profileId)
      )
      .where(eq(prenotazioni.esercenteId, merchantId))
      .orderBy(desc(prenotazioni.createdAt))
      .limit(10);

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
