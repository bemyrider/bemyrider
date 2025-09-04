/**
 * Script per creare account di test per bemyrider
 *
 * Uso: node scripts/create-test-accounts.js
 *
 * Crea account di test con credenziali predefinite per facilitare il testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili di ambiente mancanti:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

// Client Supabase con privilegi di admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_ACCOUNTS = {
  rider: {
    email: 'test.rider@bemyrider.test',
    password: 'TestRider2024!',
    full_name: 'Marco Rossi',
    role: 'rider',
    vehicle_type: 'bici',
    hourly_rate: 8.5,
    bio: 'Rider di test per bemyrider. Esperienza nelle consegne urbane.',
  },
  merchant: {
    email: 'test.merchant@bemyrider.test',
    password: 'TestMerchant2024!',
    full_name: 'Pizzeria Da Mario',
    role: 'merchant',
  },
};

async function deleteExistingTestAccounts() {
  console.log('🗑️ Eliminazione account di test esistenti...');

  for (const [role, account] of Object.entries(TEST_ACCOUNTS)) {
    try {
      // Trova l'utente esistente
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(
        u => u.email === account.email
      );

      if (existingUser) {
        console.log(`   Eliminazione ${role}: ${account.email}`);

        // Elimina prima i dati del profilo
        await supabase.from('profiles').delete().eq('id', existingUser.id);
        await supabase
          .from('riders_details')
          .delete()
          .eq('profile_id', existingUser.id);

        // Poi elimina l'utente auth
        await supabase.auth.admin.deleteUser(existingUser.id);

        console.log(`   ✅ ${role} eliminato`);
      }
    } catch (error) {
      console.warn(`   ⚠️ Errore eliminazione ${role}:`, error.message);
    }
  }
}

async function createTestAccount(role, accountData) {
  console.log(`👤 Creazione account ${role}: ${accountData.email}`);

  try {
    // 1. Crea l'utente auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: accountData.email,
        password: accountData.password,
        email_confirm: true, // Bypassa la conferma email
        user_metadata: {
          full_name: accountData.full_name,
          role: accountData.role,
        },
      });

    if (authError) {
      throw new Error(`Auth creation failed: ${authError.message}`);
    }

    const userId = authData.user.id;
    console.log(`   ✅ User auth creato: ${userId}`);

    // 2. Crea il profilo
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      full_name: accountData.full_name,
      role: accountData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    console.log(`   ✅ Profilo creato`);

    // 3. Se è un rider, crea anche riders_details
    if (accountData.role === 'rider') {
      const { error: riderError } = await supabase
        .from('riders_details')
        .insert({
          profile_id: userId,
          vehicle_type: accountData.vehicle_type,
          bio: accountData.bio,
          hourly_rate: accountData.hourly_rate,
          stripe_onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (riderError) {
        throw new Error(`Rider details creation failed: ${riderError.message}`);
      }

      console.log(`   ✅ Dettagli rider creati`);
    }

    return {
      success: true,
      userId,
      email: accountData.email,
      password: accountData.password,
      role: accountData.role,
    };
  } catch (error) {
    console.error(`   ❌ Errore creazione ${role}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log('🚀 Creazione account di test per bemyrider');
  console.log('=========================================');

  try {
    // Elimina account esistenti
    await deleteExistingTestAccounts();

    console.log('\n📝 Creazione nuovi account...');

    const results = [];

    // Crea account rider
    const riderResult = await createTestAccount('rider', TEST_ACCOUNTS.rider);
    results.push(riderResult);

    // Crea account merchant
    const merchantResult = await createTestAccount(
      'merchant',
      TEST_ACCOUNTS.merchant
    );
    results.push(merchantResult);

    // Riepilogo
    console.log('\n📊 Riepilogo creazione account:');
    console.log('================================');

    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.role.toUpperCase()}:`);
        console.log(`   Email: ${result.email}`);
        console.log(`   Password: ${result.password}`);
        console.log(`   User ID: ${result.userId}`);
      } else {
        console.log(
          `❌ ${result.role?.toUpperCase() || 'UNKNOWN'}: ${result.error}`
        );
      }
    });

    const successCount = results.filter(r => r.success).length;
    console.log(
      `\n🎯 Account creati con successo: ${successCount}/${results.length}`
    );

    if (successCount > 0) {
      console.log('\n💡 Credenziali per testing:');
      console.log('============================');
      results
        .filter(r => r.success)
        .forEach(result => {
          console.log(`${result.role}: ${result.email} / ${result.password}`);
        });
    }
  } catch (error) {
    console.error('💥 Errore generale:', error.message);
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Script completato');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Script fallito:', error);
      process.exit(1);
    });
}

module.exports = { createTestAccount, TEST_ACCOUNTS };
