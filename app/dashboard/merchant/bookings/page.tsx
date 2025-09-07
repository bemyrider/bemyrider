'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, User, Euro, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/formatters';

type Booking = {
  id: string;
  merchantId: string;
  riderId: string;
  riderName: string;
  startTime: string;
  endTime: string;
  duration: number;
  grossAmount: number;
  status: string;
  description: string;
};

export default function BookingsManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Verifica autenticazione
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/auth/login');
        return;
      }

      // Fetch bookings
      const response = await fetch('/api/bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Errore nel caricamento delle prenotazioni');
      }

      const result = await response.json();
      setBookings(result.bookings || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      setError(error.message || 'Errore nel caricamento delle prenotazioni');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      in_attesa: { label: 'In Attesa', variant: 'secondary' as const },
      confermata: { label: 'Confermata', variant: 'default' as const },
      in_corso: { label: 'In Corso', variant: 'secondary' as const },
      completata: { label: 'Completata', variant: 'default' as const },
      annullata: { label: 'Annullata', variant: 'destructive' as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: 'secondary' as const,
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Caricamento prenotazioni...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4 max-w-6xl'>
        {/* Header */}
        <div className='mb-6'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-4'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Torna alla Dashboard
          </Button>
          <h1 className='text-3xl font-bold text-gray-900'>
            Gestisci Prenotazioni
          </h1>
          <p className='text-gray-600'>
            Visualizza e gestisci le tue prenotazioni rider
          </p>
        </div>

        {error && (
          <Card className='mb-6 border-red-200 bg-red-50'>
            <CardContent className='p-4'>
              <p className='text-red-600'>{error}</p>
              <Button onClick={fetchBookings} className='mt-2'>
                Riprova
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <Calendar className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Nessuna prenotazione
              </h3>
              <p className='text-gray-600 mb-4'>
                Non hai ancora effettuato prenotazioni. Cerca un rider per
                iniziare.
              </p>
              <Button onClick={() => router.push('/dashboard/merchant')}>
                Torna alla Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {bookings.map(booking => (
              <Card
                key={booking.id}
                className='hover:shadow-lg transition-shadow'
              >
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='flex items-center gap-2'>
                        <User className='h-5 w-5' />
                        {booking.riderName}
                      </CardTitle>
                      <CardDescription>
                        Prenotazione #{booking.id.slice(-8)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='grid md:grid-cols-2 gap-4'>
                    {/* Dettagli temporali */}
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 text-gray-500' />
                        <span className='text-sm'>
                          <strong>Inizio:</strong>{' '}
                          {formatDateTime(booking.startTime)}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-gray-500' />
                        <span className='text-sm'>
                          <strong>Durata:</strong> {booking.duration}h
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Euro className='h-4 w-4 text-gray-500' />
                        <span className='text-sm'>
                          <strong>Totale:</strong>{' '}
                          {formatCurrency(booking.grossAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Descrizione e azioni */}
                    <div className='space-y-3'>
                      {booking.description && (
                        <div>
                          <div className='flex items-center gap-2 mb-1'>
                            <MapPin className='h-4 w-4 text-gray-500' />
                            <span className='text-sm font-medium'>
                              Descrizione:
                            </span>
                          </div>
                          <p className='text-sm text-gray-600 ml-6'>
                            {booking.description}
                          </p>
                        </div>
                      )}

                      {/* Azioni */}
                      <div className='flex gap-2 mt-4'>
                        {booking.status === 'in_attesa' && (
                          <>
                            <Button size='sm' variant='outline'>
                              Modifica
                            </Button>
                            <Button size='sm' variant='destructive'>
                              Annulla
                            </Button>
                          </>
                        )}
                        {booking.status === 'confermata' && (
                          <Button size='sm'>Contatta Rider</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
