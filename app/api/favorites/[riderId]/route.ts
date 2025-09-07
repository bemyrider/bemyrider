import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { merchantFavorites, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// DELETE /api/favorites/[riderId] - Rimuovi un rider dai preferiti
export async function DELETE(
  request: NextRequest,
  { params }: { params: { riderId: string } }
) {
  try {
    const cookieStore = cookies();

('=== FAVORITES DELETE API DEBUG ===');
(
      'Available cookies:',
      cookieStore.getAll().map(c => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value?.length || 0,
      }))
    );

    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {
            // Not needed for getting user
          },
          remove() {
            // Not needed for getting user
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

('Supabase auth result:', {
      userId: user?.id,
      userEmail: user?.email,
      error: authError?.message,
      errorCode: authError?.status,
    });

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Verifica che l'utente sia un merchant
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile[0] || profile[0].role !== 'merchant') {
      return NextResponse.json(
        { error: 'Solo gli esercenti possono gestire i preferiti' },
        { status: 403 }
      );
    }

    const riderId = params.riderId;

    if (!riderId) {
      return NextResponse.json(
        { error: 'riderId è obbligatorio' },
        { status: 400 }
      );
    }

    // Rimuovi dai preferiti
    await db
      .delete(merchantFavorites)
      .where(
        and(
          eq(merchantFavorites.merchantId, user.id),
          eq(merchantFavorites.riderId, riderId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore nella rimozione del preferito:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
