#!/usr/bin/env node

/**
 * Script sicuro per eseguire test Playwright
 * Monitora risorse e previene crash di sistema
 */

const { execSync, spawn } = require('child_process');
const os = require('os');
const path = require('path');

console.log('🛡️ Avvio script di sicurezza per test Playwright...\n');

// Controllo memoria disponibile
function checkMemory() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;

  console.log(
    `💾 Memoria: ${Math.round(freeMem / 1024 / 1024)}MB libera (${Math.round(usedMemPercent)}% utilizzata)`
  );

  // Se memoria sotto il 20%, avvisa
  if (freeMem < totalMem * 0.2) {
    console.log('⚠️ Memoria bassa rilevata - procedi con cautela');
  }

  return freeMem > 1024 * 1024 * 1024; // Almeno 1GB libero
}

// Controllo processi Node.js attivi (escludendo Cursor e sistema)
function checkNodeProcesses() {
  try {
    // Conta processi escludendo quelli di Cursor e sistema
    const result = execSync(
      'pgrep -f "node" | grep -v -E "(cursor|vscode|mcp-server)" | wc -l',
      { encoding: 'utf8' }
    ).trim();
    const relevantNodeProcesses = parseInt(result) || 0;

    // Conta anche processi Next.js specifici del progetto
    const nextResult = execSync('pgrep -f "next dev" | wc -l', {
      encoding: 'utf8',
    }).trim();
    const nextProcesses = parseInt(nextResult) || 0;

    console.log(`🔄 Processi Node.js rilevanti: ${relevantNodeProcesses}`);
    console.log(`🚀 Processi Next.js: ${nextProcesses}`);

    // Logica più realistica: considera che molti processi sono necessari per l'IDE
    const totalProcesses = relevantNodeProcesses + nextProcesses;

    console.log(`📊 Totale processi considerati: ${totalProcesses}`);

    // Soglia adattiva basata sulle condizioni del sistema
    if (totalProcesses > 25) {
      console.log('❌ Troppi processi attivi - rischio elevato');
      return false;
    }

    if (totalProcesses > 20) {
      console.log('⚠️ Diversi processi attivi - procedi con cautela');
    }

    // Memoria buona + processi ragionevoli = OK
    if (freeMem > 1024 * 1024 * 1024) {
      // > 1GB libera
      console.log('✅ Sistema stabile - pronto per test');
      return true;
    }

    // Memoria borderline ma processi OK = cautela
    if (totalProcesses < 15) {
      console.log(
        'ℹ️ Memoria borderline ma processi OK - procedi con monitoraggio'
      );
      return true;
    }

    console.log('⚠️ Condizioni borderline - sconsigliato procedere');
    return false;
  } catch (error) {
    console.log('ℹ️ Impossibile contare processi Node.js, procedo con cautela');
    return true;
  }
}

// Controllo se Next.js è in esecuzione
function checkNextJs() {
  try {
    const result = execSync('pgrep -f "next dev" | wc -l', {
      encoding: 'utf8',
    }).trim();
    const nextProcesses = parseInt(result);

    if (nextProcesses === 0) {
      console.log('❌ Next.js non è in esecuzione su localhost:3000');
      console.log('💡 Avvia prima: npm run dev');
      return false;
    }

    console.log('✅ Next.js è in esecuzione');
    return true;
  } catch (error) {
    console.log('❌ Errore nel controllo Next.js');
    return false;
  }
}

// Funzione principale
async function runSafeTests() {
  console.log('🔍 Controllo sicurezza sistema...\n');

  // Controlli di sicurezza
  const memoryOk = checkMemory();
  const processesOk = checkNodeProcesses();
  const nextJsOk = checkNextJs();

  console.log('\n' + '='.repeat(50));

  if (!memoryOk) {
    console.log('❌ Memoria insufficiente - test annullati per sicurezza');
    process.exit(1);
  }

  if (!processesOk) {
    console.log('❌ Troppi processi attivi - test annullati per sicurezza');
    process.exit(1);
  }

  if (!nextJsOk) {
    console.log("❌ Next.js non attivo - avvia prima l'applicazione");
    process.exit(1);
  }

  console.log('✅ Tutti i controlli passati - avvio test sicuri...\n');

  // Avvio test con timeout di sicurezza
  const testProcess = spawn(
    'npx',
    [
      'playwright',
      'test',
      'homepage.spec.ts',
      '--grep',
      'dovrebbe caricare la homepage correttamente',
    ],
    {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    }
  );

  // Timeout di sicurezza (2 minuti)
  const timeout = setTimeout(() => {
    console.log('\n⏰ Timeout di sicurezza raggiunto - terminazione test');
    testProcess.kill('SIGTERM');

    setTimeout(() => {
      if (!testProcess.killed) {
        testProcess.kill('SIGKILL');
      }
      process.exit(1);
    }, 5000);
  }, 120000);

  // Gestione chiusura processo
  testProcess.on('close', code => {
    clearTimeout(timeout);

    if (code === 0) {
      console.log('\n✅ Test completati con successo!');
      console.log('🎉 Puoi ora provare test più avanzati:');
      console.log('   npm run test:homepage  # Test homepage completi');
      console.log('   npm run test:auth       # Test autenticazione');
    } else {
      console.log(`\n❌ Test falliti con codice: ${code}`);
      console.log('💡 Controlla i log sopra per dettagli');
    }

    process.exit(code);
  });

  // Gestione errori
  testProcess.on('error', error => {
    clearTimeout(timeout);
    console.error("\n❌ Errore nell'esecuzione dei test:", error.message);
    process.exit(1);
  });
}

// Gestione segnali di interruzione
process.on('SIGINT', () => {
  console.log("\n⏹️ Test interrotti dall'utente");
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ Test terminati dal sistema');
  process.exit(0);
});

// Avvio
runSafeTests().catch(error => {
  console.error('❌ Errore critico:', error);
  process.exit(1);
});
