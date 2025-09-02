-- Migration: Add active_location column to riders_details
-- Date: Generated for active location support

-- Add the active_location column
ALTER TABLE "riders_details" ADD COLUMN "active_location" varchar(100) DEFAULT 'Non specificata' NOT NULL;

-- Update existing records with a default location
UPDATE "riders_details" SET "active_location" = 'Milano' WHERE "active_location" = 'Non specificata';

-- Create index for performance in location-based searches
CREATE INDEX "idx_riders_details_active_location" ON "riders_details" ("active_location");

-- Add comment for documentation
COMMENT ON COLUMN "riders_details"."active_location" IS 'Città o località dove il rider è attivo per le consegne';
