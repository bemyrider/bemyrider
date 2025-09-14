const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variabili d'ambiente mancanti");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lista degli utenti di test da eliminare
const testUserIds = [
  'f89e0bb3-3a15-4288-a2b0-afaf8dd1cffc', // john.rider@example.com
  '86cf077a-9612-48c9-a795-9f5744f67df5', // alice.merchant@example.com
  'ae65b4c7-aa3a-45d0-98d8-28df4f09d953', // testmerchant@example.com
  'c27a1566-17d0-418e-a586-7a50160aa557', // test.rider@bemyrider.test
  'f99714aa-9225-4565-af88-c86b704779dc', // test.merchant@bemyrider.test
];

async function deleteUser(userId) {
  try {
    console.log(`🗑️ Eliminando utente: ${userId}`);

    // 1. Elimina riders_details
    const { error: ridersDetailsError } = await supabase
      .from('riders_details')
      .delete()
      .eq('profile_id', userId);

    if (ridersDetailsError) {
      console.error(
        `❌ Errore eliminazione riders_details:`,
        ridersDetailsError
      );
    } else {
      console.log(`✅ riders_details eliminati`);
    }

    // 2. Elimina riders_tax_details
    const { error: taxDetailsError } = await supabase
      .from('riders_tax_details')
      .delete()
      .eq('profile_id', userId);

    if (taxDetailsError) {
      console.error(
        `❌ Errore eliminazione riders_tax_details:`,
        taxDetailsError
      );
    } else {
      console.log(`✅ riders_tax_details eliminati`);
    }

    // 3. Elimina bookings
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .or(`rider_id.eq.${userId},merchant_id.eq.${userId}`);

    if (bookingsError) {
      console.error(`❌ Errore eliminazione bookings:`, bookingsError);
    } else {
      console.log(`✅ bookings eliminati`);
    }

    // 4. Elimina reviews
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .or(`rider_id.eq.${userId},merchant_id.eq.${userId}`);

    if (reviewsError) {
      console.error(`❌ Errore eliminazione reviews:`, reviewsError);
    } else {
      console.log(`✅ reviews eliminate`);
    }

    // 5. Elimina profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error(`❌ Errore eliminazione profile:`, profileError);
    } else {
      console.log(`✅ profile eliminato`);
    }

    // 6. Elimina da auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error(`❌ Errore eliminazione auth:`, authError);
    } else {
      console.log(`✅ Utente eliminato da auth`);
    }

    console.log(`🎉 Utente ${userId} eliminato completamente\n`);
    return true;
  } catch (error) {
    console.error(`❌ Errore generale per utente ${userId}:`, error);
    return false;
  }
}

async function main() {
  console.log('🧹 Inizio eliminazione utenti di test...\n');

  let successCount = 0;
  let totalCount = testUserIds.length;

  for (const userId of testUserIds) {
    const success = await deleteUser(userId);
    if (success) successCount++;

    // Pausa tra eliminazioni per evitare rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 Risultato finale:`);
  console.log(`✅ Eliminati con successo: ${successCount}/${totalCount}`);
  console.log(`❌ Falliti: ${totalCount - successCount}/${totalCount}`);

  if (successCount === totalCount) {
    console.log(`\n🎉 Tutti gli utenti di test sono stati eliminati!`);
  } else {
    console.log(
      `\n⚠️ Alcuni utenti non sono stati eliminati. Controlla i log sopra.`
    );
  }
}

main().catch(console.error);
