import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
// import { adaptBooking } from '@/lib/adapters' // TODO: Update to Drizzle

export async function GET(
  request: NextRequest,
  { params }: { params: { merchantId: string } }
) {
  try {
    const merchantId = params.merchantId

    // TODO: Convert to Drizzle query
    // Fetch bookings for merchant  
    /*const bookings = await prisma.prenotazione.findMany({
      where: { esercente_id: merchantId },
      include: {
        esercente: {
          include: {
            profile: true
          }
        },
        rider: {
          include: {
            profile: true
          }
        },
        recensione: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Transform to legacy format
    const adaptedBookings = bookings.map(booking => ({
      id: booking.id,
      start_time: booking.start_time.toISOString(),
      end_time: booking.end_time.toISOString(),
      total_amount: Number(booking.gross_amount),
      status: booking.status,
      rider: {
        full_name: `${booking.rider.first_name} ${booking.rider.last_name}`
      }
    }))*/

    // Temporary: return empty array
    return NextResponse.json([])

  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
