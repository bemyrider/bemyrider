# 🧪 Test Playwright - Guida Sicura

## ⚠️ Importante: Sicurezza Prima

I test sono stati configurati per **minimizzare i rischi di crash** del sistema. Segui sempre questo ordine:

## 🚀 Avvio Sicuro (Raccomandato)

### 1. Prima esecuzione - Test singolo e sicuro
```bash
# Avvia prima Next.js
npm run dev

# In un altro terminal, esegui il test più sicuro
npm run test:safe
```

Questo comando:
- ✅ Controlla la memoria disponibile
- ✅ Verifica che Next.js sia attivo
- ✅ Monitora i processi attivi
- ✅ Ha un timeout di sicurezza di 2 minuti
- ✅ Si interrompe automaticamente se rileva problemi

### 2. Se il test sicuro va bene, prova test più completi
```bash
# Test homepage completi
npm run test:homepage

# Test autenticazione
npm run test:auth

# Tutti i test
npm run test
```

## 📋 Comandi Disponibili

| Comando | Descrizione | Sicurezza |
|---------|-------------|----------|
| `npm run test:safe` | **Raccomandato** - Test singolo con monitoraggio | 🛡️ Massima |
| `npm run test:single` | Solo test homepage base | 🛡️ Alta |
| `npm run test:homepage` | Tutti i test homepage | 🛡️ Media |
| `npm run test:auth` | Test autenticazione | 🛡️ Media |
| `npm run test` | Tutti i test | ⚠️ Bassa |

## 🔧 Modalità Debug e Sviluppo

### Test con interfaccia grafica
```bash
npm run test:ui
```

### Test con browser visibile
```bash
npm run test:headed
```

### Debug step-by-step
```bash
npm run test:debug
```

## 🛑 Segnali di Pericolo

**Interrompi immediatamente se noti:**
- ❌ Rallentamenti del sistema
- ❌ Aumento memoria RAM
- ❌ Crash di Cursor
- ❌ Sistema che diventa lento
- ❌ Errori di memoria

## 🧹 Pulizia di Sicurezza

Se qualcosa va storto:
```bash
# Ferma tutti i processi Playwright
pkill -f playwright

# Rimuovi cartella test (opzionale)
rm -rf tests/

# Rimuovi configurazione (opzionale)
rm playwright.config.ts

# Ricarica node_modules se necessario
rm -rf node_modules && npm install
```

## 📊 Cosa Testano

### Homepage (`homepage.spec.ts`)
- ✅ Caricamento pagina
- ✅ Presenza elementi essenziali
- ✅ Logo bemyrider
- ✅ Pulsanti navigazione

### Autenticazione (`auth.spec.ts`)
- ✅ Caricamento form login
- ✅ Caricamento form registrazione
- ✅ Presenza campi obbligatori
- ✅ Link navigazione

## ⚙️ Configurazione Tecnica

- **Timeout**: 15 secondi per test
- **Workers**: 1 (no parallelismo)
- **Browser**: Solo Chromium
- **Headless**: Sì (per performance)
- **Screenshot**: Solo su fallimento
- **Video**: Disabilitato

## 🎯 Strategia Graduale

1. **Fase 1**: `test:safe` - Verifica stabilità
2. **Fase 2**: `test:homepage` - Test componenti base
3. **Fase 3**: `test:auth` - Test form e navigazione
4. **Fase 4**: Test personalizzati per nuove funzionalità

## 📞 Supporto

Se riscontri problemi:
1. Ferma immediatamente i test
2. Usa i comandi di pulizia
3. Riavvia Cursor se necessario
4. Ricomincia dal `test:safe`

**Ricorda**: La stabilità del sistema è prioritaria rispetto ai test automatici.
