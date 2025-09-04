export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum UserRole {
  RIDER = 'rider',
  MERCHANT = 'merchant',
}

export enum TransportationType {
  BIKE = 'bike',
  SCOOTER = 'scooter',
  CAR = 'car',
  MOTORBIKE = 'motorbike',
  WALKING = 'walking',
}

// Enum che rispecchia esattamente il database PostgreSQL
export enum VehicleType {
  BICI = 'bici',
  E_BIKE = 'e_bike',
  SCOOTER = 'scooter',
  AUTO = 'auto',
}

// Mapping per i label UI
export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  [VehicleType.BICI]: '🚲 Bicicletta',
  [VehicleType.E_BIKE]: '🚴‍♂️ E-Bike',
  [VehicleType.SCOOTER]: '🛵 Scooter',
  [VehicleType.AUTO]: '🚗 Auto',
};
