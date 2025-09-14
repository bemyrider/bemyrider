#!/usr/bin/env node

/**
 * Script per testare le nuove credenziali del database e Supabase
 * Verifica che le nuove chiavi funzionino correttamente
 */

const { createClient } = require('@supabase/supabase-js');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 TEST NUOVE CREDENZIALI\n');

// Test 1: Verifica che le variabili d'ambiente siano caricate
console.log("📋 1. VERIFICA VARIABILI D'AMBIENTE");
console.log('='.repeat(50));

const requiredEnvVars = [
  '***REMOVED***',
  'NEXT_PUBLIC_SUPABASE_URL',
  '***REMOVED***',
  'NEXT_PUBLIC_***REMOVED***',
];

let envCheckPassed = true;
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: NON TROVATA`);
    envCheckPassed = false;
  } else {
    console.log(`✅ ${envVar}: ${value.substring(0, 30)}...`);
  }
}

if (!envCheckPassed) {
  console.log("\n❌ TEST FALLITO: Variabili d'ambiente mancanti");
  process.exit(1);
}

console.log("\n✅ Variabili d'ambiente OK\n");

// Test 2: Test connessione database con Drizzle
console.log('🗄️ 2. TEST CONNESSIONE DATABASE');
console.log('='.repeat(50));

async function testDatabaseConnection() {
  try {
    console.log('🔌 Connessione al database...');

    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);

    // Test semplice: query per vedere se la connessione funziona
    const result = await client`SELECT 1 as test`;
    console.log('✅ Connessione database riuscita');
    console.log(`📊 Risultato test: ${result[0].test}`);

    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Errore connessione database:');
    console.log(`   ${error.message}`);
    return false;
  }
}

// Test 3: Test connessione Supabase
console.log('\n🔗 3. TEST CONNESSIONE SUPABASE');
console.log('='.repeat(50));

async function testSupabaseConnection() {
  try {
    console.log('🔌 Connessione a Supabase...');

    // Usa la service role key per i test amministrativi
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test semplice: ottieni informazioni sul progetto
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log('⚠️ Errore autenticazione (potrebbe essere normale):');
      console.log(`   ${error.message}`);

      // Proviamo un'altra query semplice
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (testError) {
        console.log('❌ Errore query database Supabase:');
        console.log(`   ${testError.message}`);
        return false;
      } else {
        console.log('✅ Query Supabase riuscita (lettura permessa)');
        return true;
      }
    } else {
      console.log('✅ Connessione Supabase riuscita');
      return true;
    }
  } catch (error) {
    console.log('❌ Errore connessione Supabase:');
    console.log(`   ${error.message}`);
    return false;
  }
}

// Esegui tutti i test
async function runAllTests() {
  const dbResult = await testDatabaseConnection();
  console.log('\n' + '='.repeat(50));

  const supabaseResult = await testSupabaseConnection();
  console.log('\n' + '='.repeat(50));

  // Risultato finale
  console.log('\n🏁 RISULTATO FINALE');
  console.log('='.repeat(50));

  if (dbResult && supabaseResult) {
    console.log('🎉 TUTTI I TEST SUPERATI!');
    console.log('✅ Le nuove credenziali funzionano correttamente');
    console.log('\n🚀 Puoi ora:');
    console.log("   - Avviare l'applicazione: npm run dev");
    console.log('   - Eseguire migrazioni: npm run db:push');
    console.log("   - Testare l'app normalmente");
  } else {
    console.log('❌ ALCUNI TEST FALLITI');
    if (!dbResult) {
      console.log('   ❌ Problema con la connessione database');
      console.log('   💡 Verifica ***REMOVED*** e password database');
    }
    if (!supabaseResult) {
      console.log('   ❌ Problema con la connessione Supabase');
      console.log('   💡 Verifica le API keys di Supabase');
    }
    console.log('\n🔧 Azioni consigliate:');
    console.log('   1. Rigenera le chiavi compromesse');
    console.log('   2. Aggiorna .env.local con le nuove credenziali');
    console.log('   3. Riesegui questo test');
  }
}

runAllTests().catch(error => {
  console.error('\n💥 ERRORE CRITICO:', error.message);
  process.exit(1);
});
