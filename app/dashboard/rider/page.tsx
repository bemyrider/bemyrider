'use client';

import {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import TopNavBar from '@/components/TopNavBar';
import Sidebar, { useSidebar } from '@/components/Sidebar';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import UpdateRateModal from '@/components/UpdateRateModal';
import FiscalDataModal from '@/components/FiscalDataModal';
import EditProfileModal from '@/components/EditProfileModal';
import RespondServiceRequestModal from '@/components/RespondServiceRequestModal';
import PortfolioEditor from '@/components/PortfolioEditor';
import PortfolioGallery from '@/components/PortfolioGallery';
import { RiderDashboardSkeleton } from '@/components/ui/skeleton-loaders';
import { notifications, notificationMessages } from '@/lib/notifications';
import ProfiloDisponibilita from '@/components/dashboard/ModuloProfiloDisponibilita';
import ModuloGestioneLavoro from '@/components/dashboard/ModuloGestioneLavoro';
import ModuloPagamenti from '@/components/dashboard/ModuloPagamenti';
import ModuloImpostazioni from '@/components/dashboard/ModuloImpostazioni';
import { User, Briefcase, CreditCard, Settings } from 'lucide-react';

// Configuration constants for onboarding
const RIDER_STATUS = {
  available: { text: 'Disponibile', color: 'text-green-600' },
  busy: { text: 'Impegnato', color: 'text-orange-600' },
  offline: { text: 'Offline', color: 'text-gray-600' },
} as const;

// Progressive states system for intelligent onboarding
enum RiderOnboardingState {
  STRIPE_ONLY = 0, // Only Stripe available
  BASIC_PROFILE = 1, // + Profile and rate
  AVAILABILITY = 2, // + Calendar availability
  FULL_FEATURES = 3, // All features available
}

const ONBOARDING_STEPS = [
  { key: 'stripe', label: 'Stripe', description: 'Attiva pagamenti' },
  { key: 'profile', label: 'Profilo', description: 'Completa profilo' },
  { key: 'availability', label: 'Disponibilità', description: 'Imposta orari' },
  { key: 'portfolio', label: 'Portfolio', description: 'Crea portfolio' },
] as const;

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
  status:
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'expired'
    | 'booked'
    | 'in_progress'
    | 'completed'
    | 'cancelled';
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

// Function to determine rider onboarding state
const getRiderOnboardingState = (riderDetails: any): RiderOnboardingState => {
  // Se Stripe non è completato, solo quello è disponibile
  if (!riderDetails?.stripe_onboarding_complete) {
    return RiderOnboardingState.STRIPE_ONLY;
  }

  // Se profilo base non è completo (tariffa o bio mancante)
  if (!riderDetails?.hourly_rate || !riderDetails?.bio) {
    return RiderOnboardingState.BASIC_PROFILE;
  }

  // Se disponibilità non è configurata (per ora controlliamo solo se esiste qualche disponibilità)
  // TODO: Implementare controllo più sofisticato per disponibilità
  if (!riderDetails?.availabilityConfigured) {
    return RiderOnboardingState.AVAILABILITY;
  }

  // Tutto completato
  return RiderOnboardingState.FULL_FEATURES;
};

// Componente Progress Indicator - Versione Compatta
const OnboardingProgress = ({
  currentState,
}: {
  currentState: RiderOnboardingState;
}) => {
  // Se onboarding è completato, non mostrare nulla
  if (currentState >= RiderOnboardingState.FULL_FEATURES) {
    return null;
  }

  return (
    <div className='mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200'>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-medium text-gray-700'>
          Onboarding: {currentState + 1} di {ONBOARDING_STEPS.length} completati
        </span>
        <span className='text-xs text-gray-500'>
          {Math.round(((currentState + 1) / ONBOARDING_STEPS.length) * 100)}%
        </span>
      </div>

      {/* Progress Bar Compatta */}
      <div className='w-full bg-gray-200 rounded-full h-1.5'>
        <div
          className='bg-blue-500 h-1.5 rounded-full transition-all duration-500'
          style={{
            width: `${((currentState + 1) / ONBOARDING_STEPS.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

// Custom hook to manage dashboard state
const useRiderDashboardState = () => {
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
  const [showPortfolioEditor, setShowPortfolioEditor] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);

  return {
    // State
    profile,
    setProfile,
    showAvailabilityCalendar,
    setShowAvailabilityCalendar,
    showUpdateRateModal,
    setShowUpdateRateModal,
    showFiscalDataModal,
    setShowFiscalDataModal,
    showEditProfileModal,
    setShowEditProfileModal,
    loading,
    setLoading,
    error,
    setError,
    onboardingUrl,
    setOnboardingUrl,
    checkingOnboarding,
    setCheckingOnboarding,
    loggingOut,
    setLoggingOut,
    showDeleteModal,
    setShowDeleteModal,
    serviceRequests,
    setServiceRequests,
    showRespondModal,
    setShowRespondModal,
    selectedRequest,
    setSelectedRequest,
    showPortfolioEditor,
    setShowPortfolioEditor,
    portfolioData,
    setPortfolioData,
  };
};

function RiderDashboardContent() {
  const state = useRiderDashboardState();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ SOLUTION 1: Use useRef to track call states
  const fetchingProfileRef = useRef(false);
  const fetchingServiceRequestsRef = useRef(false);
  const profileFetchedRef = useRef(false);

  // ✅ SOLUTION 2: Memoize critical states to avoid re-renders
  const profileId = useMemo(() => state.profile?.id, [state.profile?.id]);
  const onboardingComplete = useMemo(
    () => searchParams.get('onboarding_complete'),
    [searchParams]
  );

  // Simplified local states
  const [isFetchingPortfolio, setIsFetchingPortfolio] = useState(false);
  const [portfolioFetched, setPortfolioFetched] = useState(false);

  // Use states from hook instead of duplicating locally
  const { isOpen, toggle } = useSidebar();

  // Sidebar items definition
  const sidebarItems = [
    {
      id: 'profilo',
      label: 'Profilo & Disponibilità',
      icon: <User className='h-5 w-5' />,
    },
    {
      id: 'lavoro',
      label: 'Gestione Lavoro',
      icon: <Briefcase className='h-5 w-5' />,
    },
    {
      id: 'pagamenti',
      label: 'Pagamenti',
      icon: <CreditCard className='h-5 w-5' />,
    },
    {
      id: 'impostazioni',
      label: 'Impostazioni',
      icon: <Settings className='h-5 w-5' />,
    },
  ];

  // Funzione per scrollare alla sezione
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Offset per header
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  // ✅ SOLUTION 3: fetchProfile function with anti-loop protections
  const fetchProfile = useCallback(async () => {
    // Protection against multiple simultaneous calls
    if (fetchingProfileRef.current) {
      console.log('🚫 FETCH PROFILE already running, skipping');
      return;
    }

    if (profileFetchedRef.current && !onboardingComplete) {
      console.log('🚫 PROFILE already fetched, skipping');
      return;
    }

    fetchingProfileRef.current = true;
    console.log('🔄 FETCH PROFILE started');

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('🚫 No authenticated user, redirecting to login');
        router.push('/auth/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(
          `
          id, full_name, avatar_url, role,
          riders_details (
            vehicle_type, profile_picture_url, bio, hourly_rate,
            stripe_account_id, stripe_onboarding_complete
          ),
          rider_tax_details (
            first_name, last_name, fiscal_code, birth_place,
            birth_date, residence_address, residence_city
          )
        `
        )
        .eq('id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          if (user.user_metadata?.role === 'rider') {
            // Create profile logic...
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata.full_name || 'New Rider',
                role: 'rider',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (!createProfileError) {
              await supabase.from('riders_details').insert({
                profile_id: user.id,
                hourly_rate: 15,
                bio: 'New Rider',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

              // ✅ IMPORTANT: Avoid window.location.reload() which causes loops
              profileFetchedRef.current = false;
              fetchingProfileRef.current = false;
              setTimeout(() => fetchProfile(), 100);
              return;
            }
          } else {
            router.push('/auth/register');
            return;
          }
        }

        console.error('❌ Error fetching profile:', profileError);
        state.setError('Errore nel caricamento del profilo');
        return;
      }

      if (profileData?.role !== 'rider') {
        if (profileData.role === 'merchant') {
          router.push('/dashboard/merchant');
        } else {
          router.push('/auth/login');
        }
        return;
      }

      const riderDetails = Array.isArray(profileData.riders_details)
        ? profileData.riders_details[0]
        : profileData.riders_details;

      state.setProfile({
        id: profileData.id,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        riders_details: riderDetails || null,
        rider_tax_details: Array.isArray(profileData.rider_tax_details)
          ? profileData.rider_tax_details[0] || null
          : profileData.rider_tax_details || null,
      });

      profileFetchedRef.current = true;
      console.log('✅ Profile loaded successfully');
    } catch (error) {
      console.error('Error fetching profile:', error);
      state.setError('Errore nel caricamento del profilo');
    } finally {
      fetchingProfileRef.current = false;
      state.setLoading(false);
    }
  }, [router, onboardingComplete, state]);

  // Function to check and update onboarding status
  const checkOnboardingStatus = async () => {
    if (!state.profile?.riders_details?.stripe_account_id) {
      console.log('🚫 No Stripe account ID found');
      return false;
    }

    console.log(
      '🔍 Checking onboarding status for account:',
      state.profile.riders_details.stripe_account_id
    );
    state.setCheckingOnboarding(true);
    try {
      const response = await fetch('/api/stripe/onboarding', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔄 Onboarding status check result:', data);
        console.log(
          '📊 Current database status:',
          state.profile?.riders_details?.stripe_onboarding_complete
        );

        // Se lo stato è cambiato, aggiorna il profilo
        if (
          data.stripe_onboarding_complete !==
          state.profile.riders_details?.stripe_onboarding_complete
        ) {
          console.log(
            '✅ Onboarding status changed from',
            state.profile.riders_details?.stripe_onboarding_complete,
            'to',
            data.stripe_onboarding_complete
          );
          console.log('🔄 Reloading profile...');
          await fetchProfile(); // Ricarica il profilo
          return data.stripe_onboarding_complete;
        }

        return data.stripe_onboarding_complete;
      }
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
    } finally {
      state.setCheckingOnboarding(false);
    }

    console.log(
      '📊 Returning current status:',
      state.profile.riders_details?.stripe_onboarding_complete || false
    );
    return state.profile.riders_details?.stripe_onboarding_complete || false;
  };

  const handleStripeOnboarding = async () => {
    state.setLoading(true);
    state.setError(null);
    try {
      const response = await fetch('/api/stripe/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies in the request
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
      state.setError(
        err.message || "È sorto un errore durante l'attivazione dei pagamenti"
      );
    } finally {
      state.setLoading(false);
    }
  };

  const handleManagePayments = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      state.setError(
        'Devi effettuare il login per utilizzare questa funzionalità'
      );
      return;
    }

    if (!state.profile?.riders_details?.stripe_account_id) {
      state.setError("ID dell'account Stripe non trovato.");
      return;
    }

    state.setLoading(true);
    state.setError(null);
    try {
      const response = await fetch('/api/stripe/create-login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: state.profile.riders_details.stripe_account_id,
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
      state.setError(err.message || 'Failed to open Stripe Dashboard.');
    } finally {
      state.setLoading(false);
    }
  };

  // ✅ SOLUTION 4: fetchServiceRequests with protections
  const fetchServiceRequests = useCallback(async () => {
    if (!profileId) {
      console.log('🚫 No profile ID, skipping service requests');
      return;
    }

    if (fetchingServiceRequestsRef.current) {
      console.log('🚫 Already fetching service requests, skipping');
      return;
    }

    fetchingServiceRequestsRef.current = true;
    console.log('🔄 Fetching service requests for:', profileId);

    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select(
          `
          id, requested_date, start_time, duration_hours,
          merchant_address, description, status, rider_response,
          created_at, updated_at,
          merchant:profiles!merchant_id (
            id, full_name,
            esercenti (business_name, address, city)
          )
        `
        )
        .eq('rider_id', profileId)
        .order('created_at', { ascending: false });

      if (requestsError) {
        throw requestsError;
      }

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
        .filter(request => request.merchant);

      state.setServiceRequests(transformedRequests);
      console.log('✅ Service requests loaded:', transformedRequests.length);
    } catch (error) {
      console.error('❌ Error fetching service requests:', error);
      state.setError('Errore nel caricamento delle richieste di servizio');
    } finally {
      fetchingServiceRequestsRef.current = false;
    }
  }, [profileId, state]);

  // ✅ SOLUTION 5: Simplified and protected useEffect

  // Gestione onboarding complete (eseguito solo al mount)
  useEffect(() => {
    if (onboardingComplete === 'true') {
      console.log('✅ Onboarding completato, ricaricando profilo');
      window.history.replaceState({}, '', '/dashboard/rider');
      profileFetchedRef.current = false; // Forza il reload del profilo
      fetchProfile();
    }
  }, [fetchProfile, onboardingComplete]);

  // Caricamento profilo iniziale (eseguito solo se necessario)
  useEffect(() => {
    if (
      !onboardingComplete &&
      !profileFetchedRef.current &&
      !fetchingProfileRef.current
    ) {
      console.log('🏁 Caricamento profilo iniziale');
      fetchProfile();
    }
  }, [fetchProfile, onboardingComplete]);

  // Fetch service requests quando il profilo è disponibile
  useEffect(() => {
    if (profileId && !state.loading && profileFetchedRef.current) {
      console.log('👤 Profile ready, fetching service requests');
      fetchServiceRequests();
    }
  }, [profileId, state.loading, fetchServiceRequests, state]);

  // Funzione per recuperare i dati del portfolio - VERSIONE ULTRA PROTETTA
  const fetchPortfolioData = useCallback(async () => {
    // Controllo rigoroso per evitare chiamate duplicate
    if (!state.profile?.id) {
      console.log('🚫 NO PROFILE ID - skipping portfolio fetch');
      return;
    }

    if (isFetchingPortfolio) {
      console.log('🚫 ALREADY FETCHING - skipping portfolio fetch');
      return;
    }

    if (portfolioFetched) {
      console.log('🚫 ALREADY FETCHED - skipping portfolio fetch');
      return;
    }

    // Controllo per evitare chiamate se siamo su una pagina diversa dalla dashboard
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/dashboard/rider')) {
      console.log('🚫 NOT ON DASHBOARD - skipping portfolio fetch');
      return;
    }

    console.log('🔄 FETCHING PORTFOLIO DATA - ALL CHECKS PASSED');
    setIsFetchingPortfolio(true);

    try {
      const response = await fetch(`/api/riders/${state.profile.id}/portfolio`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ PORTFOLIO DATA RECEIVED:', data);

        state.setPortfolioData(data);
        setPortfolioFetched(true); // Imposta flag SOLO dopo successo
      } else {
        console.error('❌ Portfolio API error:', response.status);
        const emptyData = {
          portfolioImages: [],
          certifications: [],
          portfolioUrl: '',
          servicesDescription: '',
        };
        state.setPortfolioData(emptyData);
        setPortfolioFetched(true); // Anche in caso di errore, considera "fetchato"
      }
    } catch (error) {
      console.error('❌ Portfolio fetch error:', error);
      const emptyData = {
        portfolioImages: [],
        certifications: [],
        portfolioUrl: '',
        servicesDescription: '',
      };
      state.setPortfolioData(emptyData);
      setPortfolioFetched(true); // Anche in caso di errore
    } finally {
      setIsFetchingPortfolio(false);
    }
  }, [isFetchingPortfolio, portfolioFetched, state]);

  // Funzione per salvare il portfolio
  const handleSavePortfolio = async (data: {
    portfolioImages: string[];
    certifications: string[];
    portfolioUrl: string;
    servicesDescription: string;
  }) => {
    if (!state.profile) return;

    try {
      const response = await fetch(
        `/api/riders/${state.profile.id}/portfolio`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Errore nel salvataggio del portfolio');
      }

      // Aggiorna i dati locali e resetta i flag per permettere future chiamate se necessario
      state.setPortfolioData(data);
      setPortfolioFetched(false); // Permette di rifare fetch se necessario
      console.log('✅ Portfolio salvato con successo');
    } catch (error) {
      console.error('Errore nel salvataggio del portfolio:', error);
      throw error;
    }
  };

  // Assicuriamoci che fetchServiceRequests venga chiamata quando il profilo è disponibile
  useEffect(() => {
    if (state.profile?.id && !state.loading) {
      // Aggiunto controllo loading per evitare chiamate premature
      console.log('👤 Profile available, fetching service requests...');
      fetchServiceRequests();
      // 🚨 DISABILITATO TEMPORANEAMENTE: fetchPortfolioData();
      console.log(
        '🚫 PORTFOLIO FETCH TEMPORANEAMENTE DISABILITATO PER FERMARE LOOP INFINITO'
      );
    } else if (!state.profile) {
      console.log('⏳ Profile not available yet, waiting...');
    }
  }, [state.profile?.id, state.loading, state.profile, fetchServiceRequests]);

  // ✅ SOLUTION 6: Other optimized functions
  const handleRespondToRequest = useCallback(
    async (
      requestId: string,
      status: 'accepted' | 'rejected',
      response?: string
    ) => {
      try {
        const fetchResponse = await fetch(
          `/api/service-requests/${requestId}/respond`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status,
              riderResponse: response,
              userId: profileId,
            }),
          }
        );

        if (!fetchResponse.ok) {
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }

        const responseData = await fetchResponse.json();

        if (!responseData.success) {
          throw new Error(responseData.error || 'Failed to respond to request');
        }

        console.log('✅ Response sent successfully');

        // ✅ Reset flag per permettere nuovo fetch
        fetchingServiceRequestsRef.current = false;
        fetchServiceRequests();
      } catch (error) {
        console.error('❌ Error responding to request:', error);
        throw error;
      }
    },
    [profileId, fetchServiceRequests]
  );

  const handleOpenRespondModal = (request: ServiceRequest) => {
    state.setSelectedRequest(request);
    state.setShowRespondModal(true);
  };

  const handleCloseRespondModal = () => {
    state.setShowRespondModal(false);
    state.setSelectedRequest(null);
  };

  const handleLogout = useCallback(async () => {
    try {
      state.setLoggingOut(true);
      console.log('🚪 Logging out rider...');
      await supabase.auth.signOut();
      console.log('✅ Logout successful, redirecting to home');
      router.push('/');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      state.setError('Errore durante il logout');
      state.setLoggingOut(false);
    }
  }, [router, state]);

  if (state.loading && !state.profile) {
    return <RiderDashboardSkeleton />;
  }

  if (state.error) {
    return <div>Error: {state.error}</div>;
  }

  if (!state.profile) {
    return <div>Could not load profile.</div>;
  }

  const riderDetails = state.profile.riders_details;
  const onboardingState = getRiderOnboardingState(riderDetails);

  // ✅ RIMOSSO: Non mostrare più la schermata di attesa per onboarding_complete
  // Ora gestiamo tutto nel useEffect semplificato

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Top Navigation */}
      <TopNavBar
        userRole='rider'
        userName={state.profile?.full_name || 'Rider'}
        onLogout={handleLogout}
        onDeleteAccount={() => state.setShowDeleteModal(true)}
      />

      {/* Sidebar Unificata - Gestisce automaticamente desktop/mobile */}
      <Sidebar
        items={sidebarItems}
        onItemClick={scrollToSection}
        isMobile={false} // Il componente gestisce internamente il responsive
        isOpen={true}
        onToggle={toggle}
      />

      <div className='container mx-auto px-4 py-8 pt-20'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Benvenuto, {state.profile.full_name}! 🚴‍♂️
          </h1>
          <p className='text-gray-600'>
            Completa l'onboarding per sbloccare tutte le funzionalità
          </p>
        </div>

        {/* Progress Indicator */}
        <OnboardingProgress currentState={onboardingState} />

        {state.error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
            {state.error}
          </div>
        )}

        {/* Layout Mobile-First - Singola Colonna con Priorità */}
        <div className='flex flex-col space-y-4 md:space-y-6 lg:max-w-4xl lg:mx-auto'>
          {/* 1. PAGAMENTI - Priorità Massima (Monetizzazione) */}
          <div id='pagamenti'>
            <ModuloPagamenti
              profile={state.profile}
              onStripeOnboarding={handleStripeOnboarding}
              onManagePayments={handleManagePayments}
              onboardingState={onboardingState}
              requiredState={RiderOnboardingState.STRIPE_ONLY}
              loading={state.loading}
            />
          </div>

          {/* 2. PROFILO & DISPONIBILITÀ - Informazioni Personali Critiche */}
          <div id='profilo'>
            <ProfiloDisponibilita
              profile={state.profile}
              portfolioData={null}
              onProfileUpdate={() => {
                profileFetchedRef.current = false;
                fetchProfile();
              }}
              onPortfolioSave={async () => {}}
              onboardingState={onboardingState}
              requiredState={RiderOnboardingState.BASIC_PROFILE}
            />
          </div>

          {/* 3. GESTIONE LAVORO - Operativo */}
          <div id='lavoro'>
            <ModuloGestioneLavoro
              serviceRequests={state.serviceRequests}
              profile={state.profile}
              onOpenRespondModal={request => {
                state.setSelectedRequest(request);
                state.setShowRespondModal(true);
              }}
              onboardingState={onboardingState}
              requiredState={RiderOnboardingState.AVAILABILITY}
            />
          </div>

          {/* 4. IMPOSTAZIONI - Configurazioni */}
          <div id='impostazioni'>
            <ModuloImpostazioni
              profile={state.profile}
              onUpdateRate={() => state.setShowUpdateRateModal(true)}
              onFiscalData={() => state.setShowFiscalDataModal(true)}
              onDeleteAccount={() => state.setShowDeleteModal(true)}
              onboardingState={onboardingState}
              requiredState={RiderOnboardingState.BASIC_PROFILE}
            />
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={state.showDeleteModal}
        onClose={() => state.setShowDeleteModal(false)}
        userRole='rider'
      />

      {/* Availability Calendar Modal */}
      {state.showAvailabilityCalendar && state.profile && (
        <AvailabilityCalendar
          riderId={state.profile.id}
          onClose={() => state.setShowAvailabilityCalendar(false)}
        />
      )}

      {/* Update Rate Modal */}
      {state.showUpdateRateModal && state.profile && (
        <UpdateRateModal
          riderId={state.profile.id}
          currentRate={state.profile.riders_details?.hourly_rate || null}
          onClose={() => state.setShowUpdateRateModal(false)}
        />
      )}

      {/* Fiscal Data Modal */}
      {state.showFiscalDataModal && state.profile && (
        <FiscalDataModal
          isOpen={state.showFiscalDataModal}
          riderId={state.profile.id}
          onClose={() => state.setShowFiscalDataModal(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {state.showEditProfileModal && state.profile && (
        <EditProfileModal
          isOpen={state.showEditProfileModal}
          onClose={() => state.setShowEditProfileModal(false)}
          riderId={state.profile.id}
          onProfileUpdate={fetchProfile}
        />
      )}

      {/* Respond Service Request Modal */}
      <RespondServiceRequestModal
        isOpen={state.showRespondModal}
        onClose={handleCloseRespondModal}
        request={state.selectedRequest}
        riderHourlyRate={state.profile?.riders_details?.hourly_rate || null}
        onRespond={handleRespondToRequest}
      />

      {/* Portfolio Editor Modal - TEMPORANEAMENTE DISABILITATO */}
      {/* {state.showPortfolioEditor && state.portfolioData && state.profile && (
        <PortfolioEditor
          initialData={state.portfolioData}
          onSave={handleSavePortfolio}
          onClose={() => state.setShowPortfolioEditor(false)}
        />
      )} */}
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
