-- REFACTORING: Eliminazione tabella riders e consolidamento in riders_details
-- Step 1: Aggiungiamo i campi necessari a riders_details

-- Aggiungi le colonne mancanti da riders
ALTER TABLE riders_details 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100), 
ADD COLUMN IF NOT EXISTS vehicle_type VehicleType,
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(255);

-- Step 2: Migrazione dati da riders a riders_details (se esistono dati)
UPDATE riders_details 
SET 
  first_name = r.first_name,
  last_name = r.last_name, 
  vehicle_type = r.vehicle_type,
  profile_picture_url = r.profile_picture_url
FROM riders r 
WHERE riders_details.profile_id = r.id;

-- Step 3: Aggiorna foreign keys per puntare a profiles.id invece di riders.id

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

-- Step 4: Elimina la tabella riders (dopo aver verificato che tutto funzioni)
-- DROP TABLE IF EXISTS riders CASCADE;

-- Nota: Eseguire DROP TABLE solo dopo aver testato che tutto funzioni correttamente!
