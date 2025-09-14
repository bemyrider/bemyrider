import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { merchantFavorites, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/favorites - Ottieni i rider preferiti del merchant corrente
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();

    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
        { error: 'Solo gli esercenti possono avere preferiti' },
        { status: 403 }
      );
    }

    // Ottieni tutti i rider preferiti del merchant
    const favorites = await db
      .select({
        riderId: merchantFavorites.riderId,
        createdAt: merchantFavorites.createdAt,
      })
      .from(merchantFavorites)
      .where(eq(merchantFavorites.merchantId, user.id));

    return NextResponse.json({ favorites: favorites.map(f => f.riderId) });
  } catch (error) {
    console.error('Errore nel recupero dei preferiti:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Aggiungi un rider ai preferiti
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();

    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
        { error: 'Solo gli esercenti possono avere preferiti' },
        { status: 403 }
      );
    }

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Corpo della richiesta non valido' },
        { status: 400 }
      );
    }

    const { riderId } = requestBody;

    if (!riderId) {
      return NextResponse.json(
        { error: 'riderId è obbligatorio' },
        { status: 400 }
      );
    }

    // Verifica che il rider esista
    const rider = await db
      .select()
      .from(profiles)
      .where(and(eq(profiles.id, riderId), eq(profiles.role, 'rider')))
      .limit(1);

    if (!rider[0]) {
      return NextResponse.json({ error: 'Rider non trovato' }, { status: 404 });
    }

    // Aggiungi ai preferiti (se non già presente)
    await db
      .insert(merchantFavorites)
      .values({
        merchantId: user.id,
        riderId: riderId,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore nell'aggiunta del preferito:", error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
