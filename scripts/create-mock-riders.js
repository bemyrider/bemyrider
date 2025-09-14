/**
 * Script per creare 3 rider fantocci con dati realistici
 * Uso: node scripts/create-mock-riders.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configurazione
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.***REMOVED***;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Errore: Variabili ambiente mancanti!');
  console.log(
    'Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e ***REMOVED*** in .env.local'
  );
  process.exit(1);
}

// Client Supabase con privilegi admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rider fantocci da creare con dati realistici
// 10 Rider in moto (scooter) da creare con dati realistici italiani
const MOCK_RIDERS = [
  {
    email: 'alessandro.conti@bemyrider.test',
    password: process.env.MOCK_RIDER_PASSWORD_1 || 'MockPassword1!',
    fullName: 'Alessandro Conti',
    role: 'rider',
    bio: 'Pilota esperto con Honda SH 125. Specializzato in consegne rapide nel centro storico. Conosco ogni vicolo di Milano.',
    hourlyRate: 11.5,
    vehicleType: 'scooter',
    activeLocation: 'Milano',
    experienceYears: 6,
    specializations: ['Centro storico', 'Consegne rapide', 'Documenti legali'],
    completedJobs: 1847,
    rating: 4.9,
    responseTime: '< 3 min',
    isVerified: true,
    isPremium: true,
    profilePictureUrl: null,
  },
  {
    email: 'valentina.moretti@bemyrider.test',
    password: process.env.MOCK_RIDER_PASSWORD_2 || 'MockPassword2!',
    fullName: 'Valentina Moretti',
    role: 'rider',
    bio: 'Pilota donna con Yamaha TMAX. Perfetta per consegne delicate e prodotti di lusso. Sempre elegante e professionale.',
    hourlyRate: 14.0,
    vehicleType: 'scooter',
    activeLocation: 'Milano',
    experienceYears: 4,
    specializations: [
      'Prodotti di lusso',
      'Consegne delicate',
      'Eventi speciali',
    ],
    completedJobs: 1245,
    rating: 4.8,
    responseTime: '< 5 min',
    isVerified: true,
    isPremium: true,
    profilePictureUrl: null,
  },
  {
    email: 'francesco.galli@bemyrider.test',
    password: process.env.MOCK_RIDER_PASSWORD_3 || 'MockPassword3!',
    fullName: 'Francesco Galli',
    role: 'rider',
    bio: 'Rider giovane e dinamico con Piaggio Beverly. Perfetto per consegne veloci e affidabili in zona universitaria.',
    hourlyRate: 10.5,
    vehicleType: 'scooter',
    activeLocation: 'Milano',
    experienceYears: 2,
    specializations: ['Università', 'Consegne veloci', 'Piccoli pacchi'],
    completedJobs: 756,
    rating: 4.7,
    responseTime: '< 4 min',
    isVerified: true,
    isPremium: false,
    profilePictureUrl: null,
  },
  {
    email: 'sofia.ferrari@bemyrider.test',
    password: process.env.MOCK_RIDER_PASSWORD_4 || 'MockPassword4!',
    fullName: 'Sofia Ferrari',
    role: 'rider',
    bio: 'Pilota esperta con Vespa Primavera. Specializzata in consegne artistiche e prodotti creativi. Adoro il mio lavoro!',
    hourlyRate: 12.0,
    vehicleType: 'scooter',
    activeLocation: 'Torino',
    experienceYears: 5,
    specializations: [
      'Prodotti artistici',
      'Consegne creative',
      'Piccole imprese',
    ],
    completedJobs: 1456,
    rating: 4.9,
    responseTime: '< 6 min',
    isVerified: true,
    isPremium: true,
    profilePictureUrl: null,
  },
  {
    email: 'matteo.romano@bemyrider.test',
    password: process.env.MOCK_RIDER_PASSWORD_5 || 'MockPassword5!',
    fullName: 'Matteo Romano',
    role: 'rider',
    bio: 'Rider affidabile con Aprilia Scarabeo. Perfetto per consegne pesanti fino a 20kg. Disponibile anche la sera.',
    hourlyRate: 13.5,
    vehicleType: 'scooter',
    activeLocation: 'Torino',
    experienceYears: 7,
    specializations: ['Consegne pesanti', 'Serale', 'Carichi fino 20kg'],
    completedJobs: 2156,
    rating: 4.6,
    responseTime: '< 8 min',
    isVerified: true,
    isPremium: false,
    profilePictureUrl: null,
  },
  {
    email: 'giorgia.lombardi@bemyrider.test',
    password: process.env.MOCK_RIDER_PASSWORD_6 || 'MockPassword6!',
    fullName: 'Giorgia Lombardi',
    role: 'rider',
    bio: 'Pilota dinamica con Kymco Agility. Specializzata in consegne farmaceutiche e prodotti sanitari. Massima affidabilità.',
    hourlyRate: 13.0,
    vehicleType: 'scooter',
    activeLocation: 'Roma',
    experienceYears: 4,
    specializations: ['Farmaceutici', 'Prodotti sanitari', 'Consegne urgenti'],
    completedJobs: 987,
    rating: 4.8,
    responseTime: '< 5 min',
    isVerified: true,
    isPremium: true,
    profilePictureUrl: null,
  },
  {
    email: 'davide.marini@bemyrider.test',
    password: process.env.MOCK_RIDER_PASSWORD_7 || 'MockPassword7!',
    fullName: 'Davide Marini',
    role: 'rider',
    bio: 'Rider esperto con Gilera Runner. Perfetto per consegne in zone residenziali. Conosco ogni strada di Roma.',
    hourlyRate: 11.0,
    vehicleType: 'scooter',
    activeLocation: 'Roma',
    experienceYears: 8,
    specializations: [
      'Zone residenziali',
      'Consegne locali',
      'Servizio clienti',
    ],
    completedJobs: 2456,
    rating: 4.7,
    responseTime: '< 7 min',
    isVerified: true,
    isPremium: false,
    profilePictureUrl: null,
  },
  {
    email: 'chiara.bellini@bemyrider.test',
    password: process.env.MOCK_RIDER_PASSWORD_8 || 'MockPassword8!',
    fullName: 'Chiara Bellini',
    role: 'rider',
    bio: 'Pilota giovane con Peugeot Tweet. Specializzata in consegne sostenibili e prodotti bio. Amo la natura!',
    hourlyRate: 12.5,
    vehicleType: 'scooter',
    activeLocation: 'Firenze',
    experienceYears: 3,
    specializations: ['Prodotti bio', 'Consegne sostenibili', 'Centro storico'],
    completedJobs: 678,
    rating: 4.9,
    responseTime: '< 4 min',
    isVerified: true,
    isPremium: false,
    profilePictureUrl: null,
  },
  {
    email: 'andrea.villa@bemyrider.test',
    password: process.env.MOCK_RIDER_PASSWORD_9 || 'MockPassword9!',
    fullName: 'Andrea Villa',
    role: 'rider',
    bio: 'Rider affidabile con Moto Guzzi V7. Specializzato in consegne di grandi dimensioni. Trasporto tutto con sicurezza.',
    hourlyRate: 15.0,
    vehicleType: 'scooter',
    activeLocation: 'Bologna',
    experienceYears: 6,
    specializations: [
      'Consegne grandi',
      'Trasporti sicuri',
      'Articoli delicati',
    ],
    completedJobs: 1789,
    rating: 4.5,
    responseTime: '< 10 min',
    isVerified: true,
    isPremium: true,
    profilePictureUrl: null,
  },
  {
    email: 'elena.ricci@bemyrider.test',
    password: process.env.MOCK_RIDER_PASSWORD_10 || 'MockPassword10!',
    fullName: 'Elena Ricci',
    role: 'rider',
    bio: 'Pilota esperta con BMW C 400 X. Perfetta per consegne business e documenti importanti. Sempre professionale.',
    hourlyRate: 16.0,
    vehicleType: 'scooter',
    activeLocation: 'Genova',
    experienceYears: 9,
    specializations: ['Business', 'Documenti importanti', 'Consegne executive'],
    completedJobs: 2876,
    rating: 4.9,
    responseTime: '< 3 min',
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
        console.log(
          `⚠️  Rider ${riderData.fullName} (${riderData.email}) già esiste`
        );
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
    const { error: riderError } = await supabase.from('riders_details').upsert({
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
  console.log(
    '📋 Verranno creati 10 rider professionisti in moto per il testing:\n'
  );

  // Mostra i rider che verranno creati
  MOCK_RIDERS.forEach((rider, index) => {
    console.log(`${index + 1}. ${rider.fullName}`);
    console.log(`   📧 ${rider.email}`);
    console.log(
      `   🚗 ${rider.vehicleType.replace('_', '-')} - €${rider.hourlyRate}/h`
    );
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
    console.log(
      `${index + 1}. ${status} - ${result.fullName} (${result.email})`
    );
    if (result.success && !result.existed) {
      console.log(
        `   🚗 ${result.vehicleType.replace('_', '-')} | 📍 ${result.activeLocation} | ⭐ ${result.rating}/5 (${result.completedJobs} jobs)`
      );
    }
  });

  const successful = results.filter(r => r.success).length;
  console.log(
    `\n✅ ${successful}/${results.length} rider professionisti in moto pronti!`
  );

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
    console.log(
      '🔗 Puoi accedere ai loro profili individuali tramite /riders/[id]'
    );
    console.log(
      '🏍️  Tutti i rider utilizzano scooter/moto per consegne veloci e affidabili'
    );
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
