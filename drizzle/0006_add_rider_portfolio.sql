-- Add portfolio fields to riders_details table
-- This migration adds new columns to support rider portfolio functionality

-- Add portfolio images array (multiple image URLs)
ALTER TABLE "riders_details" ADD COLUMN "portfolio_images" text[] DEFAULT '{}'::text[];

-- Add certifications array (list of certifications)
ALTER TABLE "riders_details" ADD COLUMN "certifications" text[] DEFAULT '{}'::text[];

-- Add external portfolio URL
ALTER TABLE "riders_details" ADD COLUMN "portfolio_url" text;

-- Add detailed services description
ALTER TABLE "riders_details" ADD COLUMN "services_description" text;

-- Add updated_at timestamp for portfolio changes
ALTER TABLE "riders_details" ADD COLUMN "portfolio_updated_at" timestamp with time zone DEFAULT now();

-- Create indexes for performance on new fields
CREATE INDEX "idx_riders_details_portfolio_updated_at" ON "riders_details"("portfolio_updated_at");

-- Add comments for documentation
COMMENT ON COLUMN "riders_details"."portfolio_images" IS 'Array of portfolio image URLs for rider gallery';
COMMENT ON COLUMN "riders_details"."certifications" IS 'Array of rider certifications and qualifications';
COMMENT ON COLUMN "riders_details"."portfolio_url" IS 'External portfolio website URL';
COMMENT ON COLUMN "riders_details"."services_description" IS 'Detailed description of services offered by the rider';
