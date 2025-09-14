CREATE TABLE "merchant_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL,
	"rider_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "experience_years" integer;--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "specializations" text[];--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "completed_jobs" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "rating" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "response_time" varchar(20);--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "is_premium" boolean DEFAULT false;