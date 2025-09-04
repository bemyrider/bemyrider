ALTER TABLE "riders_details" ADD COLUMN "experience_years" integer;--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "specializations" text[];--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "completed_jobs" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "rating" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "response_time" varchar(20);--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "is_premium" boolean DEFAULT false;