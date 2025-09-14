#!/usr/bin/env node

/**
 * 🚀 VERIFICA DEPLOYMENT BEMYRYDER
 *
 * Script per verificare che il deployment sia andato a buon fine
 * e che tutti i servizi siano operativi
 */

const https = require('https');

const DEPLOYMENT_URL =
  process.env.VERCEL_DEPLOYMENT_URL || 'https://bemyrider.vercel.app'; // Sostituisci con il tuo URL effettivo

async function checkEndpoint(url, description) {
  return new Promise(resolve => {
    console.log(`🔍 Verificando ${description}...`);

    const req = https.get(url, { timeout: 10000 }, res => {
      if (res.statusCode === 200) {
        console.log(`✅ ${description}: OK (${res.statusCode})`);
        resolve(true);
      } else {
        console.log(`⚠️  ${description}: Status ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', err => {
      console.log(`❌ ${description}: Errore - ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏱️  ${description}: Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function verifyDeployment() {
  console.log('\n🚀 VERIFICA DEPLOYMENT BEMYRYDER\n');
  console.log('═'.repeat(50));
  console.log(`🌐 URL Deployment: ${DEPLOYMENT_URL}`);
  console.log('═'.repeat(50));

  const checks = [
    { url: DEPLOYMENT_URL, description: 'Homepage' },
    { url: `${DEPLOYMENT_URL}/auth/login`, description: 'Login Page' },
    { url: `${DEPLOYMENT_URL}/api/riders`, description: 'API Riders' },
    { url: `${DEPLOYMENT_URL}/riders`, description: 'Riders Page' },
  ];

  let passedChecks = 0;

  for (const check of checks) {
    const success = await checkEndpoint(check.url, check.description);
    if (success) passedChecks++;
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 RISULTATI VERIFICA');
  console.log('═'.repeat(50));

  console.log(`✅ Checks superati: ${passedChecks}/${checks.length}`);

  if (passedChecks === checks.length) {
    console.log('🎉 DEPLOYMENT COMPLETAMENTE RIUSCITO!');
    console.log('\n📋 Prossimi passi:');
    console.log('1. ✅ Testare la registrazione utente');
    console.log('2. ✅ Testare il login');
    console.log('3. ✅ Verificare la sicurezza RLS');
    console.log('4. ✅ Testare le funzionalità principali');
  } else {
    console.log('⚠️  Alcuni controlli hanno fallito.');
    console.log('\n🔧 Possibili soluzioni:');
    console.log("1. Verificare le variabili d'ambiente su Vercel");
    console.log('2. Controllare i log di deployment su Vercel');
    console.log('3. Verificare la configurazione del database');
  }

  console.log('\n' + '═'.repeat(50));
  console.log('🔗 Links utili:');
  console.log(`🌐 App: ${DEPLOYMENT_URL}`);
  console.log('📊 Vercel Dashboard: https://vercel.com/dashboard');
  console.log('🗄️ Supabase Dashboard: https://supabase.com/dashboard');
  console.log('═'.repeat(50));
}

// Esegui verifica
if (require.main === module) {
  verifyDeployment().catch(console.error);
}

module.exports = { verifyDeployment };
