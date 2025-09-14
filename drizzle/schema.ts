import {
  pgTable,
  foreignKey,
  uuid,
  timestamp,
  numeric,
  unique,
  integer,
  text,
  time,
  varchar,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const dayOfWeek = pgEnum('DayOfWeek', [
  'Lun',
  'Mar',
  'Mer',
  'Gio',
  'Ven',
  'Sab',
  'Dom',
]);
export const paymentStatus = pgEnum('PaymentStatus', [
  'in_attesa',
  'pagato',
  'rimborsato',
]);
export const serviceRequestStatus = pgEnum('ServiceRequestStatus', [
  'pending',
  'accepted',
  'rejected',
  'expired',
  'booked',
  'in_progress',
  'completed',
  'cancelled',
]);
export const status = pgEnum('Status', [
  'in_attesa',
  'confermata',
  'in_corso',
  'completata',
  'annullata',
]);
export const vehicleType = pgEnum('VehicleType', [
  'bici',
  'e_bike',
  'scooter',
  'auto',
]);

export const prenotazioni = pgTable(
  'prenotazioni',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    esercenteId: uuid('esercente_id').notNull(),
    riderId: uuid('rider_id').notNull(),
    startTime: timestamp('start_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    endTime: timestamp('end_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    serviceDurationHours: numeric('service_duration_hours', {
      precision: 5,
      scale: 2,
    }).notNull(),
    grossAmount: numeric('gross_amount', { precision: 10, scale: 2 }).notNull(),
    taxWithholdingAmount: numeric('tax_withholding_amount', {
      precision: 10,
      scale: 2,
    }),
    netAmount: numeric('net_amount', { precision: 10, scale: 2 }).notNull(),
    status: status().notNull(),
    paymentStatus: paymentStatus('payment_status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.esercenteId],
      foreignColumns: [esercenti.id],
      name: 'prenotazioni_esercente_id_esercenti_id_fk',
    }),
    foreignKey({
      columns: [table.riderId],
      foreignColumns: [profiles.id],
      name: 'prenotazioni_rider_id_profiles_id_fk',
    }),
  ]
);

export const recensioni = pgTable(
  'recensioni',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    prenotazioneId: uuid('prenotazione_id').notNull(),
    esercenteId: uuid('esercente_id').notNull(),
    riderId: uuid('rider_id').notNull(),
    rating: integer().notNull(),
    comment: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.esercenteId],
      foreignColumns: [esercenti.id],
      name: 'recensioni_esercente_id_esercenti_id_fk',
    }),
    foreignKey({
      columns: [table.prenotazioneId],
      foreignColumns: [prenotazioni.id],
      name: 'recensioni_prenotazione_id_prenotazioni_id_fk',
    }),
    foreignKey({
      columns: [table.riderId],
      foreignColumns: [profiles.id],
      name: 'recensioni_rider_id_profiles_id_fk',
    }),
    unique('recensioni_prenotazione_id_unique').on(table.prenotazioneId),
  ]
);

export const serviceRequests = pgTable(
  'service_requests',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    merchantId: uuid('merchant_id').notNull(),
    riderId: uuid('rider_id').notNull(),
    requestedDate: timestamp('requested_date', { mode: 'string' }).notNull(),
    startTime: time('start_time').notNull(),
    durationHours: numeric('duration_hours', {
      precision: 5,
      scale: 2,
    }).notNull(),
    description: text(),
    merchantAddress: text('merchant_address').notNull(),
    status: serviceRequestStatus().default('pending').notNull(),
    riderResponse: text('rider_response'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.merchantId],
      foreignColumns: [profiles.id],
      name: 'service_requests_merchant_id_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.riderId],
      foreignColumns: [profiles.id],
      name: 'service_requests_rider_id_profiles_id_fk',
    }),
  ]
);

