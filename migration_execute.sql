-- STEP 1: Aggiungere colonne a riders_details
ALTER TABLE riders_details 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100), 
ADD COLUMN IF NOT EXISTS vehicle_type VehicleType,
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(255);

-- STEP 2: Migrare dati (se esistono)
UPDATE riders_details 
SET 
  first_name = r.first_name,
  last_name = r.last_name, 
  vehicle_type = r.vehicle_type,
  profile_picture_url = r.profile_picture_url
FROM riders r 
WHERE riders_details.profile_id = r.id;

-- STEP 3: Aggiornare foreign keys

-- Disponibilita riders
ALTER TABLE disponibilita_riders 
DROP CONSTRAINT IF EXISTS disponibilita_riders_rider_id_riders_id_fk;

ALTER TABLE disponibilita_riders 
ADD CONSTRAINT disponibilita_riders_rider_id_profiles_id_fk 
FOREIGN KEY (rider_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Prenotazioni  
ALTER TABLE prenotazioni 
DROP CONSTRAINT IF EXISTS prenotazioni_rider_id_riders_id_fk;

ALTER TABLE prenotazioni 
ADD CONSTRAINT prenotazioni_rider_id_profiles_id_fk 
FOREIGN KEY (rider_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Recensioni
ALTER TABLE recensioni 
DROP CONSTRAINT IF EXISTS recensioni_rider_id_riders_id_fk;

ALTER TABLE recensioni 
ADD CONSTRAINT recensioni_rider_id_profiles_id_fk 
FOREIGN KEY (rider_id) REFERENCES profiles(id) ON DELETE CASCADE;
