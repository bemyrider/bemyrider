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
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            selectedVehicle === 'ebike'
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={
            selectedVehicle === 'ebike' ? { backgroundColor: '#ff9900' } : {}
          }
        >
          <span className={selectedVehicle === 'ebike' ? 'text-white' : ''}>⚡</span> E-bike
        </button>
        <button
          onClick={() => onVehicleChange('scooter')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            selectedVehicle === 'scooter'
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={
            selectedVehicle === 'scooter' ? { backgroundColor: '#ff9900' } : {}
          }
        >
          <span className={selectedVehicle === 'scooter' ? 'text-white' : ''}>🛵</span> Moto
        </button>
        <button
          onClick={() => onVehicleChange('auto')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            selectedVehicle === 'auto'
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={
            selectedVehicle === 'auto' ? { backgroundColor: '#ff9900' } : {}
          }
        >
          <span className={selectedVehicle === 'auto' ? 'text-white' : ''}>🚗</span> Auto
        </button>
      </div>
    </div>
  );
}
