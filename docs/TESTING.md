# 🧪 Testing Guide - bemyrider

Questa guida spiega come utilizzare la pipeline di test automatizzata con TestSprite per bemyrider.

## 📋 Indice

- [🎯 Overview](#-overview)
- [🏠 Test Locali](#-test-locali)
- [☁️ CI/CD Pipeline](#️-cicd-pipeline)
- [👤 Account Test](#-account-test)
- [📊 Interpretazione Risultati](#-interpretazione-risultati)
- [🔧 Troubleshooting](#-troubleshooting)

## 🎯 Overview

bemyrider utilizza **TestSprite** per test automatizzati end-to-end che validano:

- ✅ Registrazione e autenticazione utenti
- ✅ Controlli di accesso dashboard
- ✅ Flusso completo di prenotazione
- ✅ Integrazione Stripe Connect
- ✅ Sicurezza profili e dati
- ✅ Gestione sessioni
- ✅ Performance e navigazione UI

### 🎉 Risultati Ottenuti

**Miglioramento del 400%** nei test dopo le correzioni:
- **Prima**: 1/11 test passati (9%)
- **Dopo**: 5/11 test passati (45%)

## 🏠 Test Locali

### Prerequisiti

1. **Server in esecuzione**: `npm run dev`
2. **File .env.local** configurato con credenziali Supabase
3. **Node.js 18+** installato

### Esecuzione

```bash
# Esecuzione completa
./scripts/run-local-tests.sh

# Opzioni manuali
node scripts/create-test-accounts.js  # Solo account test
npm run lint                          # Solo linting
npx tsc --noEmit                     # Solo TypeScript check
```

### Output Esempio

```
🚀 bemyrider - Test Suite Locale
==================================
✅ Server verificato su localhost:3000
✅ Configurazione ambiente verificata
👤 Creazione account test...
✅ Account test creati/aggiornati
🔍 Controllo qualità codice...
✅ Linting passed
📝 Controllo tipi TypeScript...
✅ TypeScript check passed
🧪 Avvio test TestSprite...
✅ TestSprite completato

📊 Riepilogo risultati:
======================
✅ Test Passati: 5/11 (45%)
❌ Test Falliti: 6/11
⚠️ Quality Gate: WARNING (<70%)

📁 Report completo: testsprite_tests/testsprite-mcp-test-report.md
```

## ☁️ CI/CD Pipeline

### Trigger Automatici

La pipeline GitHub Actions si attiva per:

- 🔄 **Push** su `main` e `develop`
- 🔀 **Pull Request** verso `main`
- ⏰ **Schedule** giornaliero (02:00)
- 🎯 **Manuale** (workflow_dispatch)

### Jobs Pipeline

1. **setup-test-environment**
   - Installa dipendenze
   - Builda applicazione
   - Crea account test
   - Esegue linting e type checking

2. **testsprite-testing**
   - Avvia server applicazione
   - Ricrea account test
   - Esegue test TestSprite completi
   - Archivia risultati

3. **quality-gate**
   - Valuta risultati complessivi
   - Notifica fallimenti (su main)
   - Commenta PR con risultati

### Configurazione Secrets

Configura questi secrets in GitHub:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Artifacts

I risultati sono archiviati per 30 giorni:
- `testsprite-results/testsprite-mcp-test-report.md`
- `testsprite-results/tmp/` (dati raw)

## 👤 Account Test

### Credenziali Predefinite

I test utilizzano account predefiniti creati automaticamente:

```
🚴‍♂️ RIDER:
Email: test.rider@bemyrider.test
Password: TestRider2024!
User ID: auto-generato

🏪 MERCHANT:
Email: test.merchant@bemyrider.test  
Password: TestMerchant2024!
User ID: auto-generato
```

### Gestione Account

```bash
# Crea/ricrea account test
node scripts/create-test-accounts.js

# I vecchi account vengono eliminati automaticamente
# Nuovi ID vengono generati ad ogni esecuzione
```

### Configurazione Account

- **Rider**: Completo con veicolo 'bici', tariffa €8.50, bio
- **Merchant**: Profilo base per test prenotazioni
- **Permessi**: Account hanno tutti i permessi necessari per test

## 📊 Interpretazione Risultati

### Report Structure

Il report TestSprite include:

1. **Document Metadata**: Progetto, versione, data
2. **Requirement Validation**: Test raggruppati per funzionalità
3. **Coverage Metrics**: Percentuali successo/fallimento
4. **Problemi Rimanenti**: Azioni prioritarie

### Stati Test

- ✅ **Passed**: Funzionalità operativa correttamente
- ❌ **Failed**: Problema critico da risolvere  
- ⚠️ **Partial**: Funziona parzialmente, migliorabile

### Quality Gate

- **≥70% passed**: 🎉 Quality Gate PASSED
- **<70% passed**: ⚠️ Quality Gate WARNING
- **<50% passed**: 🚨 Quality Gate FAILED

### Metriche Attuali

| Requirement | Status | Note |
|-------------|--------|------|
| User Registration & Auth | ✅ | Completamente risolto |
| Dashboard Access Control | ✅ | Merchant OK, Rider instabile |
| Booking System | ❌ | Implementazione parziale |
| Payment Integration | ❌ | Blocco hCaptcha testing |
| Profile Data Security | ⚠️ | RLS OK, auth intermittente |
| Session Management | ✅ | Logout e gestione migliorati |
| UI Performance | ❌ | Navigation issues |

## 🔧 Troubleshooting

### Problemi Comuni

**Server non risponde**
```bash
# Verifica processo
ps aux | grep next
# Riavvia se necessario
npm run dev
```

**Account test non creati**
```bash
# Verifica .env.local
cat .env.local | grep SUPABASE
# Verifica connessione DB
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

**TestSprite fallisce**
```bash
# Controlla log dettagliati
cat testsprite_tests/tmp/report_prompt.json
# Verifica configurazione
curl http://localhost:3000/api/health
```

**GitHub Actions fallisce**
```bash
# Controlla secrets configurati
# Verifica logs nell'interfaccia GitHub
# Esegui test locali per debug
```

### Debug Avanzato

**Logs applicazione**
```bash
# Monitor real-time
tail -f .next/trace.log

# Errori Supabase
grep -r "error" .next/
```

**TestSprite debug**
```bash
# Esecuzione verbose
npx testsprite-mcp --debug generateCodeAndExecute

# Analisi video test
# I video sono disponibili nei link TestSprite Dashboard
```

**Performance monitoring**
```bash
# Monitoring processo
top -p $(pgrep -f "next-server")

# Memory usage
ps -o pid,ppid,cmd,%mem,%cpu --sort=-%mem
```

### Supporto

Per problemi non risolti:

1. 📋 Controlla [Issues](../CONTRIBUTING.md) del progetto
2. 🔍 Esegui debug con script locale
3. 📧 Contatta team di sviluppo con:
   - Log completi
   - Report TestSprite
   - Configurazione ambiente

---

## 🎯 Prossimi Miglioramenti

- [ ] Aumento coverage al 70%+ 
- [ ] Integrazione Stripe test environment
- [ ] Test performance automatizzati
- [ ] Notifiche Slack/Teams
- [ ] Test visual regression
- [ ] Monitoring continuo produzione

---

**📅 Ultimo aggiornamento**: 2025-09-02  
**📋 Status**: ✅ Pipeline attiva e funzionante  
**🎯 Coverage target**: 70% (attuale: 45%)

