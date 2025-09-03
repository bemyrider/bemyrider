-- Step 1: Add columns to riders_details
ALTER TABLE "riders_details" ADD COLUMN IF NOT EXISTS "first_name" varchar(100);
ALTER TABLE "riders_details" ADD COLUMN IF NOT EXISTS "last_name" varchar(100);
ALTER TABLE "riders_details" ADD COLUMN IF NOT EXISTS "vehicle_type" "VehicleType";
ALTER TABLE "riders_details" ADD COLUMN IF NOT EXISTS "profile_picture_url" varchar(255);
