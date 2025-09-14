ALTER TYPE "public"."ServiceRequestStatus" ADD VALUE 'booked';--> statement-breakpoint
ALTER TYPE "public"."ServiceRequestStatus" ADD VALUE 'in_progress';--> statement-breakpoint
ALTER TYPE "public"."ServiceRequestStatus" ADD VALUE 'completed';--> statement-breakpoint
ALTER TYPE "public"."ServiceRequestStatus" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "portfolio_images" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "certifications" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "portfolio_url" text;--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "services_description" text;--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "portfolio_updated_at" timestamp with time zone DEFAULT now();