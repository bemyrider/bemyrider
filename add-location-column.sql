-- Aggiunta colonna località geografica per i rider
-- Questa colonna è fondamentale per il filtro di ricerca geografica

-- Opzione 1: Aggiunta colonna semplice per città/località
ALTER TABLE public.riders_details 
ADD COLUMN active_location VARCHAR(100) NOT NULL DEFAULT 'Non specificata';

-- Opzione 2: Se vuoi essere più preciso con province/regioni
-- ALTER TABLE public.riders_details 
-- ADD COLUMN active_city VARCHAR(100) NOT NULL DEFAULT 'Non specificata',
-- ADD COLUMN active_province VARCHAR(10) NULL,
-- ADD COLUMN active_region VARCHAR(50) NULL;

-- Opzione 3: Se vuoi supportare coordinate GPS per ricerche avanzate
-- ALTER TABLE public.riders_details 
-- ADD COLUMN active_location VARCHAR(100) NOT NULL DEFAULT 'Non specificata',
-- ADD COLUMN latitude DECIMAL(10, 8) NULL,
-- ADD COLUMN longitude DECIMAL(11, 8) NULL;

-- Aggiorna i record esistenti con una località di default
UPDATE public.riders_details 
SET active_location = 'Milano' 
WHERE active_location = 'Non specificata';

-- Crea indice per performance nelle ricerche geografiche
CREATE INDEX idx_riders_details_active_location 
ON public.riders_details(active_location);

-- Commento sulla colonna
COMMENT ON COLUMN public.riders_details.active_location 
IS 'Città o località dove il rider è attivo per le consegne';
