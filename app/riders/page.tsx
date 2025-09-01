'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bike, Clock, Euro, Search, Filter } from 'lucide-react'
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
}

// Mock data for demonstration
const mockRiders: Rider[] = [
  {
    id: '1',
    full_name: 'Marco Rossi',
    avatar_url: null,
    bio: 'Rider esperto con 5 anni di esperienza nelle consegne. Disponibile per consegne veloci e affidabili.',
    hourly_rate: 12,
    vehicle_type: 'bicicletta',
    profile_picture_url: null
  },
  {
    id: '2',
    full_name: 'Giulia Bianchi',
    avatar_url: null,
    bio: 'Specializzata in consegne di cibo e farmaci. Zona centro città e periferia.',
    hourly_rate: 15,
    vehicle_type: 'scooter',
    profile_picture_url: null
  },
  {
    id: '3',
    full_name: 'Alessandro Verdi',
    avatar_url: null,
    bio: 'Rider professionista per consegne urgenti. Disponibile 24/7 per emergenze.',
    hourly_rate: 18,
    vehicle_type: 'moto',
    profile_picture_url: null
  }
]

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [minRate, setMinRate] = useState('')
  const [maxRate, setMaxRate] = useState('')
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

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          riders_details (
            bio,
            hourly_rate,
            vehicle_type,
            profile_picture_url
          )
        `)
        .eq('role', 'rider')

      if (error) {
        console.error('Error fetching riders:', error)
        setError('Errore nel caricamento dei rider')
        // Fallback to mock data
        setRiders(mockRiders)
        return
      }

      const ridersWithDetails = data
        .filter(rider => rider.riders_details)
        .map(rider => ({
          id: rider.id,
          full_name: rider.full_name || 'Rider',
          avatar_url: rider.avatar_url,
          bio: (rider.riders_details as any).bio,
          hourly_rate: (rider.riders_details as any).hourly_rate,
          vehicle_type: (rider.riders_details as any).vehicle_type,
          profile_picture_url: (rider.riders_details as any).profile_picture_url,
        }))

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
    
    return matchesSearch && matchesMinRate && matchesMaxRate
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
          <div className="grid md:grid-cols-4 gap-4">
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
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setMinRate('')
                  setMaxRate('')
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
                {/* Header con sfondo gradiente */}
                <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                
                <CardContent className="relative px-6 pb-6">
                  {/* Profile Picture - Posizionata sopra il gradiente */}
                  <div className="flex justify-center -mt-12 mb-4">
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
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
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
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {rider.vehicle_type === 'bicicletta' && <span>🚲</span>}
                      {rider.vehicle_type === 'scooter' && <span>🛵</span>}
                      {rider.vehicle_type === 'moto' && <span>🏍️</span>}
                      {rider.vehicle_type === 'auto' && <span>🚗</span>}
                      {rider.vehicle_type === 'furgone' && <span>🚐</span>}
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {rider.vehicle_type || 'Veicolo'}
                      </span>
                    </div>
                  </div>

                  {/* Bio / Descrizione */}
                  {rider.bio && (
                    <div className="mb-4">
                      <p className="text-gray-700 text-center text-sm italic line-clamp-2">
                        "{rider.bio}"
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
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      ⚡ Veloce
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      ✓ Verificato
                    </span>
                  </div>

                  {/* Pulsante prenotazione */}
                  <Link href={`/riders/${rider.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
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