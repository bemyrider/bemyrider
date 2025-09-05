'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bike,
  Euro,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Calendar,
  CreditCard,
  User,
  AlertTriangle,
  CircleDollarSign,
  Zap,
  BookOpenCheck,
  Trash2,
  FileText,
  Mail,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import TopNavBar from '@/components/TopNavBar';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import UpdateRateModal from '@/components/UpdateRateModal';
import FiscalDataModal from '@/components/FiscalDataModal';
import EditProfileModal from '@/components/EditProfileModal';
import RespondServiceRequestModal from '@/components/RespondServiceRequestModal';
import { RiderDashboardSkeleton } from '@/components/ui/skeleton-loaders';

type RiderProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  riders_details: {
    vehicle_type: string | null;
    profile_picture_url: string | null;
    bio: string | null;
    hourly_rate: number | null;
    stripe_account_id: string | null;
    stripe_onboarding_complete: boolean | null;
  } | null;
  rider_tax_details: {
    first_name: string | null;
    last_name: string | null;
    fiscal_code: string | null;
    birth_place: string | null;
    birth_date: string | null;
    residence_address: string | null;
    residence_city: string | null;
  } | null;
};

type ServiceRequest = {
  id: string;
  requested_date: string;
  start_time: string;
  duration_hours: number;
  merchant_address: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  rider_response: string | null;
  created_at: string;
  updated_at: string;
  merchant: {
    id: string;
    full_name: string;
    esercenti: {
      business_name: string | null;
      address: string | null;
      city: string | null;
    } | null;
  };
};

