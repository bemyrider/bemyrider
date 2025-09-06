import Link from 'next/link';
import Image from 'next/image';
import { HeartHandshake } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'riders' | 'favorites' | 'messages';
  onTabChange: (tab: 'riders' | 'favorites' | 'messages') => void;
  userRole: 'merchant' | 'rider' | null;
  showProfileDropdown: boolean;
  onProfileDropdownToggle: () => void;
  userProfile: {
    id: string;
    role: 'merchant' | 'rider' | null;
    full_name: string;
  } | null;
  onLogout: () => void;
}

export function BottomNavBar({
  activeTab,
  onTabChange,
  userRole,
  showProfileDropdown,
  onProfileDropdownToggle,
  userProfile,
  onLogout,
}: BottomNavBarProps) {
  return (
    <div className='fixed bottom-0 left-0 right-0 z-40 bg-gray-100 border-t border-gray-200 shadow-sm'>
      <div className='flex items-center justify-center px-4 py-2'>
        <div className='flex items-center justify-around w-full max-w-md'>
          {/* Ricerca */}
          <button
            onClick={() => onTabChange('riders')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === 'riders' ? 'text-[#333366]' : 'text-gray-400'
            }`}
          >
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              className='h-5 w-5'
            >
              <path d='m21 21-4.34-4.34' />
              <circle cx='11' cy='11' r='8' />
            </svg>
          </button>

          {/* Preferiti */}
          <button
            onClick={() => {
              if (userRole === 'merchant') {
                onTabChange('favorites');
              }
            }}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === 'favorites'
                ? 'text-[#333366]'
                : userRole === 'merchant'
                  ? 'text-gray-400 hover:text-gray-600'
                  : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={userRole !== 'merchant'}
          >
            <HeartHandshake className='h-5 w-5' />
          </button>

          {/* BeMyRider */}
          <Link
            href={
              userRole === 'rider' ? '/dashboard/rider' : '/dashboard/merchant'
            }
          >
            <button className='flex flex-col items-center p-2 rounded-xl text-gray-700 shadow-lg transition-colors'>
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

          {/* Messaggi - Disabilitato */}
          <button
            className='flex flex-col items-center p-2 rounded-lg transition-colors text-gray-300 cursor-not-allowed'
            disabled
          >
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              className='h-5 w-5'
            >
              <path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' />
            </svg>
          </button>

          {/* Profilo con dropdown */}
          <div className='relative'>
            <button
              onClick={onProfileDropdownToggle}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                showProfileDropdown
                  ? 'text-[#333366]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className='h-5 w-5'
              >
                <path d='M3 6h18' />
                <path d='M3 12h18' />
                <path d='M3 18h18' />
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
                      <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                        Dashboard
                      </button>
                    </Link>
                  )}

                  {userProfile?.role === 'rider' && (
                    <Link href='/dashboard/rider'>
                      <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                        Dashboard Rider
                      </button>
                    </Link>
                  )}

                  <Link href='/profile'>
                    <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                      Impostazioni
                    </button>
                  </Link>

                  <button
                    onClick={onLogout}
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
  );
}
