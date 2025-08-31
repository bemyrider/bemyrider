-- Script SQL per correggere ruoli merchant in Supabase
-- Esegui questo nel SQL Editor di Supabase per correggere utenti esistenti

-- 1. Prima verifica quali utenti potrebbero essere merchant ma sono marcati come rider
SELECT 
  p.id,
  p.full_name,
  p.role,
  au.email,
  au.raw_user_meta_data->>'role' as intended_role
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.raw_user_meta_data->>'role' = 'merchant' 
  AND p.role = 'rider';

-- 2. Aggiorna i ruoli per correggere merchant che sono marcati come rider
UPDATE profiles 
SET 
  role = 'merchant',
  updated_at = NOW()
WHERE id IN (
  SELECT p.id
  FROM profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE au.raw_user_meta_data->>'role' = 'merchant' 
    AND p.role = 'rider'
);

-- 3. Verifica il trigger handle_new_user() per assicurarsi che funzioni correttamente
-- Se il trigger non funziona, puoi ricrearlo con questo comando:
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'rider') -- Default a 'rider' se non specificato
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Se vuoi verificare un utente specifico, sostituisci USER_ID_HERE con l'ID effettivo
-- SELECT 
--   p.id,
--   p.full_name,
--   p.role,
--   au.email,
--   au.raw_user_meta_data
-- FROM profiles p
-- JOIN auth.users au ON p.id = au.id
-- WHERE p.id = 'USER_ID_HERE';

-- 5. Per aggiornare manualmente un utente specifico a merchant:
-- UPDATE profiles 
-- SET role = 'merchant', updated_at = NOW()
-- WHERE id = 'USER_ID_HERE';
