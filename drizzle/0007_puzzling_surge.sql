ALTER TABLE "esercenti" ADD COLUMN "profile_id" uuid;--> statement-breakpoint
ALTER TABLE "esercenti" ADD CONSTRAINT "esercenti_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "esercenti" ADD CONSTRAINT "esercenti_profile_id_unique" UNIQUE("profile_id");