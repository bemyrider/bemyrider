'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bike, Euro, Clock, CheckCircle, AlertCircle, Settings, Calendar, CreditCard, User, AlertTriangle, CircleDollarSign, Zap, BookOpenCheck
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

export default function RiderDashboard() {
  const [profile, setProfile] = useState<RiderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const onboardingComplete = searchParams.get('onboarding_complete')

    if (onboardingComplete) {
      // Siamo appena tornati da Stripe. Un ricaricamento completo della pagina dopo
      // un breve ritardo è il modo più robusto per garantire di ottenere lo stato 
      // del profilo aggiornato, dando tempo al webhook di arrivare.
      const timer = setTimeout(() => {
        // Ricarica la pagina all'URL pulito.
        window.location.href = '/dashboard/rider'
      }, 3000) // Aspetta 3 secondi

      return () => clearTimeout(timer)
    } else {
      // Se non stiamo tornando dall'onboarding, carica il profilo normalmente.
      fetchProfile()
    }
  }, [searchParams])

  const fetchProfile = async () => {
    try {
      // Check if Supabase is properly configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        // Mock profile for demo
        setProfile({
          id: 'demo-rider',
          full_name: 'Marco Rossi',
          avatar_url: null,
          riders_details: {
            bio: 'Rider esperto con 5 anni di esperienza',
            hourly_rate: 12,
            stripe_account_id: null,
            stripe_onboarding_complete: false
          }
        })
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
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
        setError('Errore nel caricamento del profilo')
        return
      }

      if (profileData) {
        // Supabase returns related tables as an array. We expect only one.
        const riderDetails = Array.isArray(profileData.riders_details) ? profileData.riders_details[0] : profileData.riders_details;

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
      const response = await fetch('/api/stripe/create-account', {
        method: 'POST',
      })
      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (url) {
        router.push(url)
      }
    } catch (err: any) {
      console.error('Error starting Stripe onboarding:', err)
      setError(err.message || 'An unknown error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleManagePayments = async () => {
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
        window.open(url, '_blank') // Apre il link in una nuova scheda
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
      if (process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
        await supabase.auth.signOut()
      }
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading && !profile) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!profile) {
    return <div>Could not load profile.</div>
  }

  const riderDetails = profile.riders_details;

  // Mostra un messaggio di attesa mentre verifichiamo lo stato dopo il redirect
  if (searchParams.get('onboarding_complete')) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Verifica dello stato di onboarding in corso...</p>
          <p className="text-gray-600">Attendi un momento, stiamo aggiornando il tuo profilo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/bemyrider_logo.svg" alt="bemyrider logo" className="h-8 w-auto" />
              <span className="text-2xl font-bold text-gray-900 logo-font">bemyrider</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

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
              <Button variant="outline" disabled={!riderDetails?.stripe_onboarding_complete}>Gestisci Calendario</Button>
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
               <Button variant="outline" className="w-full justify-start" disabled={!riderDetails?.stripe_onboarding_complete}><Bike className="mr-2 h-4 w-4"/> Aggiorna Tariffa</Button>
               <Button variant="outline" className="w-full justify-start" disabled={!riderDetails?.stripe_onboarding_complete}><Settings className="mr-2 h-4 w-4"/> Impostazioni</Button>
               <Button variant="outline" className="w-full justify-start" disabled={!riderDetails?.stripe_onboarding_complete}><Clock className="mr-2 h-4 w-4"/> Cronologia</Button>
               {!riderDetails?.stripe_onboarding_complete && (
                <p className="text-xs text-orange-500 mt-2 text-center">Completa l'onboarding Stripe per abilitare questa funzione</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 