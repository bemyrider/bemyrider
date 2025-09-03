import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serviceRequests } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, riderResponse, userId } = body

    // Verifica che userId sia presente
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Validazione input
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        error: 'Status must be either "accepted" or "rejected"' 
      }, { status: 400 })
    }

    const requestId = params.id

    // Verifica che la richiesta esista e appartenga al rider
    const [existingRequest] = await db
      .select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.id, requestId),
          eq(serviceRequests.riderId, userId)
        )
      )
      .limit(1)

    if (!existingRequest) {
      return NextResponse.json({ 
        error: 'Service request not found or unauthorized' 
      }, { status: 404 })
    }

    if (existingRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Service request has already been responded to' 
      }, { status: 400 })
    }

    // Aggiorna la richiesta
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({
        status: status as 'accepted' | 'rejected',
        riderResponse: riderResponse || null,
        updatedAt: new Date()
      })
      .where(eq(serviceRequests.id, requestId))
      .returning()

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Service request ${status} successfully`
    })

  } catch (error) {
    console.error('Error responding to service request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}