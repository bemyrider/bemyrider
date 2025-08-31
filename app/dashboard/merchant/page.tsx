'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Store, Search, Calendar, Clock, CreditCard, User, MapPin, Plus, BookOpenCheck, Euro
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type MerchantProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: 'merchant' | 'rider'
}

type Rider = {
  id: string
  full_name: string
  avatar_url: string | null
  riders_details: {
    bio: string | null
    hourly_rate: number
    stripe_onboarding_complete: boolean
  }
}

type Booking = {
  id: string
  start_time: string
  end_time: string
  total_amount: number
  status: 'confermata' | 'completata' | 'cancellata'
  rider: {
    full_name: string
  }
}

export default function MerchantDashboard() {
  const [profile, setProfile] = useState<MerchantProfile | null>(null)
  const [riders, setRiders] = useState<Rider[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const fetchProfile = async () => {
    try {
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
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        // Se il profilo non esiste, creiamolo come merchant
        if (profileError.code === 'PGRST116') {
          console.log('📝 No profile found, checking user metadata...')
          
          // Verifica se l'utente dovrebbe essere un merchant
          if (user.user_metadata?.role === 'merchant') {
            console.log('📝 Creating merchant profile for user:', user.id)
            
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'New Merchant',
                role: 'merchant',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (createProfileError) {
              console.error('❌ Error creating merchant profile:', createProfileError)
              setError('Errore nella creazione del profilo merchant')
              return
            }

            console.log('✅ Merchant profile created successfully')
            window.location.reload()
            return
          } else {
            console.log('🚫 User metadata does not indicate merchant role, redirecting to login')
            router.push('/auth/login')
            return
          }
        }

        console.error('Error fetching profile:', profileError)
        setError('Errore nel caricamento del profilo')
        return
      }

      console.log('📋 Profile found:', profileData)

      // CONTROLLO RIGIDO DEL RUOLO
      if (profileData.role !== 'merchant') {
        console.log('🚫 ACCESSO NEGATO: User role is:', profileData.role, '- redirecting to appropriate dashboard')
        
        if (profileData.role === 'rider') {
          console.log('➡️ Redirecting to rider dashboard')
          router.push('/dashboard/rider')
        } else {
          console.log('➡️ Unknown role, redirecting to login')
          router.push('/auth/login')
        }
        return
      }

      console.log('✅ ACCESSO AUTORIZZATO: Merchant profile loaded successfully')
      setProfile(profileData)
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      setError('Errore nel caricamento del profilo')
    }
  }

  const fetchRiders = async () => {
    try {
      const { data: ridersData, error: ridersError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          riders_details (
            bio,
            hourly_rate,
            stripe_onboarding_complete
          )
        `)
        .eq('role', 'rider')
        .not('riders_details', 'is', null)
        .eq('riders_details.stripe_onboarding_complete', true)

      if (ridersError) {
        throw ridersError
      }

      // Trasforma i dati per assicurarsi che riders_details sia un oggetto
      const transformedRiders = (ridersData || []).map(rider => ({
        ...rider,
        riders_details: Array.isArray(rider.riders_details) 
          ? rider.riders_details[0] 
          : rider.riders_details
      })).filter(rider => rider.riders_details) // Filtra rider senza dettagli
      
      setRiders(transformedRiders)
    } catch (error: any) {
      console.error('Error fetching riders:', error)
      setError('Errore nel caricamento dei rider')
    }
  }

  const fetchBookings = async () => {
    if (!profile) return

    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          end_time,
          total_amount,
          status,
          rider:profiles!rider_id (
            full_name
          )
        `)
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (bookingsError) {
        throw bookingsError
      }

      // Trasforma i dati per assicurarsi che rider sia un oggetto
      const transformedBookings = (bookingsData || []).map(booking => ({
        ...booking,
        rider: Array.isArray(booking.rider) 
          ? booking.rider[0] 
          : booking.rider
      })).filter(booking => booking.rider) // Filtra booking senza rider
      
      setBookings(transformedBookings)
    } catch (error: any) {
      console.error('Error fetching bookings:', error)
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      await fetchProfile()
      await fetchRiders()
    }
    
    initializeData()
  }, [])

  useEffect(() => {
    if (profile) {
      fetchBookings()
    }
  }, [profile])

  const filteredRiders = riders.filter(rider =>
    rider.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDateTime = (dateTime: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateTime))
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      console.log('🚪 Logging out merchant...')
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

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src="/bemyrider_logo.svg" alt="bemyrider logo" className="h-8 w-auto" />
                <span className="text-xl font-bold text-gray-900">bemyrider</span>
              </div>
              <div className="h-6 border-l border-gray-300"></div>
              <span className="text-gray-600">Dashboard Esercente</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/riders')}>
                <Search className="h-4 w-4 mr-2" />
                Trova Rider
              </Button>
              <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? 'Logout...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Benvenuto, {profile.full_name}! 🏪
          </h1>
          <p className="text-gray-600">
            Trova rider qualificati per le tue consegne e gestisci le prenotazioni
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rider Disponibili</p>
                    <p className="text-2xl font-bold text-gray-900">{riders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Prenotazioni Attive</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.filter(b => b.status === 'confermata').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpenCheck className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Consegne Completate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.filter(b => b.status === 'completata').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Euro className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Spesa Totale</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(bookings.reduce((sum, b) => sum + b.total_amount, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Riders Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" /> Rider Disponibili
              </CardTitle>
              <CardDescription>
                Trova e prenota rider per le tue consegne
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cerca rider per nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={() => router.push('/riders')}>
                    Visualizza Tutti
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredRiders.slice(0, 5).map((rider) => (
                    <div key={rider.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          {rider.avatar_url ? (
                            <img src={rider.avatar_url} alt={rider.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-semibold">
                              {rider.full_name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{rider.full_name}</p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(rider.riders_details.hourly_rate)}/ora
                          </p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => router.push(`/riders/${rider.id}`)}>
                        <Clock className="h-4 w-4 mr-1" />
                        Prenota
                      </Button>
                    </div>
                  ))}
                  
                  {filteredRiders.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nessun rider trovato
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Prenotazioni Recenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div key={booking.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{booking.rider.full_name}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confermata' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'completata' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(booking.start_time)}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Nessuna prenotazione ancora
                  </p>
                )}
              </div>
              
              {bookings.length > 0 && (
                <Button variant="outline" className="w-full mt-4">
                  Visualizza Tutte
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/riders')}>
              <CardContent className="p-6 text-center">
                <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Trova Rider</h3>
                <p className="text-sm text-gray-600">Cerca rider disponibili nella tua zona</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Gestisci Prenotazioni</h3>
                <p className="text-sm text-gray-600">Visualizza e gestisci le tue prenotazioni</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Profilo Esercente</h3>
                <p className="text-sm text-gray-600">Modifica le informazioni del tuo negozio</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
