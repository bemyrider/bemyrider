'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bike, Clock, Euro, Search, Filter, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { UserNav } from '@/components/UserNav'

interface Rider {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  hourly_rate: number
  vehicle_type: string | null
  profile_picture_url: string | null
  active_location: string | null
}

// Mock data for demonstration
const mockRiders: Rider[] = [
  {
    id: '1',
    full_name: 'Marco Rossi',
    avatar_url: null,
    bio: 'Rider di test per bemyrider. Esperienza nelle consegne urbane.',
    hourly_rate: 8.5,
    vehicle_type: 'bici',
    profile_picture_url: null,
    active_location: 'Milano'
  },
  {
    id: '2',
    full_name: 'Invalid User',
    avatar_url: null,
    bio: 'New Rider',
    hourly_rate: 15,
    vehicle_type: 'Veicolo',
    profile_picture_url: null,
    active_location: 'Milano'
  },
  {
    id: '3',
    full_name: 'Rider User A',
    avatar_url: null,
    bio: 'New Rider',
    hourly_rate: 15,
    vehicle_type: 'Veicolo',
    profile_picture_url: null,
    active_location: 'Milano'
  }
]

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [minRate, setMinRate] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRiders()
  }, [])

  const fetchRiders = async () => {
    try {
      // Check if Supabase is properly configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        // Use mock data for demonstration
        setRiders(mockRiders)
        setLoading(false)
        return
      }

      // Usa query separata più robusta invece di LEFT JOIN che può causare problemi
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'rider')
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        setError('Errore nel caricamento dei rider')
        setRiders(mockRiders)
        return
      }

      // Fetch rider details separatamente per ogni rider
      const ridersWithDetails = []
      for (const profile of profilesData || []) {
        const { data: detailsData } = await supabase
          .from('riders_details')
          .select('bio, hourly_rate, vehicle_type, profile_picture_url, active_location')
          .eq('profile_id', profile.id)
          .single()
        
        ridersWithDetails.push({
          id: profile.id,
          full_name: profile.full_name || 'Rider',
          avatar_url: profile.avatar_url,
          bio: detailsData?.bio || null,
          hourly_rate: detailsData?.hourly_rate || 15,
          vehicle_type: detailsData?.vehicle_type || 'Veicolo',
          profile_picture_url: detailsData?.profile_picture_url || null,
          active_location: detailsData?.active_location || null,
        })
      }
      
      setRiders(ridersWithDetails)
    } catch (error) {
      console.error('Error:', error)
      setError('Errore nel caricamento dei rider')
      // Fallback to mock data
      setRiders(mockRiders)
    } finally {
      setLoading(false)
    }
  }

  const filteredRiders = riders.filter(rider => {
    const matchesSearch = rider.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (rider.bio && rider.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesMinRate = !minRate || rider.hourly_rate >= parseFloat(minRate)
    const matchesMaxRate = !maxRate || rider.hourly_rate <= parseFloat(maxRate)
    
    const matchesLocation = !locationFilter || 
                           (rider.active_location && rider.active_location.toLowerCase().includes(locationFilter.toLowerCase()))
    
    return matchesSearch && matchesMinRate && matchesMaxRate && matchesLocation
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/bemyrider_logo.svg" alt="bemyrider logo" className="h-8 w-auto" />
              <span className="text-2xl font-bold text-gray-900 logo-font">bemyrider</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <UserNav />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trova il tuo Rider
          </h1>
          <p className="text-gray-600">
            Sfoglia i rider disponibili e prenota il servizio di consegna
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
              ⚠️ Modalità demo: Visualizzazione dati di esempio. Configura Supabase per i dati reali.
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline h-4 w-4 mr-1" />
                Cerca
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome o descrizione..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Euro className="inline h-4 w-4 mr-1" />
                Tariffa Minima (€/h)
              </label>
              <input
                type="number"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Euro className="inline h-4 w-4 mr-1" />
                Tariffa Massima (€/h)
              </label>
              <input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Località
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Milano, Roma, Torino..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setMinRate('')
                  setMaxRate('')
                  setLocationFilter('')
                }}
                variant="outline"
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset Filtri
              </Button>
            </div>
          </div>
        </div>

        {/* Riders Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{borderBottomColor: '#333366'}}></div>
            <p className="mt-4 text-gray-600">Caricamento rider...</p>
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="text-center py-12">
            <Bike className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessun rider trovato
            </h3>
            <p className="text-gray-600">
              Prova a modificare i filtri di ricerca
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRiders.map((rider) => (
              <Card key={rider.id} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="relative px-6 pt-6 pb-6">
                  {/* Profile Picture - Centrata senza gradiente */}
                  <div className="flex justify-center mb-4">
                    {rider.profile_picture_url || rider.avatar_url ? (
                      <div className="relative">
                        <img 
                          src={rider.profile_picture_url || rider.avatar_url || ''} 
                          alt={rider.full_name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {/* Badge di stato online */}
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 border-white" style={{background: 'linear-gradient(to bottom right, #333366, #4a4a7a)'}}>
                          <span className="text-2xl font-bold text-white">
                            {rider.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nome e rating */}
                  <div className="text-center mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {rider.full_name}
                    </h3>
                    
                    {/* Rating stelle (simulato) */}
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 1l2.5 6.5h6.5l-5.25 4 2 6.5-5.75-4.25-5.75 4.25 2-6.5-5.25-4h6.5z"/>
                        </svg>
                      ))}
                      <span className="text-xs text-gray-600 ml-1">5.0</span>
                    </div>

                    {/* Tipo di veicolo con icona */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {rider.vehicle_type === 'bici' && <span>🚲</span>}
                      {rider.vehicle_type === 'bicicletta' && <span>🚲</span>}
                      {rider.vehicle_type === 'scooter' && <span>🛵</span>}
                      {rider.vehicle_type === 'moto' && <span>🏍️</span>}
                      {rider.vehicle_type === 'auto' && <span>🚗</span>}
                      {rider.vehicle_type === 'furgone' && <span>🚐</span>}
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {rider.vehicle_type || 'Veicolo'}
                      </span>
                    </div>

                    {/* Località attiva */}
                    {rider.active_location && (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <MapPin className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">
                          {rider.active_location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bio / Descrizione */}
                  {rider.bio && (
                    <div className="mb-4">
                      <p className="text-gray-700 text-center text-sm italic line-clamp-2">
                        &ldquo;{rider.bio}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Tariffa e disponibilità */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">€{rider.hourly_rate}</div>
                      <div className="text-xs text-gray-600">per ora</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm font-bold text-green-600">Disponibile</div>
                      <div className="text-xs text-gray-600">Ora</div>
                    </div>
                  </div>

                  {/* Badge caratteristiche */}
                  <div className="flex flex-wrap gap-1 mb-4 justify-center">
                    <span className="px-2 py-1 text-xs rounded-full" style={{backgroundColor: 'rgba(51, 51, 102, 0.1)', color: '#333366'}}>
                      ⚡ Veloce
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      ✓ Verificato
                    </span>
                  </div>

                  {/* Pulsante prenotazione */}
                  <Link href={`/riders/${rider.id}`}>
                    <Button className="w-full text-white font-medium" style={{backgroundColor: '#333366'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a4a7a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333366'}>
                      <Clock className="h-4 w-4 mr-2" />
                      Prenota Rider
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 