'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Euro,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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

type RespondServiceRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  riderHourlyRate: number | null;
  onRespond: (
    requestId: string,
    status: 'accepted' | 'rejected',
    response?: string
  ) => Promise<void>;
};

export default function RespondServiceRequestModal({
  isOpen,
  onClose,
  request,
  riderHourlyRate,
  onRespond,
}: RespondServiceRequestModalProps) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [responseType, setResponseType] = useState<
    'accepted' | 'rejected' | null
  >(null);
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request || !responseType) return;

    setLoading(true);

    try {
      await onRespond(
        request.id,
        responseType,
        responseMessage.trim() || undefined
      );

      console.log('🎉 Risposta inviata con successo, mostrando toast...');

      // Prima chiudi il modal
      onClose();

      // Poi mostra il toast
      setTimeout(() => {
        console.log('🍞 Mostrando toast dopo chiusura modal...');
        console.log('📝 Toast data:', {
          title:
            responseType === 'accepted'
              ? 'Richiesta accettata'
              : 'Richiesta rifiutata',
          description: 'La risposta è stata inviata con successo',
        });

        const result = toast({
          title:
            responseType === 'accepted'
              ? 'Richiesta accettata'
              : 'Richiesta rifiutata',
          description: 'La risposta è stata inviata con successo',
        });

        console.log('🎯 Toast result:', result);
        console.log('✅ Toast chiamato con successo - dovrebbe apparire ora!');
      }, 100);
    } catch (error: any) {
      console.error('❌ Error responding to request:', error);
      console.log('🚨 Mostrando toast di errore...');

      toast({
        title: 'Errore',
        description: 'Errore durante la risposta alla richiesta',
      });

      // Chiudi il modal anche in caso di errore per evitare che rimanga bloccato
      setTimeout(() => {
        console.log('🔒 Chiudendo modal dopo errore...');
        onClose();
      }, 1000);
    } finally {
      setLoading(false);
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

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  if (!isOpen || !request) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <div>
            <CardTitle className='text-xl'>
              Rispondi alla Richiesta di Servizio
            </CardTitle>
            <CardDescription>
              {request.merchant.esercenti?.business_name ||
                request.merchant.full_name}
            </CardDescription>
          </div>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </CardHeader>

        <CardContent>
          {/* Request Details */}
          <div className='bg-gray-50 p-4 rounded-lg mb-6 space-y-3'>
            <h4 className='font-medium text-gray-900'>
              Dettagli della Richiesta
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <div className='flex items-center space-x-2'>
                <Calendar className='h-4 w-4 text-gray-500' />
                <span>{formatDate(request.requested_date)}</span>
              </div>
              <div className='flex items-center space-x-2'>
                <Clock className='h-4 w-4 text-gray-500' />
                <span>
                  {formatTime(request.start_time)} - {request.duration_hours}h
                  di servizio
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <MapPin className='h-4 w-4 text-gray-500' />
                <span className='truncate' title={request.merchant_address}>
                  {request.merchant_address}
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <Euro className='h-4 w-4 text-gray-500' />
                <span>
                  €
                  {(request.duration_hours * (riderHourlyRate || 15)).toFixed(
                    2
                  )}{' '}
                  (stimato)
                </span>
              </div>
            </div>
            {request.description && (
              <div className='mt-3 p-3 bg-white rounded border-l-4 border-blue-500'>
                <div className='flex items-start space-x-2'>
                  <MessageSquare className='h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm font-medium text-blue-900 mb-1'>
                      Istruzioni del merchant:
                    </p>
                    <p className='text-sm text-blue-700'>
                      {request.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Response Type Selection */}
            <div>
              <Label className='text-base font-medium'>La tua risposta *</Label>
              <div className='grid grid-cols-2 gap-4 mt-3'>
                <Button
                  type='button'
                  variant={responseType === 'accepted' ? 'default' : 'outline'}
                  className={`h-16 flex-col space-y-2 ${
                    responseType === 'accepted'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'hover:bg-green-50 hover:border-green-300'
                  }`}
                  onClick={() => setResponseType('accepted')}
                >
                  <CheckCircle className='h-6 w-6' />
                  <span>Accetta</span>
                </Button>
                <Button
                  type='button'
                  variant={responseType === 'rejected' ? 'default' : 'outline'}
                  className={`h-16 flex-col space-y-2 ${
                    responseType === 'rejected'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'hover:bg-red-50 hover:border-red-300'
                  }`}
                  onClick={() => setResponseType('rejected')}
                >
                  <X className='h-6 w-6' />
                  <span>Rifiuta</span>
                </Button>
              </div>
            </div>

            {/* Response Message */}
            <div>
              <Label htmlFor='response_message'>
                Messaggio opzionale
                {responseType === 'rejected' && (
                  <span className='text-red-500 ml-1'>*</span>
                )}
              </Label>
              <Textarea
                id='response_message'
                value={responseMessage}
                onChange={e => setResponseMessage(e.target.value)}
                placeholder={
                  responseType === 'accepted'
                    ? 'Aggiungi eventuali note o conferme...'
                    : 'Spiega il motivo del rifiuto...'
                }
                className='mt-1'
                rows={3}
                required={responseType === 'rejected'}
              />
              <p className='text-xs text-gray-500 mt-1'>
                {responseType === 'rejected'
                  ? 'Campo obbligatorio per i rifiuti'
                  : 'Campo opzionale per aggiungere dettagli'}
              </p>
            </div>

            {/* Submit Buttons */}
            <div className='flex space-x-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='flex-1'
                disabled={loading}
              >
                Annulla
              </Button>
              <Button
                type='submit'
                className={`flex-1 ${
                  responseType === 'accepted'
                    ? 'bg-green-600 hover:bg-green-700'
                    : responseType === 'rejected'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                }`}
                disabled={
                  loading ||
                  !responseType ||
                  (responseType === 'rejected' && !responseMessage.trim())
                }
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Invio...
                  </>
                ) : responseType === 'accepted' ? (
                  'Accetta Richiesta'
                ) : responseType === 'rejected' ? (
                  'Rifiuta Richiesta'
                ) : (
                  'Seleziona risposta'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
