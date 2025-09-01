import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { db, profiles, esercenti, riders, ridersDetails, prenotazioni, recensioni, disponibilitaRiders, riderTaxDetails, esercenteTaxDetails } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Starting account deletion process...')
    
    // Create Supabase server client for API routes with cookie access
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ No authenticated user:', authError)
      return NextResponse.json(
        { error: 'Non autorizzato' }, 
        { status: 401 }
      )
    }

    const userId = user.id
    console.log('👤 Deleting account for user:', userId)

    // Get user profile to determine type
    const userProfile = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)

    if (userProfile.length === 0) {
      return NextResponse.json(
        { error: 'Profilo non trovato' }, 
        { status: 404 }
      )
    }

    const userRole = userProfile[0].role
    console.log('📋 User role:', userRole)

    // Start transaction-like deletion (Drizzle handles foreign key cascades)
    try {
      // Delete role-specific data first
      if (userRole === 'merchant') {
        console.log('🏪 Deleting merchant-specific data...')
        
        // Delete esercente tax details
        await db.delete(esercenteTaxDetails).where(eq(esercenteTaxDetails.esercenteId, userId))
        
        // Delete esercente profile
        await db.delete(esercenti).where(eq(esercenti.id, userId))
        
      } else if (userRole === 'rider') {
        console.log('🚴 Deleting rider-specific data...')
        
        // Delete rider tax details
        await db.delete(riderTaxDetails).where(eq(riderTaxDetails.riderId, userId))
        
        // Delete disponibilità
        await db.delete(disponibilitaRiders).where(eq(disponibilitaRiders.riderId, userId))
        
        // Delete rider profile
        await db.delete(riders).where(eq(riders.id, userId))
      }

      // Delete shared data (with foreign key constraints)
      console.log('🔗 Deleting shared data...')
      
      // Delete recensioni (as both esercente and rider)
      await db.delete(recensioni).where(eq(recensioni.esercenteId, userId))
      await db.delete(recensioni).where(eq(recensioni.riderId, userId))
      
      // Delete prenotazioni (as both esercente and rider)  
      await db.delete(prenotazioni).where(eq(prenotazioni.esercenteId, userId))
      await db.delete(prenotazioni).where(eq(prenotazioni.riderId, userId))
      
      // Delete riders_details (Stripe integration)
      await db.delete(ridersDetails).where(eq(ridersDetails.profileId, userId))
      
      // Finally, delete the main profile
      console.log('👤 Deleting main profile...')
      await db.delete(profiles).where(eq(profiles.id, userId))
      
      // Delete from Supabase Auth
      console.log('🔐 Deleting from Supabase Auth...')
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
      
      if (deleteAuthError) {
        console.error('⚠️ Warning: Failed to delete from auth:', deleteAuthError)
        // Continue anyway - profile data is deleted
      }

      console.log('✅ Account deletion completed successfully')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Account eliminato con successo' 
      })

    } catch (dbError: any) {
      console.error('❌ Database deletion error:', dbError)
      return NextResponse.json(
        { error: 'Errore durante l\'eliminazione del database' }, 
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Account deletion failed:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' }, 
      { status: 500 }
    )
  }
}
