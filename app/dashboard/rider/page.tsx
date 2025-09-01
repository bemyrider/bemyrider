'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bike, Euro, Clock, CheckCircle, AlertCircle, Settings, Calendar, CreditCard, User, AlertTriangle, CircleDollarSign, Zap, BookOpenCheck, Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import DeleteAccountModal from '@/components/DeleteAccountModal'
import TopNavBar from '@/components/TopNavBar'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import UpdateRateModal from '@/components/UpdateRateModal'

type RiderProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  riders_details: {
    bio: string | null
    hourly_rate: number | null
    stripe_account_id: string | null
    stripe_onboarding_complete: boolean | null
  } | null
}

function RiderDashboardContent() {
  const [profile, setProfile] = useState<RiderProfile | null>(null)
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false)
  const [showUpdateRateModal, setShowUpdateRateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null)
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Funzione per verificare e aggiornare lo stato di onboarding
  const checkOnboardingStatus = async () => {
    if (!profile?.riders_details?.stripe_account_id) return false
    
    setCheckingOnboarding(true)
    try {
      const response = await fetch('/api/stripe/onboarding', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔄 Onboarding status check result:', data)
        
        // Se lo stato è cambiato, aggiorna il profilo
        if (data.stripe_onboarding_complete !== profile.riders_details?.stripe_onboarding_complete) {
          console.log('✅ Onboarding status changed, updating profile...')
          await fetchProfile() // Ricarica il profilo
          return data.stripe_onboarding_complete
        }
        
        return data.stripe_onboarding_complete
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    } finally {
      setCheckingOnboarding(false)
    }
    
    return profile.riders_details?.stripe_onboarding_complete || false
  }

  // ✅ NUOVO useEffect SEMPLIFICATO per gestire onboarding_complete
  useEffect(() => {
    const onboardingComplete = searchParams.get('onboarding_complete')

    if (onboardingComplete === 'true') {
      // 1. Log di successo
      console.log('✅ Onboarding Stripe completato con successo!')
      
      // 2. Rimuovi il parametro dall'URL (pulisce l'URL)
      window.history.replaceState({}, '', '/dashboard/rider')
      
      // 3. Ricarica il profilo per mostrare lo stato aggiornato
      fetchProfile()
    } else {
      // Se non stiamo tornando dall'onboarding, carica il profilo normalmente
      fetchProfile()
    }
  }, [searchParams])

  const fetchProfile = async () => {
    try {
      // Get current user from Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('🚫 No authenticated user, redirecting to login')
        router.push('/auth/login')
        return
      }

      console.log('🔍 Fetching profile for user:', user.id, 'Email:', user.email)
      console.log('👤 User metadata:', user.user_metadata)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          role,
          riders_details (
            bio,
            hourly_rate,
            stripe_account_id,
            stripe_onboarding_complete
          )
        `)
        .eq('id', user.id)
        .single()

      if (profileError) {
        // Se il profilo non esiste, creiamolo solo se l'utente dovrebbe essere un rider
        if (profileError.code === 'PGRST116') {
          console.log('📝 No profile found, checking user metadata...')
          
          // Verifica se l'utente dovrebbe essere un rider
          if (user.user_metadata?.role === 'rider' || !user.user_metadata?.role) {
            console.log('📝 Creating rider profile for user:', user.id)
            
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata.full_name || 'New Rider',
                role: 'rider',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (createProfileError) {
              console.error('❌ Error creating rider profile:', createProfileError)
              setError('Errore nella creazione del profilo rider')
              return
            }

            // Create rider details
            const { error: createRiderDetailsError } = await supabase
              .from('riders_details')
              .insert({
                profile_id: user.id,
                hourly_rate: 15, // Default hourly rate
                bio: 'New Rider',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (createRiderDetailsError) {
              console.error('❌ Error creating rider details:', createRiderDetailsError)
              setError('Errore nella creazione dei dettagli del rider')
              return
            }

            console.log('✅ Rider profile created successfully')
            window.location.reload()
            return
          } else {
            console.log('🚫 User metadata does not indicate rider role, redirecting to login')
            router.push('/auth/login')
            return
          }
        }

        console.error('❌ Error fetching profile:', profileError)
        setError('Errore nel caricamento del profilo')
        return
      }

      if (profileData) {
        console.log('📋 Profile found:', profileData)

        // CONTROLLO RIGIDO DEL RUOLO
        if (profileData.role !== 'rider') {
          console.log('🚫 ACCESSO NEGATO: User role is:', profileData.role, '- redirecting to appropriate dashboard')
          
          if (profileData.role === 'merchant') {
            console.log('➡️ Redirecting to merchant dashboard')
            router.push('/dashboard/merchant')
          } else {
            console.log('➡️ Unknown role, redirecting to login')
            router.push('/auth/login')
          }
          return
        }

        console.log('✅ ACCESSO AUTORIZZATO: Rider profile loaded successfully')

        const riderDetails = Array.isArray(profileData.riders_details) 
          ? profileData.riders_details[0] 
          : profileData.riders_details

        setProfile({
          id: profileData.id,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          riders_details: riderDetails || null
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Errore nel caricamento del profilo')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeOnboarding = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/stripe/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante: include i cookie nella richiesta
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start onboarding')
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No URL returned from Stripe')
      }
    } catch (err: any) {
      console.error('Error starting Stripe onboarding:', err)
      setError(err.message || 'Si è verificato un errore durante l\'attivazione dei pagamenti')
    } finally {
      setLoading(false)
    }
  }

  const handleManagePayments = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError("Devi effettuare il login per utilizzare questa funzionalità")
      return
    }

    if (!profile?.riders_details?.stripe_account_id) {
      setError("ID dell'account Stripe non trovato.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/stripe/create-login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: profile.riders_details.stripe_account_id }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.open(url, '_blank')
      }
    } catch (err: any) {
      console.error('Error creating Stripe login link:', err)
      setError(err.message || 'Failed to open Stripe Dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      console.log('🚪 Logging out rider...')
      await supabase.auth.signOut()
      console.log('✅ Logout successful, redirecting to home')
      router.push('/')
    } catch (error) {
      console.error('❌ Error during logout:', error)
      setError('Errore durante il logout')
      setLoggingOut(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!profile) {
    return <div>Could not load profile.</div>
  }

  const riderDetails = profile.riders_details;

  // ✅ RIMOSSO: Non mostrare più la schermata di attesa per onboarding_complete
  // Ora gestiamo tutto nel useEffect semplificato

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <TopNavBar 
        userRole="rider"
        userName={profile?.full_name || 'Rider'}
        onLogout={handleLogout}
        onDeleteAccount={() => setShowDeleteModal(true)}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Benvenuto, {profile.full_name}! 🚴‍♂️
          </h1>
          <p className="text-gray-600">
            Gestisci il tuo profilo, disponibilità e ricevi pagamenti
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Profilo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Nome:</strong> {profile.full_name}</p>
              <p><strong>Tariffa Oraria:</strong> € {riderDetails?.hourly_rate || 0}/h</p>
              <p><strong>Bio:</strong> {riderDetails?.bio || 'Nessuna descrizione aggiunta'}</p>
              <Button variant="outline" className="mt-4 w-full">Modifica Profilo</Button>
            </CardContent>
          </Card>

          {/* Payments Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Pagamenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riderDetails?.stripe_onboarding_complete ? (
                <div className="text-center text-green-600">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Onboarding Stripe Completato</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full"
                    onClick={handleManagePayments}
                    disabled={loading}
                  >
                    {loading ? 'Caricamento...' : 'Gestisci Pagamenti'}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-yellow-600 mb-2">
                    <AlertTriangle className="inline h-5 w-5 mr-1" />
                    Account Stripe Richiesto
                  </p>
                  <p className="text-sm text-gray-500 mb-4">Completa l'onboarding Stripe per ricevere pagamenti</p>
                  <Button 
                    onClick={handleStripeOnboarding}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Caricamento...' : 'Attiva Pagamenti'}
                  </Button>
                  {riderDetails?.stripe_account_id && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={checkOnboardingStatus}
                        disabled={checkingOnboarding}
                      >
                        {checkingOnboarding ? 'Verificando...' : 'Verifica Stato'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <CardTitle>Disponibilità</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                variant="outline" 
                disabled={!riderDetails?.stripe_onboarding_complete}
                onClick={() => setShowAvailabilityCalendar(true)}
              >
                Gestisci Calendario
              </Button>
              {!riderDetails?.stripe_onboarding_complete && (
                <p className="text-xs text-orange-500 mt-2">Completa l'onboarding Stripe per abilitare questa funzione</p>
              )}
            </CardContent>
          </Card>

          {/* Bookings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5" /> Prenotazioni
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500 mb-4">Prenotazioni Attive</p>
              <Button variant="outline" disabled={!riderDetails?.stripe_onboarding_complete}>Visualizza Tutte</Button>
               {!riderDetails?.stripe_onboarding_complete && (
                <p className="text-xs text-orange-500 mt-2">Completa l'onboarding Stripe per abilitare questa funzione</p>
              )}
            </CardContent>
          </Card>

          {/* Earnings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5" /> Guadagni
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold">€0</p>
              <p className="text-sm text-gray-500 mb-4">Questo mese</p>
              <Button variant="outline" disabled={!riderDetails?.stripe_onboarding_complete}>Visualizza Storico</Button>
               {!riderDetails?.stripe_onboarding_complete && (
                <p className="text-xs text-orange-500 mt-2">Completa l'onboarding Stripe per abilitare questa funzione</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" /> Azioni Rapide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               <Button 
                variant="outline" 
                className="w-full justify-start" 
                disabled={!riderDetails?.stripe_onboarding_complete}
                onClick={() => setShowUpdateRateModal(true)}
              >
                <Euro className="mr-2 h-4 w-4"/> Aggiorna Tariffa
              </Button>
               <Button variant="outline" className="w-full justify-start" disabled={!riderDetails?.stripe_onboarding_complete}><Settings className="mr-2 h-4 w-4"/> Impostazioni</Button>
               <Button variant="outline" className="w-full justify-start" disabled={!riderDetails?.stripe_onboarding_complete}><Clock className="mr-2 h-4 w-4"/> Cronologia</Button>
               {!riderDetails?.stripe_onboarding_complete && (
                <p className="text-xs text-orange-500 mt-2 text-center">Completa l'onboarding Stripe per abilitare questa funzione</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Modal */}
            <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userRole="rider"
      />

      {/* Availability Calendar Modal */}
      {showAvailabilityCalendar && profile && (
        <AvailabilityCalendar
          riderId={profile.id}
          onClose={() => setShowAvailabilityCalendar(false)}
        />
      )}

      {/* Update Rate Modal */}
      {showUpdateRateModal && profile && (
        <UpdateRateModal
          riderId={profile.id}
          currentRate={profile.riders_details?.hourly_rate || null}
          onClose={() => setShowUpdateRateModal(false)}
        />
      )}
    </div>
  )
}

export default function RiderDashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    }>
      <RiderDashboardContent />
    </Suspense>
  )
}