function RiderDashboardContent() {
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] =
    useState(false);
  const [showUpdateRateModal, setShowUpdateRateModal] = useState(false);
  const [showFiscalDataModal, setShowFiscalDataModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchProfile = useCallback(async () => {
    try {
      // Get current user from Supabase
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('🚫 No authenticated user, redirecting to login');
        router.push('/auth/login');
        return;
      }

      console.log(
        '🔍 Fetching profile for user:',
        user.id,
        'Email:',
        user.email
      );
      console.log('👤 User metadata:', user.user_metadata);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(
          `
          id,
          full_name,
          avatar_url,
          role,
          riders_details (
            vehicle_type,
            profile_picture_url,
            bio,
            hourly_rate,
            stripe_account_id,
            stripe_onboarding_complete
          ),
          rider_tax_details (
            first_name,
            last_name,
            fiscal_code,
            birth_place,
            birth_date,
            residence_address,
            residence_city
          )
        `
        )
        .eq('id', user.id)
        .single();

      if (profileError) {
        // Se il profilo non esiste, creiamolo solo se l'utente dovrebbe essere un rider
        if (profileError.code === 'PGRST116') {
          console.log('📝 No profile found, checking user metadata...');

          // Verifica se l'utente dovrebbe essere un rider (solo se esplicitamente specificato)
          if (user.user_metadata?.role === 'rider') {
            console.log('📝 Creating rider profile for user:', user.id);

            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata.full_name || 'New Rider',
                role: 'rider',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (createProfileError) {
              console.error(
                '❌ Error creating rider profile:',
                createProfileError
              );
              setError('Errore nella creazione del profilo rider');
              return;
            }

            // Create rider details
            const { error: createRiderDetailsError } = await supabase
              .from('riders_details')
              .insert({
                profile_id: user.id,
                hourly_rate: 15, // Default hourly rate
                bio: 'New Rider',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (createRiderDetailsError) {
              console.error(
                '❌ Error creating rider details:',
                createRiderDetailsError
              );
              setError('Errore nella creazione dei dettagli del rider');
              return;
            }

            console.log('✅ Rider profile created successfully');
            window.location.reload();
            return;
          } else {
            console.log(
              '🚫 User metadata does not indicate rider role or missing role, redirecting to registration'
            );
            router.push('/auth/register');
            return;
          }
        }

        console.error('❌ Error fetching profile:', profileError);
        setError('Errore nel caricamento del profilo');
        return;
      }

      if (profileData) {
        console.log('📋 Profile found:', profileData);

        // CONTROLLO RIGIDO DEL RUOLO
        if (profileData.role !== 'rider') {
          console.log(
            '🚫 ACCESSO NEGATO: User role is:',
            profileData.role,
            '- redirecting to appropriate dashboard'
          );

          if (profileData.role === 'merchant') {
            console.log('➡️ Redirecting to merchant dashboard');
            router.push('/dashboard/merchant');
          } else {
            console.log('➡️ Unknown role, redirecting to login');
            router.push('/auth/login');
          }
          return;
        }

        console.log(
          '✅ ACCESSO AUTORIZZATO: Rider profile loaded successfully'
        );

        const riderDetails = Array.isArray(profileData.riders_details)
          ? profileData.riders_details[0]
          : profileData.riders_details;

        setProfile({
          id: profileData.id,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          riders_details: riderDetails || null,
          rider_tax_details: Array.isArray(profileData.rider_tax_details)
            ? profileData.rider_tax_details[0] || null
            : profileData.rider_tax_details || null,
        });

        // Fetch service requests after profile is loaded
        fetchServiceRequests();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Errore nel caricamento del profilo');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Funzione per verificare e aggiornare lo stato di onboarding
  const checkOnboardingStatus = async () => {
    if (!profile?.riders_details?.stripe_account_id) return false;

    setCheckingOnboarding(true);
    try {
      const response = await fetch('/api/stripe/onboarding', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔄 Onboarding status check result:', data);

        // Se lo stato è cambiato, aggiorna il profilo
        if (
          data.stripe_onboarding_complete !==
          profile.riders_details?.stripe_onboarding_complete
        ) {
          console.log('✅ Onboarding status changed, updating profile...');
          await fetchProfile(); // Ricarica il profilo
          return data.stripe_onboarding_complete;
        }

        return data.stripe_onboarding_complete;
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setCheckingOnboarding(false);
    }

    return profile.riders_details?.stripe_onboarding_complete || false;
  };

  // ✅ NUOVO useEffect SEMPLIFICATO per gestire onboarding_complete
  useEffect(() => {
    const onboardingComplete = searchParams.get('onboarding_complete');

    if (onboardingComplete === 'true') {
      // 1. Log di successo
      console.log('✅ Onboarding Stripe completato con successo!');

      // 2. Rimuovi il parametro dall'URL (pulisce l'URL)
      window.history.replaceState({}, '', '/dashboard/rider');

      // 3. Ricarica il profilo per mostrare lo stato aggiornato
      fetchProfile();
    } else {
      // Se non stiamo tornando dall'onboarding, carica il profilo normalmente
      fetchProfile();
    }
  }, [searchParams, fetchProfile]);

  const handleStripeOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante: include i cookie nella richiesta
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start onboarding');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No URL returned from Stripe');
      }
    } catch (err: any) {
      console.error('Error starting Stripe onboarding:', err);
      setError(
        err.message ||
          "Si è verificato un errore durante l'attivazione dei pagamenti"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManagePayments = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Devi effettuare il login per utilizzare questa funzionalità');
      return;
    }

    if (!profile?.riders_details?.stripe_account_id) {
      setError("ID dell'account Stripe non trovato.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/create-login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: profile.riders_details.stripe_account_id,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (url) {
        window.open(url, '_blank');
      }
    } catch (err: any) {
      console.error('Error creating Stripe login link:', err);
      setError(err.message || 'Failed to open Stripe Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceRequests = useCallback(async () => {
    if (!profile) {
      console.log('🚫 No profile available, skipping fetchServiceRequests');
      return;
    }

    try {
      console.log('🔍 Fetching service requests for rider ID:', profile.id);

      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select(
          `
          id,
          requested_date,
          start_time,
          duration_hours,
          merchant_address,
          description,
          status,
          rider_response,
          created_at,
          updated_at,
          merchant:profiles!merchant_id (
            id,
            full_name,
            esercenti (
              business_name,
              address,
              city
            )
          )
        `
        )
        .eq('rider_id', profile.id)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('❌ Error fetching service requests:', requestsError);
        throw requestsError;
      }

      console.log('📊 Raw data from DB:', requestsData);

      // Transform data to ensure merchant is an object
      const transformedRequests = (requestsData || [])
        .map(request => {
          const merchant = Array.isArray(request.merchant)
            ? request.merchant[0]
            : request.merchant;
          return {
            ...request,
            merchant: {
              ...merchant,
              esercenti: Array.isArray(merchant?.esercenti)
                ? merchant.esercenti[0]
                : merchant?.esercenti,
            },
          };
        })
        .filter(request => request.merchant); // Filter out requests without merchant

      console.log('🔄 Transformed requests:', transformedRequests);
      console.log(
        '✅ Service requests fetched successfully:',
        transformedRequests.length,
        'requests'
      );

      setServiceRequests(transformedRequests);
    } catch (error: any) {
      console.error('❌ Error fetching service requests:', error);
      setError('Errore nel caricamento delle richieste di servizio');
    }
  }, [profile]);

  // Assicuriamoci che fetchServiceRequests venga chiamata quando il profilo è disponibile
  useEffect(() => {
    if (profile) {
      console.log('👤 Profile available, fetching service requests...');
      fetchServiceRequests();
    }
  }, [profile, fetchServiceRequests]);

  const handleRespondToRequest = async (
    requestId: string,
    status: 'accepted' | 'rejected',
    response?: string
  ) => {
    try {
      console.log('📤 Responding to service request:', requestId, status);

      const fetchResponse = await fetch(
        '/api/service-requests/' + requestId + '/respond',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            riderResponse: response,
            userId: profile?.id,
          }),
        }
      );

      // Prima controlla se la risposta HTTP è ok
      if (!fetchResponse.ok) {
        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }

      const responseData = await fetchResponse.json();

      // L'API restituisce direttamente {success: true, ...} non {data: {success: true, ...}}
      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to respond to request');
      }

      console.log('✅ Response sent successfully');

      // Refresh service requests
      fetchServiceRequests();
    } catch (error: any) {
      console.error('❌ Error responding to request:', error);
      throw error;
    }
  };

  const handleOpenRespondModal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowRespondModal(true);
  };

  const handleCloseRespondModal = () => {
    setShowRespondModal(false);
    setSelectedRequest(null);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      console.log('🚪 Logging out rider...');
      await supabase.auth.signOut();
      console.log('✅ Logout successful, redirecting to home');
      router.push('/');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      setError('Errore durante il logout');
      setLoggingOut(false);
    }
  };

  if (loading && !profile) {
    return <RiderDashboardSkeleton />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <div>Could not load profile.</div>;
  }

  const riderDetails = profile.riders_details;

  // ✅ RIMOSSO: Non mostrare più la schermata di attesa per onboarding_complete
  // Ora gestiamo tutto nel useEffect semplificato

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Top Navigation */}
      <TopNavBar
        userRole='rider'
        userName={profile?.full_name || 'Rider'}
        onLogout={handleLogout}
        onDeleteAccount={() => setShowDeleteModal(true)}
      />

      <div className='container mx-auto px-4 py-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Benvenuto, {profile.full_name}! 🚴‍♂️
          </h1>
          <p className='text-gray-600'>
            Gestisci il tuo profilo, disponibilità e ricevi pagamenti
          </p>
        </div>

        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
          {/* Profile Card - Stile Rover.com */}
          <Card className='relative overflow-hidden'>
            <CardContent className='relative px-6 pt-6 pb-6'>
              {/* Profile Picture - Centrata senza gradiente */}
              <div className='flex justify-center mb-4'>
                {riderDetails?.profile_picture_url ? (
                  <div className='relative'>
                    <Image
                      src={riderDetails.profile_picture_url}
                      alt='Foto profilo'
                      width={128}
                      height={128}
                      className='w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl'
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Badge di stato online */}
                    <div className='absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-3 border-white rounded-full flex items-center justify-center'>
                      <div className='w-2 h-2 bg-white rounded-full'></div>
                    </div>
                  </div>
                ) : (
                  <div className='relative'>
                    <div
                      className='w-32 h-32 rounded-full flex items-center justify-center shadow-xl border-4 border-white'
                      style={{
                        background:
                          'linear-gradient(to bottom right, #333366, #4a4a7a)',
                      }}
                    >
                      <span className='text-3xl font-bold text-white'>
                        {profile.full_name
                          ? profile.full_name.charAt(0).toUpperCase()
                          : profile.rider_tax_details?.first_name
                              ?.charAt(0)
                              .toUpperCase() || 'R'}
                      </span>
                    </div>
                    <div className='absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-3 border-white rounded-full flex items-center justify-center'>
                      <div className='w-2 h-2 bg-white rounded-full'></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nome e rating (simulato) */}
              <div className='text-center mb-4'>
                <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                  {profile.rider_tax_details?.first_name &&
                  profile.rider_tax_details?.last_name
                    ? `${profile.rider_tax_details.first_name} ${profile.rider_tax_details.last_name}`
                    : profile.full_name || 'Nome non impostato'}
                </h2>

                {/* Rating stelle (simulato) */}
                <div className='flex items-center justify-center gap-1 mb-2'>
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className='w-4 h-4 text-yellow-400 fill-current'
                      viewBox='0 0 20 20'
                    >
                      <path d='M10 1l2.5 6.5h6.5l-5.25 4 2 6.5-5.75-4.25-5.75 4.25 2-6.5-5.25-4h6.5z' />
                    </svg>
                  ))}
                  <span className='text-sm text-gray-600 ml-1'>
                    5.0 • Nuovo rider
                  </span>
                </div>

                {/* Tipo di veicolo con icona */}
                <div className='flex items-center justify-center gap-2 mb-3'>
                  {riderDetails?.vehicle_type === 'bici' && <span>🚲</span>}
                  {riderDetails?.vehicle_type === 'e_bike' && <span>🚴‍♂️</span>}
                  {riderDetails?.vehicle_type === 'scooter' && <span>🛵</span>}
                  {riderDetails?.vehicle_type === 'auto' && <span>🚗</span>}
                  <span className='text-sm font-medium text-gray-700 capitalize'>
                    {riderDetails?.vehicle_type === 'bici'
                      ? 'Bicicletta'
                      : riderDetails?.vehicle_type === 'e_bike'
                        ? 'E-Bike'
                        : riderDetails?.vehicle_type === 'scooter'
                          ? 'Scooter'
                          : riderDetails?.vehicle_type === 'auto'
                            ? 'Auto'
                            : 'Veicolo non specificato'}
                  </span>
                </div>
              </div>

              {/* Bio / Descrizione */}
              {riderDetails?.bio && (
                <div className='mb-4'>
                  <p className='text-gray-700 text-center italic'>
                    &ldquo;{riderDetails.bio}&rdquo;
                  </p>
                </div>
              )}

              {/* Informazioni chiave in stile Rover */}
              <div className='grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mb-4'>
                <div className='text-center p-3 bg-gray-50 rounded-lg'>
                  <div className='text-lg font-bold text-gray-900'>
                    €{riderDetails?.hourly_rate || 0}
                  </div>
                  <div className='text-xs text-gray-600'>per ora</div>
                </div>
                <div className='text-center p-3 bg-gray-50 rounded-lg'>
                  <div className='text-lg font-bold text-green-600'>
                    Disponibile
                  </div>
                  <div className='text-xs text-gray-600'>Aggiornato ieri</div>
                </div>
              </div>

              {/* Badge caratteristiche */}
              <div className='flex flex-wrap gap-2 mb-4 justify-center'>
                <span
                  className='px-2 py-1 text-xs rounded-full'
                  style={{
                    backgroundColor: 'rgba(51, 51, 102, 0.1)',
                    color: '#333366',
                  }}
                >
                  ⚡ Consegne veloci
                </span>
                <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                  ✓ Verificato
                </span>
                <span className='px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full'>
                  🏆 Rider professionale
                </span>
              </div>

              <Button
                className='w-full text-white font-medium'
                style={{ backgroundColor: '#333366' }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = '#4a4a7a')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = '#333366')
                }
                onClick={() => setShowEditProfileModal(true)}
              >
                Modifica Profilo
              </Button>
            </CardContent>
          </Card>

          {/* Payments Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' /> Pagamenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riderDetails?.stripe_onboarding_complete ? (
                <div className='text-center text-green-600'>
                  <CheckCircle className='h-8 w-8 mx-auto mb-2' />
                  <p>Onboarding Stripe Completato</p>
                  <Button
                    variant='outline'
                    className='mt-4 w-full'
                    onClick={handleManagePayments}
                    disabled={loading}
                  >
                    {loading ? 'Caricamento...' : 'Gestisci Pagamenti'}
                  </Button>
                </div>
              ) : (
                <div className='text-center'>
                  <p className='text-yellow-600 mb-2'>
                    <AlertTriangle className='inline h-5 w-5 mr-1' />
                    Account Stripe Richiesto
                  </p>
                  <p className='text-sm text-gray-500 mb-4'>
                    Completa l&apos;onboarding Stripe per ricevere pagamenti
                  </p>
                  <Button
                    onClick={handleStripeOnboarding}
                    disabled={loading}
                    className='w-full bg-green-600 hover:bg-green-700'
                  >
                    {loading ? 'Caricamento...' : 'Attiva Pagamenti'}
                  </Button>
                  {riderDetails?.stripe_account_id && (
                    <div className='mt-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={checkOnboardingStatus}
                        disabled={checkingOnboarding}
                      >
                        {checkingOnboarding
                          ? 'Verificando...'
                          : 'Verifica Stato'}
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
              <div className='flex items-center space-x-2'>
                <Calendar className='h-5 w-5 text-purple-600' />
                <CardTitle>Disponibilità</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='text-center'>
              <Button
                variant='outline'
                disabled={!riderDetails?.stripe_onboarding_complete}
                onClick={() => setShowAvailabilityCalendar(true)}
              >
                Gestisci Calendario
              </Button>
              {!riderDetails?.stripe_onboarding_complete && (
                <p className='text-xs text-orange-500 mt-2'>
                  Completa l&apos;onboarding Stripe per abilitare questa
                  funzione
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bookings Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BookOpenCheck className='h-5 w-5' /> Prenotazioni
              </CardTitle>
            </CardHeader>
            <CardContent className='text-center'>
              <p className='text-3xl font-bold'>0</p>
              <p className='text-sm text-gray-500 mb-4'>Prenotazioni Attive</p>
              <Button
                variant='outline'
                disabled={!riderDetails?.stripe_onboarding_complete}
              >
                Visualizza Tutte
              </Button>
              {!riderDetails?.stripe_onboarding_complete && (
                <p className='text-xs text-orange-500 mt-2'>
                  Completa l&apos;onboarding Stripe per abilitare questa
                  funzione
                </p>
              )}
            </CardContent>
          </Card>

          {/* Earnings Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CircleDollarSign className='h-5 w-5' /> Guadagni
              </CardTitle>
            </CardHeader>
            <CardContent className='text-center'>
              <p className='text-3xl font-bold'>€0</p>
              <p className='text-sm text-gray-500 mb-4'>Questo mese</p>
              <Button
                variant='outline'
                disabled={!riderDetails?.stripe_onboarding_complete}
              >
                Visualizza Storico
              </Button>
              {!riderDetails?.stripe_onboarding_complete && (
                <p className='text-xs text-orange-500 mt-2'>
                  Completa l&apos;onboarding Stripe per abilitare questa
                  funzione
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='h-5 w-5' /> Azioni Rapide
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button
                variant='outline'
                className='w-full justify-start'
                disabled={!riderDetails?.stripe_onboarding_complete}
                onClick={() => setShowUpdateRateModal(true)}
              >
                <Euro className='mr-2 h-4 w-4' /> Aggiorna Tariffa
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start'
                disabled={!riderDetails?.stripe_onboarding_complete}
                onClick={() => setShowFiscalDataModal(true)}
              >
                <FileText className='mr-2 h-4 w-4' /> Dati Fiscali
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start'
                disabled={!riderDetails?.stripe_onboarding_complete}
              >
                <Clock className='mr-2 h-4 w-4' /> Cronologia
              </Button>
              {!riderDetails?.stripe_onboarding_complete && (
                <p className='text-xs text-orange-500 mt-2 text-center'>
                  Completa l&apos;onboarding Stripe per abilitare questa
                  funzione
                </p>
              )}
            </CardContent>
          </Card>

          {/* Service Requests Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Mail className='h-5 w-5' /> Richieste di Servizio
              </CardTitle>
              <CardDescription>
                Gestisci le richieste di servizio ricevute
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serviceRequests.length === 0 ? (
                <div className='text-center py-8'>
                  <Mail className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500 mb-2'>
                    Nessuna richiesta ricevuta
                  </p>
                  <p className='text-sm text-gray-400'>
                    Le nuove richieste appariranno qui
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {/* Stats */}
                  <div className='grid grid-cols-3 gap-1 sm:gap-2 mb-4'>
                    <div className='text-center p-2 bg-yellow-50 rounded-lg'>
                      <p className='text-lg font-bold text-yellow-600'>
                        {
                          serviceRequests.filter(r => r.status === 'pending')
                            .length
                        }
                      </p>
                      <p className='text-xs text-yellow-700'>In Attesa</p>
                    </div>
                    <div className='text-center p-2 bg-green-50 rounded-lg'>
                      <p className='text-lg font-bold text-green-600'>
                        {
                          serviceRequests.filter(r => r.status === 'accepted')
                            .length
                        }
                      </p>
                      <p className='text-xs text-green-700'>Accettate</p>
                    </div>
                    <div className='text-center p-2 bg-red-50 rounded-lg'>
                      <p className='text-lg font-bold text-red-600'>
                        {
                          serviceRequests.filter(r => r.status === 'rejected')
                            .length
                        }
                      </p>
                      <p className='text-xs text-red-700'>Rifiutate</p>
                    </div>
                  </div>

                  {/* Recent Requests */}
                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {serviceRequests.slice(0, 3).map(request => (
                      <div
                        key={request.id}
                        className='flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0'
                      >
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium text-sm truncate'>
                            {request.merchant.esercenti?.business_name ||
                              request.merchant.full_name}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {new Date(
                              request.requested_date
                            ).toLocaleDateString('it-IT')}{' '}
                            • {request.start_time.substring(0, 5)} •
                            {request.duration_hours}h
                          </p>
                        </div>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2'>
                          {request.status === 'pending' ? (
                            <Button
                              size='sm'
                              onClick={() => handleOpenRespondModal(request)}
                              className='bg-blue-600 hover:bg-blue-700 w-full sm:w-auto'
                            >
                              Rispondi
                            </Button>
                          ) : (
                            <span
                              className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                                request.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {request.status === 'accepted'
                                ? 'Accettata'
                                : 'Rifiutata'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {serviceRequests.length > 3 && (
                    <Button variant='outline' className='w-full' size='sm'>
                      Visualizza Tutte ({serviceRequests.length})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userRole='rider'
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

      {/* Fiscal Data Modal */}
      {showFiscalDataModal && profile && (
        <FiscalDataModal
          isOpen={showFiscalDataModal}
          riderId={profile.id}
          onClose={() => setShowFiscalDataModal(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && profile && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          riderId={profile.id}
          onProfileUpdate={fetchProfile}
        />
      )}

      {/* Respond Service Request Modal */}
      <RespondServiceRequestModal
        isOpen={showRespondModal}
        onClose={handleCloseRespondModal}
        request={selectedRequest}
        riderHourlyRate={profile?.riders_details?.hourly_rate || null}
        onRespond={handleRespondToRequest}
      />
    </div>
  );
}

export default function RiderDashboard() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div
              className='animate-spin rounded-full h-32 w-32 border-b-2 mx-auto'
              style={{ borderBottomColor: '#333366' }}
            ></div>
            <p className='mt-4 text-gray-600'>Caricamento dashboard...</p>
          </div>
        </div>
      }
    >
      <RiderDashboardContent />
    </Suspense>
  );
}
