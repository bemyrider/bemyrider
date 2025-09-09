'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Euro,
  MapPin,
  User,
  Bike,
  Heart,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/formatters';
import {
  SYSTEM_CONSTANTS,
  validateBookingHours,
  ERROR_MESSAGES,
} from '@/lib/constants';
import PortfolioGallery from '@/components/PortfolioGallery';
import PortfolioEditor from '@/components/PortfolioEditor';

type RiderProfile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  riders_details: {
    vehicle_type: string | null;
    profile_picture_url: string | null;
    bio: string | null;
    hourly_rate: number | null;
    stripe_account_id: string | null;
    stripe_onboarding_complete: boolean | null;
    // Portfolio fields
    portfolio_images: string[] | null;
    certifications: string[] | null;
    portfolio_url: string | null;
    services_description: string | null;
  } | null;
};

export default function RiderBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const riderId = params.id as string;

  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [merchant, setMerchant] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Portfolio states
  const [showPortfolioEditor, setShowPortfolioEditor] = useState(false);
  const [portfolioData, setPortfolioData] = useState({
    portfolioImages: [] as string[],
    certifications: [] as string[],
    portfolioUrl: '',
    servicesDescription: '',
  });
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // Booking form state
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [merchantAddress, setMerchantAddress] = useState('');
  const [description, setDescription] = useState('');
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchRiderProfile();
  }, [riderId]);

  // Load portfolio data when rider is loaded
  useEffect(() => {
    if (rider?.riders_details) {
      setPortfolioData({
        portfolioImages: rider.riders_details.portfolio_images || [],
        certifications: rider.riders_details.certifications || [],
        portfolioUrl: rider.riders_details.portfolio_url || '',
        servicesDescription: rider.riders_details.services_description || '',
      });
    }
  }, [rider]);

  // Carica lo stato dei preferiti quando il rider è caricato
  useEffect(() => {
    if (rider) {
      checkFavoriteStatus();
    }
  }, [rider]);

  // Validazione disponibilità in tempo reale
  useEffect(() => {
    if (startDate && startTime && duration) {
      const validation = validateAvailability();
      setAvailabilityError(validation.isValid ? null : validation.message);
    } else {
      setAvailabilityError(null);
    }
  }, [startDate, startTime, duration, availability]);

  const fetchRiderProfile = async () => {
    try {
      setLoading(true);

      // Fetch rider profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(
          `
          id,
          full_name,
          avatar_url,
          riders_details (
            vehicle_type,
            profile_picture_url,
            bio,
            hourly_rate,
            stripe_account_id,
            stripe_onboarding_complete,
            portfolio_images,
            certifications,
            portfolio_url,
            services_description
          )
        `
        )
        .eq('id', riderId)
        .eq('role', 'rider')
        .single();

      if (profileError) {
        console.error('Error fetching rider profile:', profileError);
        setError('Rider non trovato');
        return;
      }

      const riderDetails = Array.isArray(profileData.riders_details)
        ? profileData.riders_details[0]
        : profileData.riders_details;

      setRider({
        id: profileData.id,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        riders_details: riderDetails,
      });

      // Fetch rider availability
      const { data: availabilityData, error: availabilityError } =
        await supabase
          .from('disponibilita_riders')
          .select('*')
          .eq('rider_id', riderId)
          .order('day_of_week');

      if (!availabilityError && availabilityData) {
        setAvailability(availabilityData);
      }

      // Fetch current merchant data
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: merchantData, error: merchantError } = await supabase
          .from('esercenti')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!merchantError && merchantData) {
          setMerchant(merchantData);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Errore nel caricamento del profilo rider');
    } finally {
      setLoading(false);
    }
  };

  // Funzione per validare le disponibilità del rider
  const validateAvailability = () => {
    if (!startDate || !startTime || !duration || availability.length === 0) {
      return { isValid: true, message: '' };
    }

    // Converti la data selezionata in giorno della settimana
    const selectedDate = new Date(startDate);
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const selectedDay = dayNames[selectedDate.getDay()];

    // Trova la disponibilità per il giorno selezionato
    const dayAvailability = availability.find(
      slot => slot.day_of_week === selectedDay
    );

    if (!dayAvailability) {
      return {
        isValid: false,
        message: `Il rider non è disponibile il ${selectedDay.toLowerCase()}. Giorni disponibili: ${availability.map(s => s.day_of_week).join(', ')}`,
      };
    }

    // Calcola l'orario di fine del servizio
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const durationHours = parseFloat(duration);
    const endHour = startHour + Math.floor(durationHours);
    const endMinute = startMinute + (durationHours % 1) * 60;

    const endTime = `${endHour.toString().padStart(2, '0')}:${Math.floor(endMinute).toString().padStart(2, '0')}`;

    // Verifica se l'orario di inizio e fine rientrano nella disponibilità
    const availableStart = dayAvailability.start_time;
    const availableEnd = dayAvailability.end_time;

    if (startTime < availableStart || endTime > availableEnd) {
      return {
        isValid: false,
        message: `Il servizio (${startTime} - ${endTime}) non rientra negli orari disponibili del rider per il ${selectedDay.toLowerCase()} (${availableStart} - ${availableEnd})`,
      };
    }

    return { isValid: true, message: '' };
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.favorites?.includes(riderId) || false);
      }
    } catch (error) {
      console.error('Errore nel controllo dello stato dei preferiti:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!rider) return;

    setFavoriteLoading(true);
    const wasFavorite = isFavorite;

    // Aggiorna UI immediatamente per feedback istantaneo
    setIsFavorite(!wasFavorite);

    try {
      if (wasFavorite) {
        // Rimuovi dai preferiti
        const response = await fetch(`/api/favorites/${riderId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // Ripristina lo stato precedente se l'API fallisce
          setIsFavorite(true);
          toast({
            title: 'Errore',
            description: 'Unable to remove from favorites',
          });
        } else {
          toast({
            title: 'Rimosso dai preferiti',
            description: `${rider.full_name} è stato rimosso dai tuoi preferiti`,
          });
        }
      } else {
        // Aggiungi ai preferiti
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ riderId }),
        });

        if (!response.ok) {
          // Ripristina lo stato precedente se l'API fallisce
          setIsFavorite(false);
          toast({
            title: 'Errore',
            description: 'Unable to add to favorites',
          });
        } else {
          toast({
            title: 'Aggiunto ai preferiti',
            description: `${rider.full_name} è stato aggiunto ai tuoi preferiti`,
          });
        }
      }
    } catch (error) {
      console.error('Errore nella gestione dei preferiti:', error);
      // Ripristina lo stato precedente
      setIsFavorite(wasFavorite);
      toast({
        title: 'Errore',
        description: 'Errore di connessione',
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 handleBookingSubmit called');
    console.log('📝 Form data:', {
      startDate,
      startTime,
      duration,
      description,
    });

    if (
      !startDate ||
      !startTime ||
      !duration ||
      !description ||
      description.trim().length < 2
    ) {
      console.log('❌ Validation failed - missing required fields');
      toast({
        title: 'Errore',
        description:
          'Compila tutti i campi obbligatori. Le istruzioni devono contenere almeno 2 caratteri.',
      });
      return;
    }

    const durationNum = parseFloat(duration);

    // Validazione ore massime
    if (!validateBookingHours(durationNum)) {
      console.log('❌ Validation failed - invalid booking hours');
      toast({
        title: 'Errore',
        description: ERROR_MESSAGES.INVALID_BOOKING_HOURS,
      });
      return;
    }

    // Validazione disponibilità
    console.log('🔍 Validating availability...');
    const validation = validateAvailability();
    console.log('🔍 Validation result:', validation);

    if (!validation.isValid) {
      console.log('❌ Availability validation failed');
      toast({
        title: 'Conflitto con le Disponibilità',
        description: validation.message,
      });
      return;
    }

    console.log('✅ Validation passed, proceeding with booking...');

    setBookingLoading(true);

    try {
      // Verifica utente autenticato
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast({
          title: 'Errore',
          description:
            'Devi essere autenticato per effettuare una prenotazione',
        });
        router.push('/auth/login');
        return;
      }

      // Creazione diretta della service request tramite Supabase
      const { data: serviceRequest, error: serviceError } = await supabase
        .from('service_requests')
        .insert({
          merchant_id: user.id,
          rider_id: rider?.id,
          requested_date: new Date(startDate + 'T' + startTime).toISOString(),
          start_time: startTime,
          duration_hours: parseFloat(duration),
          merchant_address: merchantAddress,
          description: description,
          status: 'pending',
        })
        .select()
        .single();

      if (serviceError) {
        console.error('❌ Error creating service request:', serviceError);
        throw new Error('Errore nella creazione della richiesta di servizio');
      }

      console.log('✅ Service request created:', serviceRequest);

      toast({
        title: 'Richiesta Inviata!',
        description: `Richiesta di servizio inviata a ${rider?.full_name}. Riceverai una risposta entro 24 ore.`,
      });

      // Redirect alla dashboard merchant
      router.push('/dashboard/merchant');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Errore',
        description: "Errore durante l'invio della richiesta di servizio",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    const hours = parseFloat(duration) || 0;
    const rate = rider?.riders_details?.hourly_rate || 0;
    return hours * rate;
  };

  // Portfolio functions
  const handleEditPortfolio = () => {
    setShowPortfolioEditor(true);
  };

  const handleSavePortfolio = async (data: typeof portfolioData) => {
    try {
      setPortfolioLoading(true);

      // Call the portfolio API
      const response = await fetch(`/api/riders/${riderId}/portfolio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save portfolio');
      }

      const result = await response.json();
      setPortfolioData(result.data);

      toast({
        title: 'Portfolio aggiornato',
        description: 'Le modifiche sono state salvate con successo',
      });

      // Update rider state to reflect changes
      setRider(prev =>
        prev
          ? {
              ...prev,
              riders_details: prev.riders_details
                ? {
                    ...prev.riders_details,
                    portfolio_images: result.data.portfolioImages,
                    certifications: result.data.certifications,
                    portfolio_url: result.data.portfolioUrl,
                    services_description: result.data.servicesDescription,
                  }
                : null,
            }
          : null
      );
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast({
        title: 'Errore',
        description: 'Unable to save portfolio',
      });
    } finally {
      setPortfolioLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Caricamento profilo rider...</p>
        </div>
      </div>
    );
  }

  if (error || !rider) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='text-center p-6'>
            <p className='text-red-500 mb-4'>{error || 'Rider non trovato'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4 max-w-4xl'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <Button variant='ghost' onClick={() => router.back()}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Torna alla Lista Rider
            </Button>

            {/* Favorite Button - Solo per merchant */}
            {merchant && rider && (
              <Button
                variant='ghost'
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className='flex items-center gap-2 px-4 py-2 hover:bg-red-50'
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                />
                <span className='text-sm font-medium'>
                  {isFavorite ? 'Nei Preferiti' : 'Aggiungi ai Preferiti'}
                </span>
              </Button>
            )}
          </div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {merchant ? 'Prenota Rider' : 'Profilo Rider'}
          </h1>
          <p className='text-gray-600'>
            {merchant
              ? `Effettua una prenotazione con ${rider.full_name}`
              : `Visualizza il profilo di ${rider.full_name}`}
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-8'>
          {/* Rider Profile Card */}
          <Card>
            <CardHeader>
              <div className='flex items-center space-x-4'>
                <div className='w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center'>
                  {rider.riders_details?.profile_picture_url ||
                  rider.avatar_url ? (
                    <Image
                      src={
                        rider.riders_details?.profile_picture_url ||
                        rider.avatar_url ||
                        ''
                      }
                      alt={rider.full_name}
                      width={64}
                      height={64}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <User className='h-8 w-8 text-gray-400' />
                  )}
                </div>
                <div>
                  <CardTitle className='text-xl'>{rider.full_name}</CardTitle>
                  <div className='flex items-center space-x-2 mt-1'>
                    <Bike className='h-4 w-4 text-gray-500' />
                    <span className='text-sm text-gray-600'>
                      {rider.riders_details?.vehicle_type ||
                        'Vehicle not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Hourly Rate */}
              <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                <div className='flex items-center space-x-2'>
                  <Euro className='h-5 w-5 text-blue-600' />
                  <span className='font-medium'>Tariffa Oraria</span>
                </div>
                <Badge
                  variant='secondary'
                  className='bg-blue-100 text-blue-800'
                >
                  {formatCurrency(rider.riders_details?.hourly_rate || 0)}/ora
                </Badge>
              </div>

              {/* Bio */}
              {rider.riders_details?.bio && (
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>Biografia</h4>
                  <p className='text-gray-600 text-sm'>
                    {rider.riders_details.bio}
                  </p>
                </div>
              )}

              {/* Portfolio Section */}
              <PortfolioGallery
                portfolioImages={portfolioData.portfolioImages}
                certifications={portfolioData.certifications}
                portfolioUrl={portfolioData.portfolioUrl}
                servicesDescription={portfolioData.servicesDescription}
                riderName={rider.full_name}
                isOwner={false} // TODO: Check if current user is the rider
                onEdit={handleEditPortfolio}
              />

              {/* Availability Status */}
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-sm text-green-600 font-medium'>
                    Disponibile
                  </span>
                </div>

                {/* Availability Schedule */}
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Orari Disponibili
                  </h4>
                  {availability.length > 0 ? (
                    <div className='space-y-1 text-sm text-gray-600'>
                      {availability.map(slot => (
                        <div key={slot.id} className='flex justify-between'>
                          <span>{slot.day_of_week}:</span>
                          <span>
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-sm text-gray-500 italic'>
                      No availability configured
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form - Solo per merchant */}
          {merchant ? (
            <Card>
              <CardHeader>
                <CardTitle>Richiesta di Servizio</CardTitle>
                <CardDescription>
                  Compila i dettagli per inviare una richiesta di servizio. Il
                  rider valuterà la sua disponibilità e ti risponderà.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBookingSubmit} className='space-y-4'>
                  {/* Data */}
                  <div>
                    <Label htmlFor='startDate'>Data *</Label>
                    <Input
                      id='startDate'
                      type='date'
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      max={
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split('T')[0]
                      }
                      required
                    />
                  </div>

                  {/* Ora */}
                  <div>
                    <Label htmlFor='startTime'>Ora di Inizio *</Label>
                    <Input
                      id='startTime'
                      type='time'
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      required
                    />
                  </div>

                  {/* Durata */}
                  <div>
                    <Label htmlFor='duration'>
                      Durata (max {SYSTEM_CONSTANTS.MAX_BOOKING_HOURS} ore) *
                    </Label>
                    <select
                      id='duration'
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      required
                    >
                      <option value=''>Seleziona durata</option>
                      <option value='1'>1 ora</option>
                      <option value='2'>2 ore</option>
                    </select>
                    <p className='text-xs text-gray-500 mt-1'>
                      Massimo {SYSTEM_CONSTANTS.MAX_BOOKING_HOURS} ore per
                      prenotazione
                    </p>
                  </div>

                  {/* Indirizzo di Servizio */}
                  <div>
                    <Label htmlFor='merchantAddress'>
                      Indirizzo di Servizio *
                    </Label>
                    <Input
                      id='merchantAddress'
                      type='text'
                      value={merchantAddress}
                      onChange={e => setMerchantAddress(e.target.value)}
                      placeholder="L'indirizzo completo dove il rider deve presentarsi"
                      required
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Può essere l'indirizzo della tua attività o qualsiasi
                      altro indirizzo dove serve il servizio
                    </p>
                  </div>

                  {/* Descrizione */}
                  <div>
                    <Label htmlFor='description'>
                      Istruzioni e Comunicazioni *
                    </Label>
                    <textarea
                      id='description'
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      rows={3}
                      placeholder='Inserisci istruzioni specifiche, indirizzi, note particolari o comunicazioni per il rider...'
                      required
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Campo obbligatorio - minimo 2 caratteri
                    </p>
                  </div>

                  {/* Alert per conflitti di disponibilità */}
                  {availabilityError && (
                    <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'>
                      <strong>⚠️ Conflitto con le Disponibilità:</strong>
                      <br />
                      {availabilityError}
                    </div>
                  )}

                  {/* Riepilogo */}
                  {startDate &&
                    startTime &&
                    duration &&
                    merchantAddress &&
                    description &&
                    description.trim().length >= 2 && (
                      <div className='bg-blue-50 p-4 rounded-lg space-y-2'>
                        <h4 className='font-medium text-gray-900'>
                          Riepilogo Richiesta
                        </h4>
                        <div className='text-sm space-y-1'>
                          <div className='flex justify-between'>
                            <span>Data richiesta:</span>
                            <span>{formatDate(startDate)}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span>Ora di inizio:</span>
                            <span>{startTime}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span>Durata:</span>
                            <span>
                              {duration} {duration === '1' ? 'ora' : 'ore'}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span>Indirizzo:</span>
                            <span
                              className='text-right max-w-xs truncate'
                              title={merchantAddress}
                            >
                              {merchantAddress}
                            </span>
                          </div>
                          {description && (
                            <div className='flex justify-between'>
                              <span>Istruzioni:</span>
                              <span
                                className='text-right max-w-xs truncate'
                                title={description}
                              >
                                {description}
                              </span>
                            </div>
                          )}
                          <div className='flex justify-between font-medium'>
                            <span>Costo stimato:</span>
                            <span>{formatCurrency(calculateTotal())}</span>
                          </div>
                        </div>
                        <div className='mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800'>
                          💡 Il rider riceverà questa richiesta e ti risponderà
                          entro 24 ore
                        </div>
                      </div>
                    )}

                  <Button
                    type='submit'
                    className='w-full bg-blue-600 hover:bg-blue-700'
                    disabled={bookingLoading || !!availabilityError}
                  >
                    {bookingLoading ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Invio Richiesta...
                      </>
                    ) : (
                      <>
                        <Calendar className='h-4 w-4 mr-2' />
                        Verifica Disponibilità
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Area Riservata agli Esercenti</CardTitle>
                <CardDescription>
                  Solo gli esercenti possono inviare richieste di servizio ai
                  rider. If you are a rider interested in collaborating, wait to
                  receive requests from merchants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center py-8'>
                  <div className='text-4xl mb-4'>🏪</div>
                  <p className='text-gray-600'>
                    Questa sezione è riservata agli esercenti per gestire le
                    prenotazioni.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Portfolio Editor Modal */}
      {showPortfolioEditor && (
        <PortfolioEditor
          initialData={portfolioData}
          onSave={handleSavePortfolio}
          onClose={() => setShowPortfolioEditor(false)}
          isLoading={portfolioLoading}
        />
      )}
    </div>
  );
}
