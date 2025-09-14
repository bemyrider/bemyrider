import { relations } from "drizzle-orm/relations";
import { esercenti, prenotazioni, profiles, recensioni, serviceRequests, ridersDetails, riderTaxDetails, merchantFavorites, occasionalPerformanceReceipts, disponibilitaRiders, esercenteTaxDetails } from "./schema";

export const prenotazioniRelations = relations(prenotazioni, ({one, many}) => ({
	esercenti: one(esercenti, {
		fields: [prenotazioni.esercenteId],
		references: [esercenti.id]
	}),
	profile: one(profiles, {
		fields: [prenotazioni.riderId],
		references: [profiles.id]
	}),
	recensionis: many(recensioni),
	occasionalPerformanceReceipts: many(occasionalPerformanceReceipts),
}));

export const esercentiRelations = relations(esercenti, ({one, many}) => ({
	prenotazionis: many(prenotazioni),
	recensionis: many(recensioni),
	profile: one(profiles, {
		fields: [esercenti.profileId],
		references: [profiles.id]
	}),
	esercenteTaxDetails: many(esercenteTaxDetails),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	prenotazionis: many(prenotazioni),
	recensionis: many(recensioni),
	serviceRequests_merchantId: many(serviceRequests, {
		relationName: "serviceRequests_merchantId_profiles_id"
	}),
	serviceRequests_riderId: many(serviceRequests, {
		relationName: "serviceRequests_riderId_profiles_id"
	}),
	ridersDetails: many(ridersDetails),
	riderTaxDetails: many(riderTaxDetails),
	esercentis: many(esercenti),
	merchantFavorites_merchantId: many(merchantFavorites, {
		relationName: "merchantFavorites_merchantId_profiles_id"
	}),
	merchantFavorites_riderId: many(merchantFavorites, {
		relationName: "merchantFavorites_riderId_profiles_id"
	}),
	disponibilitaRiders: many(disponibilitaRiders),
}));

export const recensioniRelations = relations(recensioni, ({one}) => ({
	esercenti: one(esercenti, {
		fields: [recensioni.esercenteId],
		references: [esercenti.id]
	}),
	prenotazioni: one(prenotazioni, {
		fields: [recensioni.prenotazioneId],
		references: [prenotazioni.id]
	}),
	profile: one(profiles, {
		fields: [recensioni.riderId],
		references: [profiles.id]
	}),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({one}) => ({
	profile_merchantId: one(profiles, {
		fields: [serviceRequests.merchantId],
		references: [profiles.id],
		relationName: "serviceRequests_merchantId_profiles_id"
	}),
	profile_riderId: one(profiles, {
		fields: [serviceRequests.riderId],
		references: [profiles.id],
		relationName: "serviceRequests_riderId_profiles_id"
	}),
}));

export const ridersDetailsRelations = relations(ridersDetails, ({one}) => ({
	profile: one(profiles, {
		fields: [ridersDetails.profileId],
		references: [profiles.id]
	}),
}));

export const riderTaxDetailsRelations = relations(riderTaxDetails, ({one}) => ({
	profile: one(profiles, {
		fields: [riderTaxDetails.riderId],
		references: [profiles.id]
	}),
}));

export const merchantFavoritesRelations = relations(merchantFavorites, ({one}) => ({
	profile_merchantId: one(profiles, {
		fields: [merchantFavorites.merchantId],
		references: [profiles.id],
		relationName: "merchantFavorites_merchantId_profiles_id"
	}),
	profile_riderId: one(profiles, {
		fields: [merchantFavorites.riderId],
		references: [profiles.id],
		relationName: "merchantFavorites_riderId_profiles_id"
	}),
}));

export const occasionalPerformanceReceiptsRelations = relations(occasionalPerformanceReceipts, ({one}) => ({
	prenotazioni: one(prenotazioni, {
		fields: [occasionalPerformanceReceipts.prenotazioneId],
		references: [prenotazioni.id]
	}),
}));

export const disponibilitaRidersRelations = relations(disponibilitaRiders, ({one}) => ({
	profile: one(profiles, {
		fields: [disponibilitaRiders.riderId],
		references: [profiles.id]
	}),
}));

export const esercenteTaxDetailsRelations = relations(esercenteTaxDetails, ({one}) => ({
	esercenti: one(esercenti, {
		fields: [esercenteTaxDetails.esercenteId],
		references: [esercenti.id]
	}),
}));