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
import {
  Bike,
  Calendar,
  Euro,
  Settings,
  Briefcase,
  User,
  Clock,
  Star,
  Edit,
} from 'lucide-react';
import Image from 'next/image';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import UpdateRateModal from '@/components/UpdateRateModal';
import EditProfileModal from '@/components/EditProfileModal';
import PortfolioEditor from '@/components/PortfolioEditor';
import PortfolioGallery from '@/components/PortfolioGallery';

interface RiderProfile {
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
}

interface PortfolioData {
  portfolioImages: string[];
  certifications: string[];
  portfolioUrl: string;
  servicesDescription: string;
}

interface ModuloProfiloDisponibilitaProps {
  profile: RiderProfile;
  portfolioData: any;
  onProfileUpdate: () => void;
  onPortfolioSave: (data: PortfolioData) => Promise<void>;
  onPortfolioEdit: () => void;
  onboardingState: number;
  requiredState: number;
}

const VEHICLE_CONFIG = {
  bici: { icon: '🚲', label: 'Bicicletta' },
  e_bike: { icon: '🚴‍♂️', label: 'E-Bike' },
  scooter: { icon: '🛵', label: 'Scooter' },
  auto: { icon: '🚗', label: 'Auto' },
} as const;

export default function ModuloProfiloDisponibilita({
  profile,
  portfolioData,
  onProfileUpdate,
  onPortfolioSave,
  onPortfolioEdit,
  onboardingState,
  requiredState,
}: ModuloProfiloDisponibilitaProps) {
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] =
    useState(false);
  const [showUpdateRateModal, setShowUpdateRateModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const isActive = onboardingState >= requiredState;

  const renderVehicleInfo = (vehicleType: string | null | undefined) => {
    const config = VEHICLE_CONFIG[vehicleType as keyof typeof VEHICLE_CONFIG];
    if (!config) {
      return (
        <span className='text-sm font-medium text-gray-700'>
          Veicolo non specificato
        </span>
      );
    }
    return (
      <span className='text-sm font-medium text-gray-700 capitalize'>
        {config.icon} {config.label}
      </span>
    );
  };

  const renderRating = () => (
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
      <span className='text-sm text-gray-600 ml-1'>5.0 • Nuovo rider</span>
    </div>
  );

  const renderProfilePicture = () => {
    if (profile.riders_details?.profile_picture_url) {
      return (
        <div className='relative'>
          <Image
            src={profile.riders_details.profile_picture_url}
            alt='Foto profilo'
            width={128}
            height={128}
            className='w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl'
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className='absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-3 border-white rounded-full flex items-center justify-center'>
            <div className='w-2 h-2 bg-white rounded-full'></div>
          </div>
        </div>
      );
    }

    return (
      <div className='relative'>
        <div
          className='w-32 h-32 rounded-full flex items-center justify-center shadow-xl border-4 border-white'
          style={{
            background: 'linear-gradient(to bottom right, #333366, #4a4a7a)',
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
    );
  };

  const getPortfolioStats = () => ({
    images: portfolioData?.portfolioImages?.length || 0,
    certifications: portfolioData?.certifications?.length || 0,
    portfolioUrl: portfolioData?.portfolioUrl ? 1 : 0,
  });

  if (!isActive) {
    return (
      <Card className='relative overflow-hidden opacity-60 pointer-events-none'>
        <CardContent className='relative px-6 pt-6 pb-6'>
          <div className='absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300'>
            <div className='text-center p-6 max-w-xs'>
              <Settings className='h-12 w-12 text-gray-400 mx-auto mb-3' />
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
              <User className='h-5 w-5' /> Profilo & Disponibilità
            </CardTitle>
            <CardDescription>
              Gestisci il tuo profilo, tariffa, calendario e portfolio
            </CardDescription>
          </CardHeader>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' /> Profilo & Disponibilità
          </CardTitle>
          <CardDescription>
            Gestisci il tuo profilo, tariffa, calendario e portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Sezione Profilo */}
          <div className='border-b pb-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <User className='h-4 w-4' /> Profilo Rider
            </h3>

            <div className='flex flex-col md:flex-row gap-6'>
              {/* Foto profilo e info base */}
              <div className='flex flex-col items-center text-center'>
                {renderProfilePicture()}
                <div className='mt-4 space-y-2'>
                  <h4 className='text-xl font-bold text-gray-900'>
                    {profile.rider_tax_details?.first_name &&
                    profile.rider_tax_details?.last_name
                      ? `${profile.rider_tax_details.first_name} ${profile.rider_tax_details.last_name}`
                      : profile.full_name || 'Nome non impostato'}
                  </h4>
                  {renderRating()}
                  <div className='flex items-center justify-center gap-2'>
                    {renderVehicleInfo(profile.riders_details?.vehicle_type)}
                  </div>
                </div>
              </div>

              {/* Bio e tariffa */}
              <div className='flex-1 space-y-4'>
                {profile.riders_details?.bio && (
                  <div>
                    <p className='text-gray-700 italic text-center md:text-left'>
                      "{profile.riders_details.bio}"
                    </p>
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center p-4 bg-gray-50 rounded-lg'>
                    <div className='text-2xl font-bold text-gray-900'>
                      €{profile.riders_details?.hourly_rate || 0}
                    </div>
                    <div className='text-sm text-gray-600'>per ora</div>
                  </div>
                  <div className='text-center p-4 bg-green-50 rounded-lg'>
                    <div className='text-lg font-bold text-green-600'>
                      Disponibile
                    </div>
                    <div className='text-xs text-gray-600'>Aggiornato oggi</div>
                  </div>
                </div>

                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShowEditProfileModal(true)}
                    className='flex-1'
                  >
                    <Edit className='w-4 h-4 mr-2' />
                    Modifica Profilo
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShowUpdateRateModal(true)}
                    className='flex-1'
                  >
                    <Euro className='w-4 h-4 mr-2' />
                    Tariffa
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sezione Disponibilità */}
          <div className='border-b pb-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Calendar className='h-4 w-4' /> Disponibilità
            </h3>
            <div className='text-center'>
              <Button
                variant='outline'
                onClick={() => setShowAvailabilityCalendar(true)}
                className='w-full md:w-auto'
              >
                <Calendar className='w-4 h-4 mr-2' />
                Gestisci Calendario Disponibilità
              </Button>
            </div>
          </div>

          {/* Sezione Portfolio */}
          <div>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Briefcase className='h-4 w-4' /> Portfolio
            </h3>

            {portfolioData ? (
              <div className='space-y-4'>
                {/* Stats Portfolio */}
                {(() => {
                  const stats = getPortfolioStats();
                  return (
                    <div className='grid grid-cols-3 gap-2 text-center'>
                      <div className='p-2 bg-gray-50 rounded-lg'>
                        <p className='text-lg font-bold text-gray-900'>
                          {stats.images}
                        </p>
                        <p className='text-xs text-gray-600'>Immagini</p>
                      </div>
                      <div className='p-2 bg-gray-50 rounded-lg'>
                        <p className='text-lg font-bold text-gray-900'>
                          {stats.certifications}
                        </p>
                        <p className='text-xs text-gray-600'>Certificazioni</p>
                      </div>
                      <div className='p-2 bg-gray-50 rounded-lg'>
                        <p className='text-lg font-bold text-gray-900'>
                          {stats.portfolioUrl}
                        </p>
                        <p className='text-xs text-gray-600'>Portfolio Web</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Preview Portfolio */}
                {portfolioData.portfolioImages?.length > 0 && (
                  <div className='flex justify-center gap-2'>
                    {portfolioData.portfolioImages
                      .slice(0, 3)
                      .map((image: string, index: number) => (
                        <div
                          key={index}
                          className='w-16 h-16 rounded-lg overflow-hidden border'
                        >
                          <Image
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            width={64}
                            height={64}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      ))}
                    {portfolioData.portfolioImages.length > 3 && (
                      <div className='w-16 h-16 rounded-lg bg-gray-100 border flex items-center justify-center'>
                        <span className='text-xs text-gray-500'>
                          +{portfolioData.portfolioImages.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant='outline'
                  onClick={onPortfolioEdit}
                  className='w-full'
                >
                  <Edit className='w-4 h-4 mr-2' />
                  Modifica Portfolio
                </Button>
              </div>
            ) : (
              <div className='text-center py-8'>
                <Briefcase className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500 mb-2'>Portfolio non configurato</p>
                <p className='text-sm text-gray-400 mb-4'>
                  Crea il tuo portfolio per attrarre più clienti
                </p>
                <Button
                  onClick={onPortfolioEdit}
                  style={{ backgroundColor: '#333366' }}
                >
                  Crea Portfolio
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modali */}
      {showAvailabilityCalendar && profile && (
        <AvailabilityCalendar
          riderId={profile.id}
          onClose={() => setShowAvailabilityCalendar(false)}
        />
      )}

      {showUpdateRateModal && profile && (
        <UpdateRateModal
          riderId={profile.id}
          currentRate={profile.riders_details?.hourly_rate || null}
          onClose={() => setShowUpdateRateModal(false)}
        />
      )}

      {showEditProfileModal && profile && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          riderId={profile.id}
          onProfileUpdate={onProfileUpdate}
        />
      )}
    </>
  );
}
