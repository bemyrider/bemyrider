-- SAFE MIGRATION: Riders table refactoring
-- Step 1: Add new columns to riders_details

ALTER TABLE "riders_details" ADD COLUMN IF NOT EXISTS "first_name" varchar(100);
ALTER TABLE "riders_details" ADD COLUMN IF NOT EXISTS "last_name" varchar(100);
ALTER TABLE "riders_details" ADD COLUMN IF NOT EXISTS "vehicle_type" "VehicleType";
ALTER TABLE "riders_details" ADD COLUMN IF NOT EXISTS "profile_picture_url" varchar(255);

-- Step 2: Migrate data from riders to riders_details (if riders table exists and has data)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'riders' AND table_schema = 'public') THEN
        UPDATE "riders_details" 
        SET 
            "first_name" = r."first_name",
            "last_name" = r."last_name",
            "vehicle_type" = r."vehicle_type",
            "profile_picture_url" = r."profile_picture_url"
        FROM "riders" r 
        WHERE "riders_details"."profile_id" = r."id";
        
        RAISE NOTICE 'Data migrated from riders to riders_details';
    ELSE
        RAISE NOTICE 'Riders table does not exist, skipping data migration';
    END IF;
END $$;

-- Step 3: Update foreign key constraints to point to profiles instead of riders

-- disponibilita_riders
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'disponibilita_riders_rider_id_riders_id_fk') THEN
        ALTER TABLE "disponibilita_riders" DROP CONSTRAINT "disponibilita_riders_rider_id_riders_id_fk";
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'disponibilita_riders_rider_id_profiles_id_fk') THEN
        ALTER TABLE "disponibilita_riders" ADD CONSTRAINT "disponibilita_riders_rider_id_profiles_id_fk" 
        FOREIGN KEY ("rider_id") REFERENCES "profiles"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- prenotazioni
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'prenotazioni_rider_id_riders_id_fk') THEN
        ALTER TABLE "prenotazioni" DROP CONSTRAINT "prenotazioni_rider_id_riders_id_fk";
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'prenotazioni_rider_id_profiles_id_fk') THEN
        ALTER TABLE "prenotazioni" ADD CONSTRAINT "prenotazioni_rider_id_profiles_id_fk" 
        FOREIGN KEY ("rider_id") REFERENCES "profiles"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- recensioni
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'recensioni_rider_id_riders_id_fk') THEN
        ALTER TABLE "recensioni" DROP CONSTRAINT "recensioni_rider_id_riders_id_fk";
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'recensioni_rider_id_profiles_id_fk') THEN
        ALTER TABLE "recensioni" ADD CONSTRAINT "recensioni_rider_id_profiles_id_fk" 
        FOREIGN KEY ("rider_id") REFERENCES "profiles"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: Only drop riders table if it exists and all constraints are updated
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'riders' AND table_schema = 'public') THEN
        -- Verify all foreign keys are updated before dropping
        IF NOT EXISTS (
            SELECT FROM information_schema.table_constraints 
            WHERE constraint_name LIKE '%riders_id_fk' 
            AND table_schema = 'public'
        ) THEN
            DROP TABLE "riders" CASCADE;
            RAISE NOTICE 'Riders table dropped successfully';
        ELSE
            RAISE NOTICE 'Warning: Some foreign keys still reference riders table. Table not dropped.';
        END IF;
    ELSE
        RAISE NOTICE 'Riders table already dropped or does not exist';
    END IF;
END $$;
