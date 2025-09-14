import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Admin endpoint to clean up orphaned records
 * Records that exist in profiles/riders_details but not in auth.users
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client with service role key for admin operations
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get user from session to verify admin access
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    console.log('🧹 Starting orphan cleanup process...');

    // Find orphaned profiles (profiles without corresponding auth.users)
    const { data: orphanedProfiles, error: orphanError } = await supabase.rpc(
      'find_orphaned_profiles'
    );

    if (orphanError) {
      console.error('Error finding orphaned profiles:', orphanError);
      return NextResponse.json(
        { error: 'Errore nel trovare i profili orfani' },
        { status: 500 }
      );
    }

    if (!orphanedProfiles || orphanedProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nessun record orfano trovato',
        cleaned: 0,
      });
    }

    console.log(
      `🔍 Found ${orphanedProfiles.length} orphaned profiles:`,
      orphanedProfiles
    );

    let cleanedCount = 0;

    // Clean up each orphaned profile
    for (const profile of orphanedProfiles) {
      try {
        console.log(
          `🗑️ Cleaning up orphaned profile: ${profile.id} (${profile.full_name})`
        );

        // Delete riders_details
        const { error: ridersDetailsError } = await supabase
          .from('riders_details')
          .delete()
          .eq('profile_id', profile.id);

        if (ridersDetailsError) {
          console.error(
            `Error deleting riders_details for ${profile.id}:`,
            ridersDetailsError
          );
        }

        // Delete riders_tax_details
        const { error: taxDetailsError } = await supabase
          .from('riders_tax_details')
          .delete()
          .eq('profile_id', profile.id);

        if (taxDetailsError) {
          console.error(
            `Error deleting riders_tax_details for ${profile.id}:`,
            taxDetailsError
          );
        }

        // Delete bookings
        const { error: bookingsError } = await supabase
          .from('bookings')
          .delete()
          .or(`rider_id.eq.${profile.id},merchant_id.eq.${profile.id}`);

        if (bookingsError) {
          console.error(
            `Error deleting bookings for ${profile.id}:`,
            bookingsError
          );
        }

        // Delete reviews
        const { error: reviewsError } = await supabase
          .from('reviews')
          .delete()
          .or(`rider_id.eq.${profile.id},merchant_id.eq.${profile.id}`);

        if (reviewsError) {
          console.error(
            `Error deleting reviews for ${profile.id}:`,
            reviewsError
          );
        }

        // Finally delete the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id);

        if (profileError) {
          console.error(`Error deleting profile ${profile.id}:`, profileError);
        } else {
          cleanedCount++;
          console.log(`✅ Successfully cleaned up profile: ${profile.id}`);
        }
      } catch (error) {
        console.error(`Error cleaning up profile ${profile.id}:`, error);
      }
    }

    console.log(
      `✅ Orphan cleanup completed. Cleaned ${cleanedCount} profiles.`
    );

    return NextResponse.json({
      success: true,
      message: `Pulizia completata. ${cleanedCount} profili orfani eliminati.`,
      cleaned: cleanedCount,
      total: orphanedProfiles.length,
    });
  } catch (error: any) {
    console.error('❌ Orphan cleanup failed:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
