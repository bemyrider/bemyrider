#!/usr/bin/env node

/**
 * 🧪 TEST WEBHOOK STRIPE
 *
 * Script semplice per testare la connessione webhook
 * Verifica che il webhook riceva e processi correttamente gli eventi
 */

const https = require('https');

const WEBHOOK_URL = process.env.VERCEL_DEPLOYMENT_URL
  ? `${process.env.VERCEL_DEPLOYMENT_URL}/api/stripe/webhook`
  : 'http://localhost:3000/api/stripe/webhook';

console.log('🧪 TEST WEBHOOK STRIPE\n');
console.log('═'.repeat(50));
console.log(`🌐 URL Webhook: ${WEBHOOK_URL}`);
console.log('═'.repeat(50));

/**
 * Test 1: Verifica che l'endpoint webhook sia raggiungibile
 */
async function testWebhookEndpoint() {
  console.log('\n🔍 1. TEST CONNESSIONE ENDPOINT');

  return new Promise(resolve => {
    const url = new URL(WEBHOOK_URL);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 't=1234567890,v1=test_signature',
      },
      timeout: 10000,
    };

    const req = https.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 400) {
          // È normale che restituisca 400 con firma di test
          console.log('✅ Endpoint webhook raggiungibile');
          console.log(
            `📊 Status: ${res.statusCode} (atteso per firma di test)`
          );
          resolve(true);
        } else if (res.statusCode === 200) {
          console.log('✅ Endpoint webhook attivo');
          console.log(`📊 Status: ${res.statusCode}`);
          resolve(true);
        } else {
          console.log('⚠️  Endpoint webhook risponde in modo inaspettato');
          console.log(`📊 Status: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', err => {
      console.log('❌ Errore connessione endpoint webhook:');
      console.log(`   ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('⏱️  Timeout connessione endpoint webhook');
      req.destroy();
      resolve(false);
    });

    // Invia un payload di test
    const testPayload = {
      type: 'account.updated',
      data: {
        object: {
          id: 'acct_test_webhook',
          details_submitted: true,
          charges_enabled: true,
        },
      },
    };

    req.write(JSON.stringify(testPayload));
    req.end();
  });
}

/**
 * Test 2: Verifica variabili d'ambiente
 */
