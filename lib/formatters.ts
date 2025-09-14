/**
 * Formatta la tariffa oraria in euro
 */
export function formatHourlyRate(rate: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rate);
}

/**
 * Formatta il nome della città
 */
export function formatCity(city: string): string {
  if (!city) return 'Città non specificata';

  // Capitalizza la prima lettera di ogni parola
  return city
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formatta la valuta in euro
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Formatta data e ora in formato italiano
 */
export function formatDateTime(dateTime: string | Date): string {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formatta solo la data in formato italiano
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Formatta solo l'ora
 */
export function formatTime(time: string | Date): string {
  const timeObj = typeof time === 'string' ? new Date(time) : time;

  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timeObj);
}

/**
 * Calcola la durata tra due date in ore
 */
export function calculateHours(
  startTime: string | Date,
  endTime: string | Date
): number {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Arrotonda a 2 decimali
}

/**
 * Formatta il nome completo
 */
export function formatFullName(firstName: string, lastName?: string): string {
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
}

/**
 * Ottieni le iniziali dal nome completo
 */
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2); // Massimo 2 iniziali
}

/**
 * Formatta il tipo di trasporto in formato leggibile
 */
export function formatTransportationType(type: string): string {
  const typeMap: { [key: string]: string } = {
    bike: 'Bicicletta',
    scooter: 'Scooter',
    car: 'Auto',
    motorbike: 'Moto',
    walking: 'A piedi',
  };

  return typeMap[type] || type;
}
