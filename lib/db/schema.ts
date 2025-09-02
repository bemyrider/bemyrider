import { pgTable, uuid, varchar, text, timestamp, decimal, boolean, integer, time, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const vehicleTypeEnum = pgEnum('VehicleType', ['bici', 'e_bike', 'scooter', 'auto']);
export const dayOfWeekEnum = pgEnum('DayOfWeek', ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']);
export const statusEnum = pgEnum('Status', ['in_attesa', 'confermata', 'in_corso', 'completata', 'annullata']);
export const paymentStatusEnum = pgEnum('PaymentStatus', ['in_attesa', 'pagato', 'rimborsato']);

// Profile table (compatible with existing Supabase schema)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name'), // Nullable to match existing
  avatarUrl: text('avatar_url'),
  role: text('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(), // Without timezone to match existing
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Esercenti table
export const esercenti = pgTable('esercenti', {
  id: uuid('id').primaryKey(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  description: text('description'),
  profilePictureUrl: varchar('profile_picture_url', { length: 255 }),
});

// Rider Details table (senza first_name e last_name - ora in rider_tax_details)
export const ridersDetails = pgTable('riders_details', {
  profileId: uuid('profile_id').primaryKey(),
  vehicleType: vehicleTypeEnum('vehicle_type'),
  profilePictureUrl: varchar('profile_picture_url', { length: 255 }),
  bio: text('bio'),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  activeLocation: varchar('active_location', { length: 100 }).notNull().default('Non specificata'), // Località dove il rider è attivo
  stripeAccountId: text('stripe_account_id'),
  stripeOnboardingComplete: boolean('stripe_onboarding_complete').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Disponibilita Riders table (ora punta a profiles)
export const disponibilitaRiders = pgTable('disponibilita_riders', {
  id: uuid('id').primaryKey().defaultRandom(),
  riderId: uuid('rider_id').notNull(), // Ora punta a profiles.id
  dayOfWeek: dayOfWeekEnum('day_of_week').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
});

// Prenotazioni table (ora rider_id punta a profiles)
export const prenotazioni = pgTable('prenotazioni', {
  id: uuid('id').primaryKey().defaultRandom(),
  esercenteId: uuid('esercente_id').notNull(),
  riderId: uuid('rider_id').notNull(), // Ora punta a profiles.id
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  serviceDurationHours: decimal('service_duration_hours', { precision: 5, scale: 2 }).notNull(),
  grossAmount: decimal('gross_amount', { precision: 10, scale: 2 }).notNull(),
  taxWithholdingAmount: decimal('tax_withholding_amount', { precision: 10, scale: 2 }),
  netAmount: decimal('net_amount', { precision: 10, scale: 2 }).notNull(),
  status: statusEnum('status').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Recensioni table (ora rider_id punta a profiles)
export const recensioni = pgTable('recensioni', {
  id: uuid('id').primaryKey().defaultRandom(),
  prenotazioneId: uuid('prenotazione_id').notNull().unique(),
  esercenteId: uuid('esercente_id').notNull(),
  riderId: uuid('rider_id').notNull(), // Ora punta a profiles.id
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Rider Tax Details table (ora include first_name e last_name)
export const riderTaxDetails = pgTable('rider_tax_details', {
  riderId: uuid('rider_id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  fiscalCode: varchar('fiscal_code', { length: 50 }),
  birthPlace: varchar('birth_place', { length: 100 }),
  birthDate: timestamp('birth_date', { mode: 'date' }),
  residenceAddress: varchar('residence_address', { length: 255 }),
  residenceCity: varchar('residence_city', { length: 100 }),
});

// Esercente Tax Details table
export const esercenteTaxDetails = pgTable('esercente_tax_details', {
  esercenteId: uuid('esercente_id').primaryKey(),
  companyName: varchar('company_name', { length: 255 }),
  vatNumber: varchar('vat_number', { length: 50 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 100 }),
});

// Occasional Performance Receipts table
export const occasionalPerformanceReceipts = pgTable('occasional_performance_receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  prenotazioneId: uuid('prenotazione_id').notNull().unique(),
  receiptNumber: integer('receipt_number').notNull(),
  receiptDate: timestamp('receipt_date', { mode: 'date' }).notNull(),
});

// Relations
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  esercente: one(esercenti, {
    fields: [profiles.id],
    references: [esercenti.id],
  }),
  riderDetail: one(ridersDetails, {
    fields: [profiles.id],
    references: [ridersDetails.profileId],
  }),
  // Direct relations dopo eliminazione tabella riders
  disponibilita: many(disponibilitaRiders),
  prenotazioni: many(prenotazioni),
  recensioni: many(recensioni),
}));

export const esercentiRelations = relations(esercenti, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [esercenti.id],
    references: [profiles.id],
  }),
  taxDetails: one(esercenteTaxDetails, {
    fields: [esercenti.id],
    references: [esercenteTaxDetails.esercenteId],
  }),
  prenotazioni: many(prenotazioni),
  recensioni: many(recensioni),
}));

// Relazioni riders rimosse - ora tutto punta direttamente a profiles

export const ridersDetailsRelations = relations(ridersDetails, ({ one }) => ({
  profile: one(profiles, {
    fields: [ridersDetails.profileId],
    references: [profiles.id],
  }),
}));

export const disponibilitaRidersRelations = relations(disponibilitaRiders, ({ one }) => ({
  profile: one(profiles, {
    fields: [disponibilitaRiders.riderId],
    references: [profiles.id],
  }),
}));

export const prenotazioniRelations = relations(prenotazioni, ({ one }) => ({
  esercente: one(esercenti, {
    fields: [prenotazioni.esercenteId],
    references: [esercenti.id],
  }),
  riderProfile: one(profiles, {
    fields: [prenotazioni.riderId],
    references: [profiles.id],
  }),
  recensione: one(recensioni, {
    fields: [prenotazioni.id],
    references: [recensioni.prenotazioneId],
  }),
  receipt: one(occasionalPerformanceReceipts, {
    fields: [prenotazioni.id],
    references: [occasionalPerformanceReceipts.prenotazioneId],
  }),
}));

export const recensioniRelations = relations(recensioni, ({ one }) => ({
  prenotazione: one(prenotazioni, {
    fields: [recensioni.prenotazioneId],
    references: [prenotazioni.id],
  }),
  esercente: one(esercenti, {
    fields: [recensioni.esercenteId],
    references: [esercenti.id],
  }),
  riderProfile: one(profiles, {
    fields: [recensioni.riderId],
    references: [profiles.id],
  }),
}));

export const riderTaxDetailsRelations = relations(riderTaxDetails, ({ one }) => ({
  profile: one(profiles, {
    fields: [riderTaxDetails.riderId],
    references: [profiles.id],
  }),
}));

export const esercenteTaxDetailsRelations = relations(esercenteTaxDetails, ({ one }) => ({
  esercente: one(esercenti, {
    fields: [esercenteTaxDetails.esercenteId],
    references: [esercenti.id],
  }),
}));

export const occasionalPerformanceReceiptsRelations = relations(occasionalPerformanceReceipts, ({ one }) => ({
  prenotazione: one(prenotazioni, {
    fields: [occasionalPerformanceReceipts.prenotazioneId],
    references: [prenotazioni.id],
  }),
}));
