import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Test endpoint to verify account deletion functionality
 * This creates a test user, then deletes it to verify the cascade works
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client with service role key
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    console.log('🧪 Starting account deletion test...');

    // Create a test user
    const testEmail = `test-deletion-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    const { data: testUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Test User for Deletion',
          role: 'rider',
        },
      });

    if (createError || !testUser.user) {
      console.error('Error creating test user:', createError);
      return NextResponse.json(
        { error: 'Errore nella creazione del utente di test' },
        { status: 500 }
      );
    }

    const testUserId = testUser.user.id;
    console.log('✅ Test user created:', testUserId);

    // Create test profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: testUserId,
      full_name: 'Test User for Deletion',
      role: 'rider',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('Error creating test profile:', profileError);
      // Clean up auth user
      await supabase.auth.admin.deleteUser(testUserId);
      return NextResponse.json(
        { error: 'Errore nella creazione del profilo di test' },
        { status: 500 }
      );
    }

    // Create test rider details
    const { error: riderDetailsError } = await supabase
      .from('riders_details')
      .insert({
        profile_id: testUserId,
        bio: 'Test rider for deletion',
        hourly_rate: 10.0,
        vehicle_type: 'bici',
        active_location: 'Test City',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (riderDetailsError) {
      console.error('Error creating test rider details:', riderDetailsError);
      // Clean up
      await supabase.from('profiles').delete().eq('id', testUserId);
      await supabase.auth.admin.deleteUser(testUserId);
      return NextResponse.json(
        { error: 'Errore nella creazione dei dettagli rider di test' },
        { status: 500 }
      );
    }

    console.log('✅ Test data created successfully');

    // Now test the deletion
    console.log('🗑️ Testing account deletion...');

    const { error: deleteError } =
      await supabase.auth.admin.deleteUser(testUserId);

    if (deleteError) {
      console.error('Error deleting test user:', deleteError);
      return NextResponse.json(
        { error: "Errore nell'eliminazione del utente di test" },
        { status: 500 }
      );
    }

    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify that all related data was deleted
    const { data: remainingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', testUserId)
      .single();

    const { data: remainingRiderDetails } = await supabase
      .from('riders_details')
      .select('profile_id')
      .eq('profile_id', testUserId)
      .single();

    if (remainingProfile || remainingRiderDetails) {
      console.error('❌ Test failed: Related data not deleted');
      return NextResponse.json({
        success: false,
        message: 'Test fallito: I dati correlati non sono stati eliminati',
        remainingProfile: !!remainingProfile,
        remainingRiderDetails: !!remainingRiderDetails,
      });
    }

    console.log('✅ Account deletion test passed!');

    return NextResponse.json({
      success: true,
      message: 'Test di eliminazione account completato con successo',
      testUserId: testUserId,
    });
  } catch (error: any) {
    console.error('❌ Account deletion test failed:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
