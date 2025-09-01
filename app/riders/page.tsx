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
}

// Mock data for demonstration
const mockRiders: Rider[] = [
  {
    id: '1',
    full_name: 'Marco Rossi',
    avatar_url: null,
    bio: 'Rider esperto con 5 anni di esperienza nelle consegne. Disponibile per consegne veloci e affidabili.',
    hourly_rate: 12
  },
  {
    id: '2',
    full_name: 'Giulia Bianchi',
    avatar_url: null,
    bio: 'Specializzata in consegne di cibo e farmaci. Zona centro città e periferia.',
    hourly_rate: 15
  },
  {
    id: '3',
    full_name: 'Alessandro Verdi',
    avatar_url: null,
    bio: 'Rider professionista per consegne urgenti. Disponibile 24/7 per emergenze.',
    hourly_rate: 18
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
            hourly_rate
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
              <Card key={rider.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {rider.avatar_url ? (
                        <img
                          src={rider.avatar_url}
                          alt={rider.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Bike className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rider.full_name}</CardTitle>
                      <div className="flex items-center text-green-600 font-semibold">
                        <Euro className="h-4 w-4 mr-1" />
                        {rider.hourly_rate}/h
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {rider.bio || 'Rider esperto e affidabile per le tue consegne.'}
                  </CardDescription>
                  <Link href={`/riders/${rider.id}`}>
                    <Button className="w-full">
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