// Costanti del sistema BeMyRider
export const SYSTEM_CONSTANTS = {
  // Tariffa massima del rider (€)
  MAX_RIDER_HOURLY_RATE: 12.5,

  // Ore di prenotazione massima
  MAX_BOOKING_HOURS: 2,

  // Tariffa minima del rider (€)
  MIN_RIDER_HOURLY_RATE: 5,

  // Ore di prenotazione minima
  MIN_BOOKING_HOURS: 1,
} as const;

// Tipi derivati dalle costanti
export type RiderHourlyRate = number;
export type BookingHours = number;

// Funzioni di validazione
export const validateRiderHourlyRate = (rate: number): boolean => {
  return (
    rate >= SYSTEM_CONSTANTS.MIN_RIDER_HOURLY_RATE &&
    rate <= SYSTEM_CONSTANTS.MAX_RIDER_HOURLY_RATE
  );
};

export const validateBookingHours = (hours: number): boolean => {
  return (
    hours >= SYSTEM_CONSTANTS.MIN_BOOKING_HOURS &&
    hours <= SYSTEM_CONSTANTS.MAX_BOOKING_HOURS
  );
};

// Messaggi di errore
export const ERROR_MESSAGES = {
  INVALID_RIDER_RATE: `La tariffa oraria deve essere compresa tra €${SYSTEM_CONSTANTS.MIN_RIDER_HOURLY_RATE} e €${SYSTEM_CONSTANTS.MAX_RIDER_HOURLY_RATE}`,
  INVALID_BOOKING_HOURS: `Le ore di prenotazione devono essere comprese tra ${SYSTEM_CONSTANTS.MIN_BOOKING_HOURS} e ${SYSTEM_CONSTANTS.MAX_BOOKING_HOURS}`,
} as const;
