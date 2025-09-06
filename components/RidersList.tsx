import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';

interface Rider {
  id: string;
  full_name: string;
  avatar_url: string | null;
  profile_picture_url: string | null;
  active_location: string | null;
  hourly_rate: number;
  completed_jobs?: number;
  rating?: number;
  is_verified?: boolean;
}

interface RidersListProps {
  riders: Rider[];
  loading: boolean;
}

export function RidersList({ riders, loading }: RidersListProps) {
  if (loading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (riders.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>🔍</div>
        <h3 className='text-xl font-bold text-gray-900 mb-2'>
          Nessun rider trovato
        </h3>
        <p className='text-gray-600 mb-6'>Prova a cercare in un'altra città</p>
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
    );
  }

  return (
    <div className='space-y-4'>
      {riders.map(rider => (
        <Link key={rider.id} href={`/riders/${rider.id}`}>
          <div className='bg-white rounded-xl shadow-sm border-2 border-[#333366] p-4 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 my-1'>
            <div className='flex items-center space-x-4'>
              {/* Profile Picture */}
              <div>
                {rider.profile_picture_url || rider.avatar_url ? (
                  <Image
                    src={rider.profile_picture_url || rider.avatar_url || ''}
                    alt={rider.full_name}
                    width={60}
                    height={60}
                    className='w-15 h-15 rounded-lg object-cover'
                  />
                ) : (
                  <div className='w-15 h-15 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center'>
                    <span className='text-lg font-bold text-white'>
                      {rider.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
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
  );
}
