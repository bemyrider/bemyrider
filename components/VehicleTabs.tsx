import { Zap } from 'lucide-react';

interface VehicleTabsProps {
  selectedVehicle: 'ebike' | 'scooter' | 'auto';
  onVehicleChange: (vehicle: 'ebike' | 'scooter' | 'auto') => void;
}

export function VehicleTabs({
  selectedVehicle,
  onVehicleChange,
}: VehicleTabsProps) {
  return (
    <div className='px-4 pb-3'>
      <div className='flex space-x-2'>
        <button
          onClick={() => onVehicleChange('ebike')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors items-center ${
            selectedVehicle === 'ebike'
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={
            selectedVehicle === 'ebike' ? { backgroundColor: '#ff9900' } : {}
          }
        >
          {selectedVehicle === 'ebike' ? (
            <Zap className='h-4 w-4 text-white inline self-center' />
          ) : (
            <span>⚡</span>
          )}{' '}
          E-bike
        </button>
        <button
          onClick={() => onVehicleChange('scooter')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors items-center ${
            selectedVehicle === 'scooter'
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={
            selectedVehicle === 'scooter' ? { backgroundColor: '#ff9900' } : {}
          }
        >
          {selectedVehicle === 'scooter' ? (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='white'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='inline self-center'
            >
              <circle cx='18.5' cy='17.5' r='3.5' />
              <circle cx='5.5' cy='17.5' r='3.5' />
              <circle cx='15' cy='5' r='1' />
              <path d='M12 17.5V14l-3-3 4-3 2 3h2' />
            </svg>
          ) : (
            <span>🛵</span>
          )}{' '}
          Moto
        </button>
        <button
          onClick={() => onVehicleChange('auto')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors items-center ${
            selectedVehicle === 'auto'
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={
            selectedVehicle === 'auto' ? { backgroundColor: '#ff9900' } : {}
          }
        >
          {selectedVehicle === 'auto' ? (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='white'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='inline self-center'
            >
              <path d='M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2' />
              <circle cx='7' cy='17' r='2' />
              <path d='M9 17h6' />
              <circle cx='17' cy='17' r='2' />
            </svg>
          ) : (
            <span>🚗</span>
          )}{' '}
          Auto
        </button>
      </div>
    </div>
  );
}
