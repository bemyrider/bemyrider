import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Recupera profilo utente dal database
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile[0]);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const body = await request.json();
    const { full_name, role } = body;

    // Crea o aggiorna profilo utente
    const profileData = {
      id: userId,
      full_name: full_name || null,
      role,
      updated_at: new Date(),
    };

    // Usa upsert per creare o aggiornare
    const upsertedProfile = await db
      .insert(profiles)
      .values(profileData)
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          fullName: full_name || null,
          role,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({
      success: true,
      profile: upsertedProfile[0],
    });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
