export interface RiderCardProps {
  rider: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    hourly_rate: number;
    active_location: string; // Località dove il rider è attivo
    rating: number;
    availability_status: 'available' | 'busy' | 'offline';
    transportation_method: 'ebike' | 'moto' | 'auto';
    total_deliveries: number;
    years_experience: number;
  };
  onBook: (riderId: string) => void;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'rider' | 'merchant';
  created_at: string;
  updated_at: string;
}

export interface RiderDetails {
  profile_id: string;
  bio: string | null;
  hourly_rate: number;
  active_location: string;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  rider_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface Booking {
  id: string;
  rider_id: string;
  merchant_id: string;
  start_time: string;
  end_time: string;
  rider_amount: number;
  platform_fee: number;
  total_amount: number;
  stripe_payment_intent_id: string;
  status: 'confermata' | 'completata' | 'cancellata';
  created_at: string;
}

export interface BookingWithDetails extends Booking {
  rider: Profile;
  merchant: Profile;
}

// Props per FilterControls component
export interface FilterControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  minRate: number | undefined;
  onMinRateChange: (rate: number | undefined) => void;
  maxRate: number | undefined;
  onMaxRateChange: (rate: number | undefined) => void;
  selectedCity: string | undefined;
  onCityChange: (city: string | undefined) => void;
  selectedTransportation: string | undefined;
  onTransportationChange: (type: string | undefined) => void;
  availableCities: string[];
  onReset: () => void;
}
