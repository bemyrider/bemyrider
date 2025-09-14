'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search, HeartHandshake, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { UserNav } from '@/components/UserNav';
import { RidersList } from '@/components/RidersList';
import { VehicleTabs } from '@/components/VehicleTabs';
import { BottomNavBar } from '@/components/BottomNavBar';

interface Rider {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  hourly_rate: number;
  vehicle_type: string | null;
  profile_picture_url: string | null;
  active_location: string | null;
  completed_jobs?: number;
  rating?: number;
  is_verified?: boolean;
}

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<
    'ebike' | 'scooter' | 'auto'
  >('ebike');
  const [activeTab, setActiveTab] = useState<
    'riders' | 'favorites' | 'messages'
  >('riders');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [favoriteRiders, setFavoriteRiders] = useState<Rider[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    role: 'merchant' | 'rider' | null;
    full_name: string;
  } | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const loadFavoriteRiders = useCallback(async (favoriteIds: string[]) => {
    setLoadingFavorites(true);
    try {
      // Recupera tutti i rider con i loro dettagli
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'rider')
        .in('id', favoriteIds);

      if (profilesError) {
        console.error('Error fetching favorite profiles:', profilesError);
        return;
      }

      const favoriteRidersWithDetails = [];
      for (const profile of profilesData || []) {
        const { data: detailsData } = await supabase
          .from('riders_details')
          .select(
            'bio, hourly_rate, vehicle_type, profile_picture_url, active_location'
          )
          .eq('profile_id', profile.id)
          .single();

        favoriteRidersWithDetails.push({
          id: profile.id,
          full_name: profile.full_name || 'Rider',
          avatar_url: profile.avatar_url,
          bio: detailsData?.bio || null,
          hourly_rate: detailsData?.hourly_rate || 15,
          vehicle_type: detailsData?.vehicle_type || 'Veicolo',
          profile_picture_url: detailsData?.profile_picture_url || null,
          active_location: detailsData?.active_location || null,
        });
      }

      setFavoriteRiders(favoriteRidersWithDetails);
    } catch (error) {
      console.error(
        'Errore nel caricamento dei dettagli dei rider preferiti:',
        error
      );
    } finally {
      setLoadingFavorites(false);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        const favoriteIds = data.favorites || [];
        setFavorites(favoriteIds);

        // Se ci sono preferiti, recupera i dettagli completi dei rider
        if (favoriteIds.length > 0) {
          await loadFavoriteRiders(favoriteIds);
        } else {
          setFavoriteRiders([]);
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento dei preferiti:', error);
    }
  }, [loadFavoriteRiders]);

  useEffect(() => {
    fetchRiders();
    fetchUserProfile();
  }, []);

  // Carica i preferiti quando il profilo utente è disponibile
  useEffect(() => {
    if (userProfile?.role === 'merchant') {
      loadFavorites();
    }
  }, [userProfile, loadFavorites]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setUserProfile(null);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setShowProfileDropdown(false);
      setUserProfile(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getVehicleFilter = (vehicle: 'ebike' | 'scooter' | 'auto') => {
    switch (vehicle) {
      case 'ebike':
        return ['ebike', 'e_bike'];
      case 'scooter':
        return ['scooter', 'scoter'];
      case 'auto':
        return ['auto'];
    }
  };

  const fetchRiders = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'rider');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError('Errore nel caricamento dei rider');
        setRiders([]);
        return;
      }

      const ridersWithDetails = [];
      for (const profile of profilesData || []) {
        const { data: detailsData } = await supabase
          .from('riders_details')
          .select(
            'bio, hourly_rate, vehicle_type, profile_picture_url, active_location'
          )
          .eq('profile_id', profile.id)
          .single();

        ridersWithDetails.push({
          id: profile.id,
          full_name: profile.full_name || 'Rider',
          avatar_url: profile.avatar_url,
          bio: detailsData?.bio || null,
          hourly_rate: detailsData?.hourly_rate || 15,
          vehicle_type: detailsData?.vehicle_type || 'Veicolo',
          profile_picture_url: detailsData?.profile_picture_url || null,
          active_location: detailsData?.active_location || null,
        });
      }

      setRiders(ridersWithDetails);
    } catch (error) {
      console.error('Error fetching riders:', error);
      setError('Errore nel caricamento dei rider');
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = riders.filter(rider => {
    const searchFilter =
      searchTerm === '' ||
      rider.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rider.active_location &&
        rider.active_location.toLowerCase().includes(searchTerm.toLowerCase()));

    const vehicleFilter = getVehicleFilter(selectedVehicle).includes(
      rider.vehicle_type || ''
    );

    return searchFilter && vehicleFilter;
  });

  const displayedRiders = filteredRiders;

  // Funzione per aggiornare i preferiti (chiamata dalla pagina profilo)
  const refreshFavorites = () => {
    if (userProfile?.role === 'merchant') {
      loadFavorites();
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Top Navigation Bar - Fixed */}
      <div className='fixed top-0 left-0 right-0 z-40 bg-[#333366] border-b border-[#4a4a7a] shadow-md'>
        {/* Search Bar */}
        <div className='px-4 py-3'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300' />
              <input
                type='text'
                placeholder='Cerca per nome o per località...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 shadow-md'
              />
            </div>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm('')}
                variant='outline'
                size='icon'
                className='h-12 w-12 rounded-xl border-gray-300 hover:bg-gray-100'
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>

        <VehicleTabs
          selectedVehicle={selectedVehicle}
          onVehicleChange={setSelectedVehicle}
        />
      </div>

      {/* Main Content */}
      <div className='flex-1 pt-32 pb-20'>
        <div className='px-4'>
          {activeTab === 'riders' && (
            <RidersList riders={displayedRiders} loading={loading} />
          )}

          {activeTab === 'favorites' && userProfile?.role === 'merchant' && (
            <>
              {loadingFavorites ? (
                <div className='flex justify-center items-center py-12'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                </div>
              ) : favoriteRiders.length > 0 ? (
                <div>
                  <div className='mb-4'>
                    <h3 className='text-xl font-bold text-gray-900'>
                      Rider Preferiti ({favoriteRiders.length})
                    </h3>
                    <p className='text-gray-600'>
                      I tuoi rider fidati per future collaborazioni
                    </p>
                  </div>
                  <RidersList riders={favoriteRiders} loading={false} />
                </div>
              ) : (
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>❤️</div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>
                    Rider Preferiti
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    Clicca sul pulsante cuore nella pagina profilo di un rider
                    per aggiungerlo ai tuoi preferiti
                  </p>
                  <Button
                    onClick={() => setActiveTab('riders')}
                    className='text-white'
                    style={{ backgroundColor: '#333366' }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.backgroundColor = '#4a4a7a')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.backgroundColor = '#333366')
                    }
                  >
                    Scopri nuovi rider
                  </Button>
                </div>
              )}
            </>
          )}

          {activeTab === 'favorites' && userProfile?.role !== 'merchant' && (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>🔒</div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>
                Funzione Riservata
              </h3>
              <p className='text-gray-600 mb-6'>
                La gestione dei preferiti è riservata agli esercenti
              </p>
              <Button
                onClick={() => setActiveTab('riders')}
                className='text-white'
                style={{ backgroundColor: '#333366' }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = '#4a4a7a')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = '#333366')
                }
              >
                Torna alla ricerca
              </Button>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>🚧</div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>
                Funzione in Sviluppo
              </h3>
              <p className='text-gray-600 mb-6'>
                Il sistema di messaggistica sarà disponibile a breve
              </p>
              <Button
                onClick={() => setActiveTab('riders')}
                className='text-white'
                style={{ backgroundColor: '#333366' }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = '#4a4a7a')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = '#333366')
                }
              >
                Torna alla ricerca
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar - Fixed */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userProfile?.role || null}
        showProfileDropdown={showProfileDropdown}
        onProfileDropdownToggle={() =>
          setShowProfileDropdown(!showProfileDropdown)
        }
        userProfile={userProfile}
        onLogout={handleLogout}
      />
    </div>
  );
}