export const ridersDetails = pgTable(
  'riders_details',
  {
    profileId: uuid('profile_id').primaryKey().notNull(),
    vehicleType: vehicleType('vehicle_type'),
    profilePictureUrl: varchar('profile_picture_url', { length: 255 }),
    bio: text(),
    hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }).notNull(),
    activeLocation: varchar('active_location', { length: 100 })
      .default('Non specificata')
      .notNull(),
    experienceYears: integer('experience_years'),
    specializations: text().array(),
    completedJobs: integer('completed_jobs').default(0),
    rating: numeric({ precision: 3, scale: 2 }),
    responseTime: varchar('response_time', { length: 20 }),
    isVerified: boolean('is_verified').default(false),
    isPremium: boolean('is_premium').default(false),
    stripeAccountId: text('stripe_account_id'),
    stripeOnboardingComplete: boolean('stripe_onboarding_complete').default(
      false
    ),
    portfolioImages: text('portfolio_images').array().default(['']),
    certifications: text().array().default(['']),
    portfolioUrl: text('portfolio_url'),
    servicesDescription: text('services_description'),
    portfolioUpdatedAt: timestamp('portfolio_updated_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
      name: 'riders_details_profile_id_profiles_id_fk',
    }),
  ]
);

export const riderTaxDetails = pgTable(
  'rider_tax_details',
  {
    riderId: uuid('rider_id').primaryKey().notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    fiscalCode: varchar('fiscal_code', { length: 50 }),
    birthPlace: varchar('birth_place', { length: 100 }),
    birthDate: timestamp('birth_date', { mode: 'string' }),
    residenceAddress: varchar('residence_address', { length: 255 }),
    residenceCity: varchar('residence_city', { length: 100 }),
  },
  table => [
    foreignKey({
      columns: [table.riderId],
      foreignColumns: [profiles.id],
      name: 'rider_tax_details_rider_id_profiles_id_fk',
    }),
  ]
);

export const esercenti = pgTable(
  'esercenti',
  {
    id: uuid().primaryKey().notNull(),
    businessName: varchar('business_name', { length: 255 }).notNull(),
    address: varchar({ length: 255 }),
    city: varchar({ length: 100 }),
    phoneNumber: varchar('phone_number', { length: 20 }),
    description: text(),
    profilePictureUrl: varchar('profile_picture_url', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    profileId: uuid('profile_id'),
  },
  table => [
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
      name: 'esercenti_profile_id_profiles_id_fk',
    }),
    unique('esercenti_profile_id_unique').on(table.profileId),
  ]
);

export const profiles = pgTable('profiles', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: text().notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

export const merchantFavorites = pgTable(
  'merchant_favorites',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    merchantId: uuid('merchant_id').notNull(),
    riderId: uuid('rider_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.merchantId],
      foreignColumns: [profiles.id],
      name: 'merchant_favorites_merchant_id_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.riderId],
      foreignColumns: [profiles.id],
      name: 'merchant_favorites_rider_id_profiles_id_fk',
    }),
  ]
);

export const occasionalPerformanceReceipts = pgTable(
  'occasional_performance_receipts',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    prenotazioneId: uuid('prenotazione_id').notNull(),
    receiptNumber: integer('receipt_number').notNull(),
    receiptDate: timestamp('receipt_date', { mode: 'string' }).notNull(),
  },
  table => [
    foreignKey({
      columns: [table.prenotazioneId],
      foreignColumns: [prenotazioni.id],
      name: 'occasional_performance_receipts_prenotazione_id_prenotazioni_id',
    }),
    unique('occasional_performance_receipts_prenotazione_id_unique').on(
      table.prenotazioneId
    ),
  ]
);

export const disponibilitaRiders = pgTable(
  'disponibilita_riders',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    riderId: uuid('rider_id').notNull(),
    dayOfWeek: dayOfWeek('day_of_week').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
  },
  table => [
    foreignKey({
      columns: [table.riderId],
      foreignColumns: [profiles.id],
      name: 'disponibilita_riders_rider_id_profiles_id_fk',
    }),
  ]
);

export const esercenteTaxDetails = pgTable(
  'esercente_tax_details',
  {
    esercenteId: uuid('esercente_id').primaryKey().notNull(),
    companyName: varchar('company_name', { length: 255 }),
    vatNumber: varchar('vat_number', { length: 50 }),
    address: varchar({ length: 255 }),
    city: varchar({ length: 100 }),
  },
  table => [
    foreignKey({
      columns: [table.esercenteId],
      foreignColumns: [esercenti.id],
      name: 'esercente_tax_details_esercente_id_esercenti_id_fk',
    }),
  ]
);
