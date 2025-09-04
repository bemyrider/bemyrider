'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  X,
  Save,
  User,
  Bike,
  Euro,
  MessageSquare,
  Camera,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { VehicleType, VEHICLE_TYPE_LABELS } from '@/lib/enums';
import { executeWithAuthRetry, handleAuthError } from '@/lib/auth-utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  riderId: string;
  onProfileUpdate?: () => void;
}

interface ProfileData {
  full_name: string;
  bio: string;
  hourly_rate: string;
  vehicle_type: string;
  profile_picture_url: string;
  active_location: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

const vehicleTypes = Object.values(VehicleType).map(value => ({
  value,
  label: VEHICLE_TYPE_LABELS[value],
}));

export default function EditProfileModal({
  isOpen,
  onClose,
  riderId,
  onProfileUpdate,
}: EditProfileModalProps) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    bio: '',
    hourly_rate: '',
    vehicle_type: '',
    profile_picture_url: '',
    active_location: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Fetch existing profile data
  useEffect(() => {
    if (isOpen && riderId) {
      fetchProfileData();
    }
  }, [isOpen, riderId]);

  const fetchProfileData = async () => {
    try {
      // Fetch data from both profiles and riders_details tables
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(
          `
          full_name,
          riders_details (
            bio,
            hourly_rate,
            vehicle_type,
            profile_picture_url,
            active_location
          )
        `
        )
        .eq('id', riderId)
        .single();

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        return;
      }

      if (profileData) {
        const riderDetails = Array.isArray(profileData.riders_details)
          ? profileData.riders_details[0]
          : profileData.riders_details;
        setProfileData({
          full_name: profileData.full_name || '',
          bio: riderDetails?.bio || '',
          hourly_rate: riderDetails?.hourly_rate
            ? riderDetails.hourly_rate.toString()
            : '',
          vehicle_type: riderDetails?.vehicle_type || '',
          profile_picture_url: riderDetails?.profile_picture_url || '',
          active_location: riderDetails?.active_location || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const validateRate = (rate: string): boolean => {
    const numRate = parseFloat(rate);
    return !isNaN(numRate) && numRate > 0 && numRate <= 12.5;
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));

    // Clear message when user starts typing
    if (message?.type === 'error') {
      setMessage(null);
    }

    // Real-time validation for hourly rate
    if (field === 'hourly_rate' && value.length > 0) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setMessage({
          type: 'error',
          text: '⚠️ Inserisci un numero valido per la tariffa',
        });
      } else if (numValue <= 0) {
        setMessage({
          type: 'error',
          text: '⚠️ La tariffa deve essere maggiore di €0',
        });
      } else if (numValue > 12.5) {
        setMessage({
          type: 'error',
          text: "⚠️ Tariffa massima consentita: €12.50/h (per evitare ritenuta d'acconto)",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validation
      if (!profileData.full_name.trim()) {
        throw new Error('⚠️ Il nome completo è obbligatorio');
      }

      if (profileData.hourly_rate && !validateRate(profileData.hourly_rate)) {
        throw new Error('⚠️ La tariffa oraria deve essere tra €0.01 e €12.50');
      }

      // Use executeWithAuthRetry for robust auth handling
      await executeWithAuthRetry(async () => {
        // Update full_name in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: profileData.full_name.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', riderId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw profileError;
        }

        // Prepare data for riders_details update
        const riderDetailsToUpdate: any = {
          bio: profileData.bio.trim() || null,
          vehicle_type: profileData.vehicle_type || null,
          profile_picture_url: profileData.profile_picture_url.trim() || null,
          active_location: profileData.active_location.trim() || null,
          updated_at: new Date().toISOString(),
        };

        // Only update hourly_rate if provided
        if (profileData.hourly_rate.trim()) {
          riderDetailsToUpdate.hourly_rate = parseFloat(
            profileData.hourly_rate
          );
        }

        // Update riders_details data
        const { error: riderError } = await supabase
          .from('riders_details')
          .update(riderDetailsToUpdate)
          .eq('profile_id', riderId);

        if (riderError) {
          console.error('Error updating rider details:', riderError);
          throw riderError;
        }
      }, 2); // Retry up to 2 times

      setMessage({
        type: 'success',
        text: '✅ Profilo aggiornato con successo!',
      });

      // Call callback if provided
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Profile update error:', error);

      // Check if it's an auth error and handle redirect
      if (handleAuthError(error, router)) {
        setMessage({
          type: 'error',
          text: '🔒 Sessione scaduta. Stai per essere reindirizzato al login...',
        });

        // Close modal before redirect
        setTimeout(() => {
          onClose();
        }, 2000);
        return;
      }

      // Handle other errors
      setMessage({
        type: 'error',
        text:
          error.message ||
          "❌ Errore durante l'aggiornamento del profilo. Riprova.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Modifica Profilo
            </CardTitle>
            <CardDescription>
              Aggiorna le tue informazioni di profilo rider
            </CardDescription>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClose}
            disabled={loading}
          >
            <X className='h-4 w-4' />
          </Button>
        </CardHeader>

        <CardContent>
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4' noValidate>
            {/* Full Name */}
            <div className='space-y-2'>
              <Label htmlFor='fullName' className='flex items-center gap-2'>
                <User className='h-4 w-4' />
                Nome Completo
              </Label>
              <Input
                id='fullName'
                type='text'
                value={profileData.full_name}
                onChange={e => handleInputChange('full_name', e.target.value)}
                placeholder='Inserisci il tuo nome completo'
                disabled={loading}
                required
              />
              <p className='text-xs text-gray-500'>
                Il nome che verrà mostrato ai clienti
              </p>
            </div>

            {/* Bio */}
            <div className='space-y-2'>
              <Label htmlFor='bio' className='flex items-center gap-2'>
                <MessageSquare className='h-4 w-4' />
                Bio / Descrizione
              </Label>
              <textarea
                id='bio'
                value={profileData.bio}
                onChange={e => handleInputChange('bio', e.target.value)}
                placeholder='Descrivi brevemente te stesso e la tua esperienza come rider...'
                className='w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                rows={3}
                maxLength={500}
                disabled={loading}
              />
              <p className='text-xs text-gray-500'>
                Massimo 500 caratteri ({500 - profileData.bio.length} rimanenti)
              </p>
            </div>

            {/* Vehicle Type */}
            <div className='space-y-2'>
              <Label htmlFor='vehicleType' className='flex items-center gap-2'>
                <Bike className='h-4 w-4' />
                Tipo di Veicolo
              </Label>
              <select
                id='vehicleType'
                value={profileData.vehicle_type}
                onChange={e =>
                  handleInputChange('vehicle_type', e.target.value)
                }
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                disabled={loading}
              >
                <option value=''>Seleziona veicolo</option>
                {vehicleTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Location */}
            <div className='space-y-2'>
              <Label
                htmlFor='activeLocation'
                className='flex items-center gap-2'
              >
                <MapPin className='h-4 w-4' />
                Località Attiva
              </Label>
              <Input
                id='activeLocation'
                type='text'
                value={profileData.active_location}
                onChange={e =>
                  handleInputChange('active_location', e.target.value)
                }
                placeholder='Milano, Roma, Torino, ecc...'
                disabled={loading}
                maxLength={100}
              />
              <p className='text-xs text-gray-500'>
                La città o zona dove sei attivo per le consegne (massimo 100
                caratteri)
              </p>
            </div>

            {/* Hourly Rate */}
            <div className='space-y-2'>
              <Label htmlFor='hourlyRate' className='flex items-center gap-2'>
                <Euro className='h-4 w-4' />
                Tariffa Oraria (€/h)
              </Label>
              <Input
                id='hourlyRate'
                type='text'
                inputMode='decimal'
                pattern='[0-9]*[.,]?[0-9]*'
                value={profileData.hourly_rate}
                onChange={e => handleInputChange('hourly_rate', e.target.value)}
                placeholder='Es. 10.00'
                disabled={loading}
              />
              <p className='text-xs text-gray-500'>
                Tariffa massima: €12.50/h per evitare ritenuta d&apos;acconto su
                prestazioni occasionali
              </p>
            </div>

            {/* Profile Picture URL */}
            <div className='space-y-2'>
              <Label
                htmlFor='profilePictureUrl'
                className='flex items-center gap-2'
              >
                <Camera className='h-4 w-4' />
                URL Immagine Profilo
              </Label>
              <Input
                id='profilePictureUrl'
                type='url'
                value={profileData.profile_picture_url}
                onChange={e =>
                  handleInputChange('profile_picture_url', e.target.value)
                }
                placeholder='https://esempio.com/mia-foto.jpg'
                disabled={loading}
              />
              {/* Preview dell'immagine */}
              {profileData.profile_picture_url && (
                <div className='mt-3'>
                  <p className='text-xs text-gray-600 mb-3'>Anteprima:</p>
                  <div className='flex justify-center'>
                    <div className='relative'>
                      <Image
                        src={profileData.profile_picture_url}
                        alt='Anteprima foto profilo'
                        width={96}
                        height={96}
                        className='w-24 h-24 rounded-full object-cover border-3 border-blue-200 shadow-md'
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {/* Mini badge di anteprima */}
                      <div className='absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full'></div>
                    </div>
                  </div>
                  <p className='text-xs text-green-600 text-center mt-2'>
                    ✓ Immagine caricata correttamente
                  </p>
                </div>
              )}
              <p className='text-xs text-gray-500'>
                Inserisci l&apos;URL di un&apos;immagine (JPG, PNG, WEBP)
              </p>
            </div>

            {/* Information Panel */}
            <div className='mt-6 bg-blue-50 p-3 rounded-lg'>
              <h4 className='text-sm font-medium text-blue-700 mb-2 flex items-center gap-2'>
                <AlertCircle className='h-4 w-4' />
                Informazioni
              </h4>
              <ul className='text-xs text-blue-600 space-y-1'>
                <li>
                  • <strong>Nome:</strong> Mostrato ai clienti nelle
                  prenotazioni
                </li>
                <li>
                  • <strong>Bio:</strong> Aiuta i clienti a conoscerti meglio
                </li>
                <li>
                  • <strong>Veicolo:</strong> Influenza i tipi di consegne
                  disponibili
                </li>
                <li>
                  • <strong>Località:</strong> Determina la tua visibilità nelle
                  ricerche geografiche
                </li>
                <li>
                  • <strong>Tariffa:</strong> Può essere aggiornata in qualsiasi
                  momento
                </li>
                <li>
                  • <strong>Foto profilo:</strong> Aumenta la fiducia dei
                  clienti
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={loading}
                className='flex-1'
              >
                Annulla
              </Button>
              <Button type='submit' disabled={loading} className='flex-1'>
                {loading ? (
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                    Salvataggio...
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <Save className='h-4 w-4' />
                    Salva Modifiche
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
