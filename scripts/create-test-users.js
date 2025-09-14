/**
 * Script per creare account di test per Playwright
 * Uso: node scripts/create-test-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configurazione
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Errore: Variabili ambiente mancanti!');
  console.log(
    'Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
  process.exit(1);
}

// Client Supabase con privilegi admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Account di test da creare
const TEST_ACCOUNTS = [
  {
    email: 'test.rider@bemyrider.test',
    password: 'TestRider2024!',
    fullName: 'Test Rider',
    role: 'rider',
  },
  {
    email: 'test.merchant@bemyrider.test',
    password: 'TestMerchant2024!',
    fullName: 'Test Merchant',
    role: 'merchant',
  },
];

async function createTestUser(userData) {
  console.log(`\n🔄 Creando utente: ${userData.email}...`);

  try {
    // 1. Crea l'utente in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Conferma email automaticamente
        user_metadata: {
          full_name: userData.fullName,
          role: userData.role,
        },
      });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`⚠️  Utente ${userData.email} già esiste`);
        return { success: true, existed: true };
      }
      throw authError;
    }

    console.log(`✅ Utente Auth creato: ${authData.user.id}`);

    // 2. Crea il profilo nella tabella profiles
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: userData.fullName,
      role: userData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.log(
        `⚠️  Errore profilo (potrebbe già esistere): ${profileError.message}`
      );
    } else {
      console.log(`✅ Profilo creato per: ${userData.email}`);
    }

    // 3. Se è un rider, crea il record in riders_details
    if (userData.role === 'rider') {
      const { error: riderError } = await supabase
        .from('riders_details')
        .upsert({
          profile_id: authData.user.id,
          hourly_rate: 15.0, // Tariffa di default per test
          vehicle_type: 'bici',
          description: 'Account di test per automazione Playwright',
          active_location: 'Milano', // Località di default per test
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (riderError) {
        console.log(`⚠️  Errore rider details: ${riderError.message}`);
      } else {
        console.log(`✅ Dettagli rider creati`);
      }
    }

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error(`❌ Errore creando ${userData.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function createAllTestUsers() {
  console.log('🚀 Iniziando creazione account di test...\n');

  const results = [];

  for (const userData of TEST_ACCOUNTS) {
    const result = await createTestUser(userData);
    results.push({ ...userData, ...result });
  }

  console.log('\n📊 Riepilogo:');
  console.log('================');

  results.forEach(result => {
    const status = result.success
      ? result.existed
        ? '🟡 Esisteva già'
        : '🟢 Creato'
      : '🔴 Errore';
    console.log(`${status} - ${result.email} (${result.role})`);
  });

  const successful = results.filter(r => r.success).length;
  console.log(`\n✅ ${successful}/${results.length} account pronti per test!`);

  if (successful > 0) {
    console.log('\n🎯 Credenziali per Playwright:');
    console.log('==============================');
    results
      .filter(r => r.success)
      .forEach(result => {
        console.log(
          `${result.role.toUpperCase()}: ${result.email} / ${TEST_ACCOUNTS.find(a => a.email === result.email).password}`
        );
      });
  }
}

// Esegui lo script
createAllTestUsers()
  .then(() => {
    console.log('\n🏁 Script completato!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Errore fatale:', error);
    process.exit(1);
  });
