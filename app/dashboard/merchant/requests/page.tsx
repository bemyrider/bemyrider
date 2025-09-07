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
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/formatters';
import EditServiceRequestModal from '@/components/EditServiceRequestModal';

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
  rider: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    riders_details: {
      hourly_rate: number | null;
      profile_picture_url: string | null;
    } | null;
  };
};

export default function MerchantRequestsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchServiceRequests();
    }
  }, [profile]);

  const fetchProfile = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Errore nel caricamento del profilo');
    }
  }, [router]);

  const fetchServiceRequests = useCallback(async () => {
    if (!profile) return;

    try {
      console.log('🔍 Fetching service requests for merchant...');

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
          rider:profiles!rider_id (
            id,
            full_name,
            avatar_url,
            riders_details (
              hourly_rate,
              profile_picture_url
            )
          )
        `
        )
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('❌ Error fetching service requests:', requestsError);
        throw requestsError;
      }

      // Trasforma i dati per assicurarsi che rider sia un oggetto
      const transformedRequests = (requestsData || [])
        .map(request => {
          const rider = Array.isArray(request.rider)
            ? request.rider[0]
            : request.rider;
          return {
            ...request,
            rider: {
              ...rider,
              riders_details: Array.isArray(rider?.riders_details)
                ? rider.riders_details[0]
                : rider?.riders_details,
            },
          };
        })
        .filter(request => request.rider); // Filtra richieste senza rider

      console.log('✅ Service requests fetched:', transformedRequests);
      setServiceRequests(transformedRequests);
    } catch (error: any) {
      console.error('Error fetching service requests:', error);
      setError('Errore nel caricamento delle richieste di servizio');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-50 text-yellow-700 border-yellow-200'
          >
            In Attesa
          </Badge>
        );
      case 'accepted':
        return (
          <Badge
            variant='outline'
            className='bg-green-50 text-green-700 border-green-200'
          >
            Accettata
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant='outline'
            className='bg-red-50 text-red-700 border-red-200'
          >
            Rifiutata
          </Badge>
        );
      case 'expired':
        return (
          <Badge
            variant='outline'
            className='bg-gray-50 text-gray-700 border-gray-200'
          >
            Scaduta
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className='h-4 w-4 text-yellow-600' />;
      case 'accepted':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'rejected':
        return <XCircle className='h-4 w-4 text-red-600' />;
      case 'expired':
        return <AlertCircle className='h-4 w-4 text-gray-600' />;
      default:
        return <AlertCircle className='h-4 w-4 text-gray-600' />;
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
    return timeStr.substring(0, 5); // Rimuove i secondi
  };

  const handleEditRequest = (request: ServiceRequest) => {
    console.log('🔧 Edit request clicked:', request.id);
    setEditingRequest(request);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = async (requestId: string) => {
    console.log('🗑️ Delete request clicked:', requestId);
    if (
      !confirm('Sei sicuro di voler eliminare questa richiesta di servizio?')
    ) {
      return;
    }

    try {
      console.log('🗑️ Attempting to delete request:', requestId);

      const { data, error } = await supabase
        .from('service_requests')
        .delete()
        .eq('id', requestId)
        .select();

      console.log('🗑️ Delete result:', { data, error });

      if (error) {
        console.error('❌ Delete error:', error);
        throw error;
      }

      console.log('✅ Delete successful:', data);

      toast({
        title: 'Richiesta eliminata',
        description: 'La richiesta di servizio è stata eliminata con successo',
      });

      // Ricarica le richieste
      fetchServiceRequests();
    } catch (error: any) {
      console.error('❌ Error deleting request:', error);
      toast({
        title: 'Errore',
        description: `Errore durante l'eliminazione della richiesta: ${error.message}`,
      });
    }
  };

  const handleSaveRequest = async (updatedData: Partial<ServiceRequest>) => {
    if (!editingRequest) return;

    try {
      console.log('💾 Saving request changes:', editingRequest.id, updatedData);

      const { data, error } = await supabase
        .from('service_requests')
        .update(updatedData)
        .eq('id', editingRequest.id)
        .select();

      console.log('💾 Update result:', { data, error });

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }

      console.log('✅ Update successful:', data);

      // Ricarica le richieste
      fetchServiceRequests();

      // Chiudi il modal
      setIsEditModalOpen(false);
      setEditingRequest(null);
    } catch (error: any) {
      console.error('❌ Error updating request:', error);
      throw error; // Rilancia l'errore per essere gestito dal modal
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRequest(null);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Caricamento richieste...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='text-center p-6'>
            <p className='text-red-500 mb-4'>{error}</p>
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
            Gestisci Richieste di Servizio
          </h1>
          <p className='text-gray-600'>
            Visualizza e gestisci tutte le richieste di servizio inviate ai
            rider
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center space-x-2'>
                <AlertCircle className='h-5 w-5 text-yellow-600' />
                <div>
                  <p className='text-sm text-gray-600'>In Attesa</p>
                  <p className='text-2xl font-bold text-yellow-600'>
                    {serviceRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center space-x-2'>
                <CheckCircle className='h-5 w-5 text-green-600' />
                <div>
                  <p className='text-sm text-gray-600'>Accettate</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {
                      serviceRequests.filter(r => r.status === 'accepted')
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center space-x-2'>
                <XCircle className='h-5 w-5 text-red-600' />
                <div>
                  <p className='text-sm text-gray-600'>Rifiutate</p>
                  <p className='text-2xl font-bold text-red-600'>
                    {
                      serviceRequests.filter(r => r.status === 'rejected')
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center space-x-2'>
                <Calendar className='h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm text-gray-600'>Totale</p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {serviceRequests.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Requests List */}
        {serviceRequests.length === 0 ? (
          <Card>
            <CardContent className='text-center p-8'>
              <Calendar className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Nessuna Richiesta di Servizio
              </h3>
              <p className='text-gray-600 mb-4'>
                Non hai ancora inviato richieste di servizio ai rider.
              </p>
              <Button onClick={() => router.push('/riders')}>
                Trova Rider
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {serviceRequests.map(request => (
              <Card
                key={request.id}
                className='hover:shadow-md transition-shadow'
              >
                <CardContent className='p-6'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start space-x-4 flex-1'>
                      {/* Rider Avatar */}
                      <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0'>
                        {request.rider.riders_details?.profile_picture_url ||
                        request.rider.avatar_url ? (
                          <Image
                            src={
                              request.rider.riders_details
                                ?.profile_picture_url ||
                              request.rider.avatar_url ||
                              ''
                            }
                            alt={request.rider.full_name}
                            width={48}
                            height={48}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <User className='h-6 w-6 text-gray-400' />
                        )}
                      </div>

                      {/* Request Details */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <h3 className='text-lg font-semibold text-gray-900 truncate'>
                            {request.rider.full_name}
                          </h3>
                          {getStatusIcon(request.status)}
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600'>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='h-4 w-4' />
                            <span>{formatDate(request.requested_date)}</span>
                          </div>

                          <div className='flex items-center space-x-2'>
                            <Clock className='h-4 w-4' />
                            <span>
                              {formatTime(request.start_time)} -{' '}
                              {request.duration_hours}h di servizio
                            </span>
                          </div>

                          <div className='flex items-center space-x-2'>
                            <MapPin className='h-4 w-4' />
                            <span
                              className='truncate'
                              title={request.merchant_address}
                            >
                              {request.merchant_address}
                            </span>
                          </div>

                          <div className='flex items-center space-x-2'>
                            <span className='font-medium'>
                              {formatCurrency(
                                (request.rider.riders_details?.hourly_rate ||
                                  0) * request.duration_hours
                              )}
                            </span>
                          </div>
                        </div>

                        {request.description && (
                          <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                            <div className='flex items-start space-x-2'>
                              <MessageSquare className='h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0' />
                              <p className='text-sm text-gray-700'>
                                {request.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {request.rider_response && (
                          <div className='mt-3 p-3 bg-blue-50 rounded-lg'>
                            <div className='flex items-start space-x-2'>
                              <MessageSquare className='h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0' />
                              <div>
                                <p className='text-sm font-medium text-blue-900 mb-1'>
                                  Risposta del Rider:
                                </p>
                                <p className='text-sm text-blue-700'>
                                  {request.rider_response}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge and Actions */}
                    <div className='flex-shrink-0 ml-4 flex flex-col items-end space-y-2'>
                      {getStatusBadge(request.status)}

                      {/* Action Buttons - Only show for pending requests */}
                      {request.status === 'pending' && (
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEditRequest(request)}
                            className='h-8 px-3'
                          >
                            <Edit className='h-3 w-3 mr-1' />
                            Modifica
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDeleteRequest(request.id)}
                            className='h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50'
                          >
                            <Trash2 className='h-3 w-3 mr-1' />
                            Elimina
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <EditServiceRequestModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          request={editingRequest}
          onSave={handleSaveRequest}
        />
      </div>
    </div>
  );
}
