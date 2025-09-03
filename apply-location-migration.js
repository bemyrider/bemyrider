/**
 * Script per applicare la migrazione active_location
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili ambiente mancanti!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 Applicazione migrazione active_location...');
  
  try {
    // Prima verifica se la colonna esiste già
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'riders_details')
      .eq('column_name', 'active_location');
    
    if (schemaError) {
      console.log('⚠️ Non posso verificare schema, procedo con la migrazione...');
    }
    
    if (columns && columns.length > 0) {
      console.log('✅ Colonna active_location già esistente');
    } else {
      console.log('📝 La colonna non esiste, deve essere aggiunta manualmente');
    }
    
    // Proviamo ad aggiornare i record esistenti con valore di default
    console.log('🔄 Aggiornamento record esistenti...');
    
    const { data: riders, error: fetchError } = await supabase
      .from('riders_details')
      .select('profile_id');
    
    if (fetchError) {
      console.error('❌ Errore lettura riders:', fetchError.message);
      return;
    }
    
    console.log(`📊 Trovati ${riders?.length || 0} rider nel database`);
    
    // Se la colonna esiste, aggiorna i record
    if (riders && riders.length > 0) {
      const { error: updateError } = await supabase
        .from('riders_details')
        .update({ active_location: 'Milano' })
        .neq('profile_id', '00000000-0000-0000-0000-000000000000'); // Update all
      
      if (updateError && !updateError.message.includes('column "active_location" of relation "riders_details" does not exist')) {
        console.error('❌ Errore aggiornamento:', updateError.message);
      } else if (!updateError) {
        console.log('✅ Record aggiornati con località di default!');
      }
    }
    
  } catch (error) {
    console.error('💥 Errore generale:', error.message);
  }
}

applyMigration()
  .then(() => {
    console.log('\n📋 ISTRUZIONI MANUALI:');
    console.log('=====================================');
    console.log('1. Apri il SQL Editor di Supabase');
    console.log('2. Esegui questo comando:');
    console.log('');
    console.log('ALTER TABLE riders_details ADD COLUMN active_location VARCHAR(100) DEFAULT \'Milano\' NOT NULL;');
    console.log('');
    console.log('3. Poi esegui:');
    console.log('CREATE INDEX idx_riders_details_active_location ON riders_details(active_location);');
    console.log('');
    console.log('4. Ri-esegui questo script per aggiornare i dati');
    console.log('=====================================');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Errore fatale:', error);
    process.exit(1);
  });
