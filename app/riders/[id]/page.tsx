'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, Euro, MapPin, User, Bike } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from '@/lib/formatters'

type RiderProfile = {
  id: string
  full_name: string
  avatar_url: string | null
  riders_details: {
    vehicle_type: string | null
    profile_picture_url: string | null
    bio: string | null
    hourly_rate: number | null
    stripe_account_id: string | null
    stripe_onboarding_complete: boolean | null
  } | null
}

export default function RiderBookingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const riderId = params.id as string
  
  const [rider, setRider] = useState<RiderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Booking form state
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchRiderProfile()
  }, [riderId])

  const fetchRiderProfile = async () => {
    try {
      setLoading(true)
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          riders_details (
            vehicle_type,
            profile_picture_url,
            bio,
            hourly_rate,
            stripe_account_id,
            stripe_onboarding_complete
          )
        `)
        .eq('id', riderId)
        .eq('role', 'rider')
        .single()

      if (profileError) {
        console.error('Error fetching rider profile:', profileError)
        setError('Rider non trovato')
        return
      }

      const riderDetails = Array.isArray(profileData.riders_details) 
        ? profileData.riders_details[0] 
        : profileData.riders_details

      setRider({
        id: profileData.id,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        riders_details: riderDetails
      })

    } catch (error) {
      console.error('Error:', error)
      setError('Errore nel caricamento del profilo rider')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!startDate || !startTime || !duration) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori"
      })
      return
    }

    setBookingLoading(true)
    
    try {
      // Verifica utente autenticato
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per effettuare una prenotazione"
        })
        router.push('/auth/login')
        return
      }

      // Chiamata API per creare booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          riderId: rider?.id,
          startDate,
          startTime,
          duration,
          description
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Errore durante la creazione della prenotazione')
      }

      toast({
        title: "Prenotazione Creata!",
        description: result.booking.message || `Prenotazione confermata con ${rider?.full_name}`,
      })
      
      // Redirect alla dashboard merchant
      router.push('/dashboard/merchant')
      
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "Errore",
        description: "Errore durante la creazione della prenotazione"
      })
    } finally {
      setBookingLoading(false)
    }
  }

  const calculateTotal = () => {
    const hours = parseFloat(duration) || 0
    const rate = rider?.riders_details?.hourly_rate || 0
    return hours * rate
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento profilo rider...</p>
        </div>
      </div>
    )
  }

  if (error || !rider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-red-500 mb-4">{error || 'Rider non trovato'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla Lista Rider
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Prenota Rider</h1>
          <p className="text-gray-600">Effettua una prenotazione con {rider.full_name}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Rider Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {rider.riders_details?.profile_picture_url || rider.avatar_url ? (
                    <img 
                      src={rider.riders_details?.profile_picture_url || rider.avatar_url || ''} 
                      alt={rider.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">{rider.full_name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Bike className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {rider.riders_details?.vehicle_type || 'Veicolo non specificato'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Hourly Rate */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Euro className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Tariffa Oraria</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {formatCurrency(rider.riders_details?.hourly_rate || 0)}/ora
                </Badge>
              </div>

              {/* Bio */}
              {rider.riders_details?.bio && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Biografia</h4>
                  <p className="text-gray-600 text-sm">{rider.riders_details.bio}</p>
                </div>
              )}

              {/* Availability Status */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Disponibile</span>
              </div>
              
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Prenotazione</CardTitle>
              <CardDescription>
                Compila i dettagli per richiedere una prenotazione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                
                {/* Data */}
                <div>
                  <Label htmlFor="startDate">Data *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Ora */}
                <div>
                  <Label htmlFor="startTime">Ora di Inizio *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                {/* Durata */}
                <div>
                  <Label htmlFor="duration">Durata (ore) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="es. 2.5"
                    required
                  />
                </div>

                {/* Descrizione */}
                <div>
                  <Label htmlFor="description">Descrizione del Lavoro</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descrivi brevemente il tipo di consegna o servizio richiesto..."
                  />
                </div>

                {/* Riepilogo */}
                {startDate && startTime && duration && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-gray-900">Riepilogo Prenotazione</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Data:</span>
                        <span>{formatDate(startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ora:</span>
                        <span>{startTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durata:</span>
                        <span>{duration} ore</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Totale Stimato:</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Invio Richiesta...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Richiedi Prenotazione
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