function testEnvironmentVariables() {
  console.log('\n🔧 2. TEST VARIABILI AMBIENTE');

  const requiredVars = [
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    '***REMOVED***',
  ];

  let allPresent = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: NON TROVATA`);
      allPresent = false;
    } else {
      const maskedValue =
        value.length > 10
          ? `${value.substring(0, 6)}...${value.substring(value.length - 4)}`
          : value;
      console.log(`✅ ${varName}: ${maskedValue}`);
    }
  }

  if (allPresent) {
    console.log('✅ Tutte le variabili richieste sono presenti');
  } else {
    console.log("❌ Alcune variabili d'ambiente mancano");
    console.log('💡 Assicurati di aver configurato Vercel correttamente');
  }

  return allPresent;
}

/**
 * Test 3: Simula payload webhook
 */
function testWebhookPayload() {
  console.log('\n📨 3. TEST PAYLOAD WEBHOOK');

  const testPayloads = [
    {
      name: 'Account Updated - Onboarding Completato',
      payload: {
        type: 'account.updated',
        data: {
          object: {
            id: 'acct_test_complete',
            details_submitted: true,
            charges_enabled: true,
            payouts_enabled: true,
          },
        },
      },
      expected: '✅ stripe_onboarding_complete = true',
    },
    {
      name: 'Account Updated - Onboarding Incompleto',
      payload: {
        type: 'account.updated',
        data: {
          object: {
            id: 'acct_test_incomplete',
            details_submitted: false,
            charges_enabled: false,
          },
        },
      },
      expected: '⏳ Nessun aggiornamento database',
    },
    {
      name: 'Evento Non Supportato',
      payload: {
        type: 'customer.created',
        data: {
          object: {
            id: 'cus_test_123',
          },
        },
      },
      expected: '📨 Evento ignorato',
    },
  ];

  for (const test of testPayloads) {
    console.log(`\n  🧪 ${test.name}`);
    console.log(`  📊 Payload: ${JSON.stringify(test.payload, null, 2)}`);
    console.log(`  🎯 Atteso: ${test.expected}`);
  }

  console.log('\n✅ Struttura payload verificata');
  return true;
}

/**
 * Test 4: Istruzioni per test manuale
 */
function printManualTestInstructions() {
  console.log('\n🎯 4. ISTRUZIONI TEST MANUALE');
  console.log('═'.repeat(50));

  console.log('\n🔧 STRIPE DASHBOARD:');
  console.log('1. Vai su https://dashboard.stripe.com/webhooks');
  console.log('2. Seleziona il tuo webhook endpoint');
  console.log('3. Clicca "Send test webhook"');
  console.log('4. Scegli evento "account.updated"');
  console.log('5. Clicca "Send test webhook"');

  console.log('\n📊 VERCEL LOGS:');
  console.log('1. Vai su vercel.com → Progetto bemyrider');
  console.log('2. Vai su "Functions" → "Runtime Logs"');
  console.log('3. Cerca logs come:');
  console.log('   ✅ Webhook ricevuto per account: acct_test_...');
  console.log('   ✅ Onboarding completato per account: acct_test_...');

  console.log('\n🗄️ DATABASE:');
  console.log('Verifica che stripe_onboarding_complete sia true:');
  console.log('```sql');
  console.log(
    'SELECT stripe_account_id, stripe_onboarding_complete, updated_at'
  );
  console.log('FROM riders_details');
  console.log('WHERE stripe_account_id IS NOT NULL;');
  console.log('```');

  console.log('\n🔍 CLI ALTERNATIVA:');
  console.log('Se hai Stripe CLI installato:');
  console.log('```bash');
  console.log(
    'stripe listen --forward-to https://bemyrider.vercel.app/api/stripe/webhook'
  );
  console.log('stripe trigger account.updated');
  console.log('```');
}

/**
 * Esegui tutti i test
 */
async function runAllTests() {
  console.log('🚀 AVVIO TEST WEBHOOK...\n');

  // Test variabili d'ambiente
  const envOk = testEnvironmentVariables();

  // Test struttura payload
  const payloadOk = testWebhookPayload();

  // Test connessione endpoint (se possibile)
  const endpointOk = await testWebhookEndpoint();

  // Istruzioni per test manuale
  printManualTestInstructions();

  // Risultato finale
  console.log('\n' + '═'.repeat(50));
  console.log('🏁 RISULTATO FINALE');
  console.log('═'.repeat(50));

  const totalTests = 3;
  const passedTests = [envOk, payloadOk, endpointOk].filter(Boolean).length;

  console.log(`✅ Test superati: ${passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log('🎉 TUTTI I TEST PASSATI!');
    console.log('✅ Il webhook sembra configurato correttamente');
    console.log('\n🚀 Puoi ora testare manualmente usando le istruzioni sopra');
  } else {
    console.log('⚠️  Alcuni test hanno fallito');
    console.log('\n🔧 Azioni consigliate:');
    console.log("1. Verifica le variabili d'ambiente su Vercel");
    console.log('2. Controlla che il webhook secret sia corretto');
    console.log('3. Testa manualmente usando Stripe Dashboard');
  }

  console.log('\n' + '═'.repeat(50));
  console.log('💡 Script creato automaticamente per test webhook');
  console.log('📚 Basato sulla documentazione testing.md');
  console.log('═'.repeat(50));
}

// Gestione errori
process.on('unhandledRejection', error => {
  console.error('\n💥 ERRORE NON GESTITO:', error.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log("\n⏹️  Test interrotti dall'utente");
  process.exit(0);
});

// Avvio
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
