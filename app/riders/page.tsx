'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Clock,
  Euro,
  Search,
  Filter,
  MapPin,
  Grid,
  Map,
  Star,
  MessageCircle,
  Eye,
  X,
  HeartHandshake,
  User,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { UserNav } from '@/components/UserNav';

interface Rider {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  hourly_rate: number;
  vehicle_type: string | null;
  profile_picture_url: string | null;
  active_location: string | null;
  // Nuove proprietà per design professionale
  experience_years?: number;
  specializations?: string[];
  completed_jobs?: number;
  rating?: number;
  response_time?: string;
  is_verified?: boolean;
  is_premium?: boolean;
}

// Mock data for demonstration with professional features
const mockRiders: Rider[] = [
  {
    id: '1',
    full_name: 'Marco Rossi',
    avatar_url: null,
    bio: 'Rider professionista con 5 anni di esperienza nelle consegne urbane. Specializzato in consegne rapide e affidabili nel centro città.',
    hourly_rate: 8.5,
    vehicle_type: 'bici',
    profile_picture_url: null,
    active_location: 'Milano',
    experience_years: 5,
    specializations: [
      'Consegne rapide',
      'Centro città',
      'Documenti importanti',
    ],
    completed_jobs: 1247,
    rating: 4.8,
    response_time: '< 5 min',
    is_verified: true,
    is_premium: true,
  },
  {
    id: '2',
    full_name: 'Giulia Bianchi',
    avatar_url: null,
    bio: 'Specializzata in consegne di prodotti freschi e farmaceutici. Sempre puntuale e professionale.',
    hourly_rate: 12,
    vehicle_type: 'scooter',
    profile_picture_url: null,
    active_location: 'Milano',
    experience_years: 3,
    specializations: ['Prodotti freschi', 'Farmaceutici', 'Consegne urgenti'],
    completed_jobs: 856,
    rating: 4.9,
    response_time: '< 3 min',
    is_verified: true,
    is_premium: false,
  },
  {
    id: '3',
    full_name: 'Luca Verdi',
    avatar_url: null,
    bio: 'Rider affidabile per consegne pesanti e di grandi dimensioni. Disponibile anche nei weekend.',
    hourly_rate: 10,
    vehicle_type: 'auto',
    profile_picture_url: null,
    active_location: 'Torino',
    experience_years: 7,
    specializations: ['Consegne pesanti', 'Weekend', 'Extra-urbane'],
    completed_jobs: 2156,
    rating: 4.7,
    response_time: '< 10 min',
    is_verified: true,
    is_premium: false,
  },
];

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<
    'ebike' | 'scooter' | 'auto'
  >('ebike');
  const [activeTab, setActiveTab] = useState<
    'riders' | 'favorites' | 'messages'
  >('riders');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    role: 'merchant' | 'rider' | null;
    full_name: string;
  } | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRiders();
    fetchUserProfile();
  }, []);

  // Click outside handler per il dropdown profilo
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
      // Redirect alla home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleFavorite = (riderId: string) => {
    setFavorites(prev =>
      prev.includes(riderId)
        ? prev.filter(id => id !== riderId)
        : [...prev, riderId]
    );
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
      // Check if Supabase is properly configured
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL ===
        'https://placeholder.supabase.co'
      ) {
        // Use mock data for demonstration
        setRiders(mockRiders);
        setLoading(false);
        return;
      }

      // Usa query separata più robusta invece di LEFT JOIN che può causare problemi
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'rider');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError('Errore nel caricamento dei rider');
        setRiders(mockRiders);
        return;
      }

      // Fetch rider details separatamente per ogni rider
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
      console.error('Error:', error);
      setError('Errore nel caricamento dei rider');
      // Fallback to mock data
      setRiders(mockRiders);
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = riders.filter(rider => {
    // Filtro ricerca (nome + località)
    const searchFilter =
      searchTerm === '' ||
      rider.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rider.active_location &&
        rider.active_location.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro veicolo
    const vehicleFilter = getVehicleFilter(selectedVehicle).includes(
      rider.vehicle_type || ''
    );

    return searchFilter && vehicleFilter;
  });

  const displayedRiders =
    activeTab === 'favorites'
      ? filteredRiders.filter(rider => favorites.includes(rider.id))
      : filteredRiders;

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Top Navigation Bar - Fixed */}
      <div className='fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
        {/* Search Bar */}
        <div className='px-4 py-3'>
          <div className='relative'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#333366'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5'
            >
              <path d='m21 21-4.34-4.34' />
              <circle cx='11' cy='11' r='8' />
            </svg>
            <input
              type='text'
              placeholder='Cerca rider a Milano...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500'
            />
          </div>
        </div>

        {/* Vehicle Tabs */}
        <div className='px-4 pb-3'>
          <div className='flex space-x-2'>
            <button
              onClick={() => setSelectedVehicle('ebike')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                selectedVehicle === 'ebike'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={
                selectedVehicle === 'ebike'
                  ? { backgroundColor: '#333366' }
                  : {}
              }
            >
              ⚡ E-bike
            </button>
            <button
              onClick={() => setSelectedVehicle('scooter')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                selectedVehicle === 'scooter'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={
                selectedVehicle === 'scooter'
                  ? { backgroundColor: '#333366' }
                  : {}
              }
            >
              🛵 Moto
            </button>
            <button
              onClick={() => setSelectedVehicle('auto')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                selectedVehicle === 'auto'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={
                selectedVehicle === 'auto' ? { backgroundColor: '#333366' } : {}
              }
            >
              🚗 Auto
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 pt-32 pb-20'>
        <div className='px-4'>
          {/* Content based on active tab */}
          {activeTab === 'riders' && (
            <>
              {/* Riders List */}
              {loading ? (
                <div className='flex justify-center items-center py-12'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                </div>
              ) : displayedRiders.length === 0 ? (
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>🔍</div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>
                    Nessun rider trovato
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    Prova a cercare in un'altra città
                  </p>
                  <div className='flex justify-center'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
                      <Image
                        src='/bemyrider_logo.svg'
                        alt='bemyrider'
                        width={40}
                        height={40}
                        className='w-10 h-10'
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {displayedRiders.map(rider => (
                    <Link key={rider.id} href={`/riders/${rider.id}`}>
                      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95'>
                        <div className='flex items-center space-x-4'>
                          {/* Profile Picture */}
                          <div className='relative'>
                            {rider.profile_picture_url || rider.avatar_url ? (
                              <Image
                                src={
                                  rider.profile_picture_url ||
                                  rider.avatar_url ||
                                  ''
                                }
                                alt={rider.full_name}
                                width={60}
                                height={60}
                                className='w-15 h-15 rounded-full object-cover'
                              />
                            ) : (
                              <div className='w-15 h-15 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center'>
                                <span className='text-lg font-bold text-white'>
                                  {rider.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {/* Online Status */}
                            <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full'></div>
                          </div>

                          {/* Rider Info */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h3 className='text-lg font-bold text-gray-900 truncate'>
                                {rider.full_name}
                              </h3>
                              {rider.is_verified && (
                                <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                  ✓
                                </span>
                              )}
                            </div>

                            <div className='flex items-center gap-1 mb-1'>
                              <Star className='h-4 w-4 text-yellow-400 fill-current' />
                              <span className='text-sm font-medium text-gray-900'>
                                {rider.rating || 4.5}
                              </span>
                              <span className='text-sm text-gray-500'>
                                ({rider.completed_jobs || 0})
                              </span>
                            </div>

                            <div className='flex items-center gap-1 text-sm text-gray-600'>
                              <MapPin className='h-3 w-3' />
                              <span className='truncate'>
                                {rider.active_location || 'Milano'}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className='text-right'>
                            <div className='text-xl font-bold text-gray-900'>
                              €{rider.hourly_rate}
                            </div>
                            <div className='text-xs text-gray-600'>/ora</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'favorites' && userProfile?.role === 'merchant' && (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='64'
                  height='64'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#333366'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='w-16 h-16 mx-auto'
                >
                  <path d='M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762' />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>
                Rider Preferiti
              </h3>
              <p className='text-gray-600 mb-6'>
                I tuoi rider preferiti appariranno qui
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
      <div className='fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg'>
        <div className='flex items-center justify-center px-4 py-1'>
          <div className='flex items-center justify-around w-full max-w-md'>
            {/* Ricerca */}
            <button
              onClick={() => setActiveTab('riders')}
              className={`flex flex-col items-center p-1.5 rounded-lg transition-colors ${
                activeTab === 'riders' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#333366'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-5 w-5'
              >
                <path d='m21 21-4.34-4.34' />
                <circle cx='11' cy='11' r='8' />
              </svg>
            </button>

            {/* Preferiti */}
            <button
              onClick={() => {
                if (userProfile?.role === 'merchant') {
                  setActiveTab('favorites');
                }
              }}
              className={`flex flex-col items-center p-1.5 rounded-lg transition-colors ${
                activeTab === 'favorites'
                  ? 'text-red-500'
                  : userProfile?.role === 'merchant'
                    ? 'text-gray-400 hover:text-gray-600'
                    : 'text-gray-300 cursor-not-allowed'
              }`}
              disabled={userProfile?.role !== 'merchant'}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#333366'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-5 w-5'
              >
                <path d='M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762' />
              </svg>
            </button>

            {/* BeMyRider */}
            <Link
              href={
                userProfile?.role === 'rider'
                  ? '/dashboard/rider'
                  : '/dashboard/merchant'
              }
            >
              <button
                className='flex flex-col items-center p-2 rounded-xl text-gray-700 shadow-lg transition-colors'
                style={{ backgroundColor: '#f5f5f5' }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = '#e5e5e5')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = '#f5f5f5')
                }
              >
                <div className='flex items-center justify-center w-7 h-7 bg-gray-300 bg-opacity-30 rounded-full'>
                  <Image
                    src='/bemyrider_logo.svg'
                    alt='bemyrider'
                    width={20}
                    height={20}
                    className='w-5 h-5'
                  />
                </div>
              </button>
            </Link>

            {/* Messaggi - Disabilitato per ora */}
            <button
              onClick={() => {
                /* Messaggi non ancora implementati */
              }}
              className='flex flex-col items-center p-1.5 rounded-lg transition-colors text-gray-300 cursor-not-allowed'
              disabled
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#333366'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-5 w-5'
              >
                <path d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719' />
              </svg>
            </button>

            {/* Profilo con dropdown */}
            <div className='relative' ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`flex flex-col items-center p-1.5 rounded-lg transition-colors ${
                  showProfileDropdown
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#333366'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5'
                >
                  <path d='M4 5h16' />
                  <path d='M4 12h16' />
                  <path d='M4 19h16' />
                </svg>
              </button>

              {showProfileDropdown && (
                <div className='absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                  <div className='py-2'>
                    <div className='px-4 py-2 text-sm text-gray-700 border-b border-gray-100'>
                      <p className='font-medium'>
                        {userProfile?.full_name || 'Utente'}
                      </p>
                      <p className='text-xs text-gray-500 capitalize'>
                        {userProfile?.role || 'Ospite'}
                      </p>
                    </div>

                    {userProfile?.role === 'merchant' && (
                      <Link href='/dashboard/merchant'>
                        <button
                          className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Dashboard
                        </button>
                      </Link>
                    )}

                    {userProfile?.role === 'rider' && (
                      <Link href='/dashboard/rider'>
                        <button
                          className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Dashboard Rider
                        </button>
                      </Link>
                    )}

                    <Link href='/profile'>
                      <button
                        className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Impostazioni
                      </button>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
