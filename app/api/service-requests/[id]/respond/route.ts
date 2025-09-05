import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serviceRequests } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Starting service request response process');
    console.log('📝 Request params:', { id: params.id });

    const body = await request.json();
    const { status, riderResponse, userId } = body;
    console.log('📦 Request body:', { status, riderResponse: riderResponse ? 'present' : 'null', userId });

    // Verify authentication
    console.log('🔐 Verifying authentication...');
    const supabase = createClient();
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Auth header present:', !!authHeader);

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      console.log('👤 Auth user:', user ? { id: user.id, email: user.email } : 'null');
      if (error) console.log('❌ Auth error:', error);
    }

    // Test database connection
    console.log('🔌 Testing database connection...');
    try {
      await db.execute('SELECT 1');
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection error', details: dbError instanceof Error ? dbError.message : 'Unknown DB error' },
        { status: 500 }
      );
    }

    // Verifica che userId sia presente
    if (!userId) {
      console.log('❌ User ID missing');
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Validazione input
    if (!status || !['accepted', 'rejected'].includes(status)) {
      console.log('❌ Invalid status:', status);
      return NextResponse.json(
        {
          error: 'Status must be either "accepted" or "rejected"',
        },
        { status: 400 }
      );
    }

    const requestId = params.id;
    console.log('🔍 Checking existing request for ID:', requestId);

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
      .limit(1);

    console.log('📋 Existing request result:', existingRequest ? 'found' : 'not found');

    if (!existingRequest) {
      console.log('❌ Service request not found or unauthorized');
      return NextResponse.json(
        {
          error: 'Service request not found or unauthorized',
        },
        { status: 404 }
      );
    }

    if (existingRequest.status !== 'pending') {
      console.log('❌ Request already responded, status:', existingRequest.status);
      return NextResponse.json(
        {
          error: 'Service request has already been responded to',
        },
        { status: 400 }
      );
    }

    console.log('✅ Request validation passed, updating...');

    // Aggiorna la richiesta
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({
        status: status as 'accepted' | 'rejected',
        riderResponse: riderResponse || null,
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    console.log('✅ Update successful, returning response');

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Service request ${status} successfully`,
    });
  } catch (error) {
    console.error('❌ Error responding to service request:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
