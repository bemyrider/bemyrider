/**
 * Script per creare 3 rider fantocci con dati realistici
 * Uso: node scripts/create-mock-riders.js
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

// Rider fantocci da creare con dati realistici
const MOCK_RIDERS = [
  {
    email: 'marco.bianchi@bemyrider.test',
    password: 'RiderMarco2024!',
    fullName: 'Marco Bianchi',
    role: 'rider',
    bio: 'Rider professionista con 5 anni di esperienza. Specializzato in consegne rapide in centro città. Disponibile 7 giorni su 7.',
    hourlyRate: 12.5,
    vehicleType: 'e_bike',
    activeLocation: 'Milano',
    experienceYears: 5,
    specializations: ['Consegne rapide', 'Centro città', 'Documenti importanti'],
    completedJobs: 1247,
    rating: 4.8,
    responseTime: '< 5 min',
    isVerified: true,
    isPremium: true,
    profilePictureUrl: null,
  },
  {
    email: 'giulia.verdi@bemyrider.test',
    password: 'RiderGiulia2024!',
    fullName: 'Giulia Verdi',
    role: 'rider',
    bio: 'Specializzata in consegne di prodotti freschi e farmaceutici. Sempre puntuale e affidabile. Uso veicoli elettrici ecologici.',
    hourlyRate: 15.0,
    vehicleType: 'scooter',
    activeLocation: 'Torino',
    experienceYears: 3,
    specializations: ['Prodotti freschi', 'Farmaceutici', 'Consegne urgenti'],
    completedJobs: 856,
    rating: 4.9,
    responseTime: '< 3 min',
    isVerified: true,
    isPremium: false,
    profilePictureUrl: null,
  },
  {
    email: 'luca.rossi@bemyrider.test',
    password: 'RiderLuca2024!',
    fullName: 'Luca Rossi',
    role: 'rider',
    bio: 'Rider affidabile per consegne pesanti e di grandi dimensioni. Disponibile anche nei weekend. Uso furgone per carichi speciali.',
    hourlyRate: 18.0,
    vehicleType: 'auto',
    activeLocation: 'Roma',
    experienceYears: 7,
    specializations: ['Consegne pesanti', 'Weekend', 'Extra-urbane'],
    completedJobs: 2156,
    rating: 4.7,
    responseTime: '< 10 min',
    isVerified: true,
    isPremium: true,
    profilePictureUrl: null,
  },
];

async function createMockRider(riderData) {
  console.log(`\n🔄 Creando rider fantoccio: ${riderData.fullName}...`);

  try {
    // 1. Crea l'utente in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: riderData.email,
        password: riderData.password,
        email_confirm: true, // Conferma email automaticamente
        user_metadata: {
          full_name: riderData.fullName,
          role: riderData.role,
        },
      });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`⚠️  Rider ${riderData.fullName} (${riderData.email}) già esiste`);
        return { success: true, existed: true };
      }
      throw authError;
    }

    console.log(`✅ Utente Auth creato: ${authData.user.id}`);

    // 2. Crea il profilo nella tabella profiles
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: riderData.fullName,
      role: riderData.role,
      avatar_url: riderData.profilePictureUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.log(
        `⚠️  Errore profilo (potrebbe già esistere): ${profileError.message}`
      );
    } else {
      console.log(`✅ Profilo creato per: ${riderData.fullName}`);
    }

    // 3. Crea il record dettagliato in riders_details
    const { error: riderError } = await supabase
      .from('riders_details')
      .upsert({
        profile_id: authData.user.id,
        bio: riderData.bio,
        hourly_rate: riderData.hourlyRate,
        vehicle_type: riderData.vehicleType,
        profile_picture_url: riderData.profilePictureUrl,
        active_location: riderData.activeLocation,
        experience_years: riderData.experienceYears,
        specializations: riderData.specializations,
        completed_jobs: riderData.completedJobs,
        rating: riderData.rating,
        response_time: riderData.responseTime,
        is_verified: riderData.isVerified,
        is_premium: riderData.isPremium,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (riderError) {
      console.log(`⚠️  Errore dettagli rider: ${riderError.message}`);
    } else {
      console.log(`✅ Dettagli rider creati con successo`);
    }

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error(`❌ Errore creando ${riderData.fullName}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function createAllMockRiders() {
  console.log('🚀 Iniziando creazione rider fantocci...\n');
  console.log('📋 Verranno creati 3 rider con dati realistici per il testing:\n');

  // Mostra i rider che verranno creati
  MOCK_RIDERS.forEach((rider, index) => {
    console.log(`${index + 1}. ${rider.fullName}`);
    console.log(`   📧 ${rider.email}`);
    console.log(`   🚗 ${rider.vehicleType.replace('_', '-')} - €${rider.hourlyRate}/h`);
    console.log(`   📍 ${rider.activeLocation}`);
    console.log(`   ⭐ ${rider.rating}/5 (${rider.completedJobs} consegne)`);
    console.log(`   💼 ${rider.experienceYears} anni esperienza`);
    console.log(`   ⚡ ${rider.responseTime}`);
    console.log('');
  });

  const results = [];

  for (const riderData of MOCK_RIDERS) {
    const result = await createMockRider(riderData);
    results.push({ ...riderData, ...result });
  }

  console.log('\n📊 Riepilogo Creazione Rider Fantocci:');
  console.log('=====================================');

  results.forEach((result, index) => {
    const status = result.success
      ? result.existed
        ? '🟡 Esisteva già'
        : '🟢 Creato'
      : '🔴 Errore';
    console.log(`${index + 1}. ${status} - ${result.fullName} (${result.email})`);
    if (result.success && !result.existed) {
      console.log(`   🚗 ${result.vehicleType.replace('_', '-')} | 📍 ${result.activeLocation} | ⭐ ${result.rating}/5 (${result.completedJobs} jobs)`);
    }
  });

  const successful = results.filter(r => r.success).length;
  console.log(`\n✅ ${successful}/${results.length} rider fantocci pronti!`);

  if (successful > 0) {
    console.log('\n🎯 Credenziali per accesso:');
    console.log('==========================');
    results
      .filter(r => r.success)
      .forEach(result => {
        const originalData = MOCK_RIDERS.find(r => r.email === result.email);
        console.log(`${result.fullName}:`);
        console.log(`  Email: ${result.email}`);
        console.log(`  Password: ${originalData.password}`);
        console.log(`  Ruolo: ${result.role}`);
        console.log('');
      });

    console.log('\n💡 I rider fantocci sono ora visibili nella pagina /riders');
    console.log('🔗 Puoi accedere ai loro profili individuali tramite /riders/[id]');
  }
}

// Esegui lo script
createAllMockRiders()
  .then(() => {
    console.log('\n🏁 Creazione rider fantocci completata!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Errore fatale:', error);
    process.exit(1);
  });
