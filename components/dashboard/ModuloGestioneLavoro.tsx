'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Mail,
  BookOpenCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Euro,
} from 'lucide-react';
import RespondServiceRequestModal from '@/components/RespondServiceRequestModal';

interface ServiceRequest {
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
}

interface RiderProfile {
  id: string;
  riders_details: {
    hourly_rate: number | null;
  } | null;
}

interface ModuloGestioneLavoroProps {
  serviceRequests: ServiceRequest[];
  profile: RiderProfile;
  onOpenRespondModal: (request: ServiceRequest) => void;
  onboardingState: number;
  requiredState: number;
}

export default function ModuloGestioneLavoro({
  serviceRequests,
  profile,
  onOpenRespondModal,
  onboardingState,
  requiredState,
}: ModuloGestioneLavoroProps) {
  const isActive = onboardingState >= requiredState;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In Attesa';
      case 'accepted':
        return 'Accettata';
      case 'rejected':
        return 'Rifiutata';
      case 'completed':
        return 'Completata';
      case 'cancelled':
        return 'Annullata';
      default:
        return status;
    }
  };

  const calculateEarnings = (request: ServiceRequest) => {
    const hourlyRate = profile.riders_details?.hourly_rate || 0;
    return hourlyRate * request.duration_hours;
  };

  if (!isActive) {
    return (
      <Card className='relative overflow-hidden opacity-60 pointer-events-none'>
        <CardContent className='relative px-6 pt-6 pb-6'>
          <div className='absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300'>
            <div className='text-center p-6 max-w-xs'>
              <Clock className='h-12 w-12 text-gray-400 mx-auto mb-3' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Funzione Bloccata
              </h3>
              <p className='text-sm text-gray-600'>
                Completa i passaggi precedenti per sbloccare questa sezione
              </p>
            </div>
          </div>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BookOpenCheck className='h-5 w-5' /> Gestione Lavoro
            </CardTitle>
            <CardDescription>
              Gestisci richieste di servizio e prenotazioni attive
            </CardDescription>
          </CardHeader>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BookOpenCheck className='h-5 w-5' /> Gestione Lavoro
        </CardTitle>
        <CardDescription>
          Gestisci richieste di servizio e prenotazioni attive
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Statistiche Richieste */}
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
            <p className='text-2xl font-bold text-yellow-600'>
              {serviceRequests.filter(r => r.status === 'pending').length}
            </p>
            <p className='text-sm text-yellow-700 font-medium'>In Attesa</p>
            <p className='text-xs text-yellow-600 mt-1'>Richieste nuove</p>
          </div>
          <div className='text-center p-4 bg-green-50 rounded-lg border border-green-200'>
            <p className='text-2xl font-bold text-green-600'>
              {serviceRequests.filter(r => r.status === 'accepted').length}
            </p>
            <p className='text-sm text-green-700 font-medium'>Accettate</p>
            <p className='text-xs text-green-600 mt-1'>Lavoro confermato</p>
          </div>
          <div className='text-center p-4 bg-blue-50 rounded-lg border border-blue-200'>
            <p className='text-2xl font-bold text-blue-600'>
              {
                serviceRequests.filter(r =>
                  ['in_progress', 'booked'].includes(r.status)
                ).length
              }
            </p>
            <p className='text-sm text-blue-700 font-medium'>Attive</p>
            <p className='text-xs text-blue-600 mt-1'>In corso</p>
          </div>
        </div>

        {/* Elenco Richieste */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <Mail className='h-4 w-4' /> Richieste Recenti
          </h3>

          {serviceRequests.length === 0 ? (
            <div className='text-center py-12'>
              <Mail className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500 mb-2 text-lg'>
                Nessuna richiesta ricevuta
              </p>
              <p className='text-sm text-gray-400 max-w-md mx-auto'>
                Le nuove richieste di servizio appariranno qui automaticamente.
                Tieni aggiornato il tuo profilo per ricevere più richieste!
              </p>
            </div>
          ) : (
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {serviceRequests.slice(0, 5).map(request => (
                <div
                  key={request.id}
                  className='border rounded-lg p-4 hover:shadow-md transition-shadow'
                >
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    {/* Informazioni richiesta */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <p className='font-semibold text-gray-900 truncate'>
                            {request.merchant.esercenti?.business_name ||
                              request.merchant.full_name}
                          </p>
                          <p className='text-sm text-gray-600 truncate'>
                            {request.merchant.esercenti?.address},{' '}
                            {request.merchant.esercenti?.city}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusText(request.status)}
                        </span>
                      </div>

                      <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2'>
                        <div className='flex items-center gap-1'>
                          <Calendar className='w-4 h-4' />
                          {new Date(request.requested_date).toLocaleDateString(
                            'it-IT'
                          )}
                        </div>
                        <div className='flex items-center gap-1'>
                          <Clock className='w-4 h-4' />
                          {request.start_time.substring(0, 5)} •{' '}
                          {request.duration_hours}h
                        </div>
                        <div className='flex items-center gap-1'>
                          <Euro className='w-4 h-4' />€
                          {calculateEarnings(request)}
                        </div>
                      </div>

                      {request.description && (
                        <p className='text-sm text-gray-700 line-clamp-2'>
                          {request.description}
                        </p>
                      )}
                    </div>

                    {/* Azioni */}
                    <div className='flex flex-col sm:flex-row gap-2 sm:min-w-fit'>
                      {request.status === 'pending' ? (
                        <Button
                          size='sm'
                          onClick={() => onOpenRespondModal(request)}
                          className='bg-blue-600 hover:bg-blue-700 w-full sm:w-auto'
                        >
                          Rispondi
                        </Button>
                      ) : (
                        <div className='text-xs text-gray-500 text-center'>
                          {request.status === 'accepted' && (
                            <div className='flex items-center gap-1 justify-center'>
                              <CheckCircle className='w-3 h-3 text-green-500' />
                              Confermata
                            </div>
                          )}
                          {request.status === 'rejected' && (
                            <div className='flex items-center gap-1 justify-center'>
                              <AlertTriangle className='w-3 h-3 text-red-500' />
                              Rifiutata
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {serviceRequests.length > 5 && (
            <div className='text-center pt-4 border-t'>
              <Button variant='outline' className='w-full'>
                Visualizza Tutte le Richieste ({serviceRequests.length})
              </Button>
            </div>
          )}
        </div>

        {/* Prenotazioni Attive */}
        <div className='border-t pt-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Calendar className='h-4 w-4' /> Prenotazioni Attive
          </h3>

          <div className='text-center py-8'>
            <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500 mb-2'>Nessuna prenotazione attiva</p>
            <p className='text-sm text-gray-400'>
              Le prenotazioni confermate appariranno qui
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
