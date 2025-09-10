# Guida Setup Completa

Questa guida ti accompagnerà passo-passo nella configurazione completa di bemyrider.

## 📋 Prerequisiti

### Software Richiesto
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** o **yarn** (incluso con Node.js)
- **Git** ([Download](https://git-scm.com/))

### Account di Servizio
- **GitHub** account (per il codice)
- **Supabase** account ([Registrati](https://supabase.com/))
- **Stripe** account ([Registrati](https://stripe.com/))
- **Vercel** account per deploy ([Registrati](https://vercel.com/))

## 🚀 Setup Passo-Passo

### 1. Clone del Repository

```bash
# Clona il repository
git clone https://github.com/bemyrider/bemyrider.git
cd bemyrider

# Installa le dipendenze
npm install
```

### 2. Configurazione Supabase

#### 2.1 Crea un Nuovo Progetto
1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Clicca "New Project"
3. Scegli un nome (es. "bemyrider-prod")
4. Seleziona la regione più vicina
5. Crea una password sicura per il database

#### 2.2 Ottieni le Chiavi API
1. Vai su **Settings** → **API**
2. Copia:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (`SUPABASE_SERVICE_ROLE_KEY`)

#### 2.3 Setup Database Schema
1. Vai su **SQL Editor**
2. Copia e incolla il contenuto da `supabase/schema.sql`
3. Esegui lo script per creare tabelle e policy

### 3. Configurazione Stripe

#### 3.1 Setup Account Base
1. Vai su [Stripe Dashboard](https://dashboard.stripe.com/)
2. Attiva **Test Mode** (toggle in alto a destra)
3. Vai su **Developers** → **API keys**
4. Copia:
   - **Publishable key** (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - **Secret key** (`STRIPE_SECRET_KEY`)

#### 3.2 Abilita Stripe Connect
1. Vai su **Connect** → **Settings**
2. Attiva **Express accounts**
3. Configura:
   - **Business type**: Marketplace
   - **Platform name**: bemyrider
   - **Support email**: il tuo email

#### 3.3 Configura Webhooks
1. Vai su **Developers** → **Webhooks**
2. Clicca **Add endpoint**
3. URL endpoint: `https://tuodominio.com/api/stripe/webhook`
4. Eventi da ascoltare:
   - `account.updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copia il **Signing secret** (`STRIPE_WEBHOOK_SECRET`)

### 4. Configurazione Environment Variables

Crea il file `.env.local`:

```bash
cp env.example .env.local
```

Compila tutte le variabili:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Stripe Configuration (TEST MODE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Setup Supabase Edge Functions

#### 5.1 Installa Supabase CLI
```bash
npm install -g @supabase/cli
```

#### 5.2 Login e Link Progetto
```bash
# Login
supabase login

# Link al progetto
supabase link --project-ref your-project-ref
```

#### 5.3 Deploy Edge Functions
```bash
# Deploy webhook function
supabase functions deploy stripe-webhook

# Configura environment variables per la function
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 6. Test Setup Locale

```bash
# Avvia il server di sviluppo
npm run dev
```

Apri http://localhost:3000 e verifica:
- ✅ La homepage si carica correttamente
- ✅ La registrazione funziona
- ✅ Il login funziona
- ✅ La dashboard rider si carica

### 7. Test Stripe Integration

#### 7.1 Test Onboarding
1. Registrati come rider
2. Vai alla dashboard rider
3. Clicca "Attiva Pagamenti"
4. Completa l'onboarding con dati di test:
   - **Business type**: Individual
   - **Country**: Italy
   - **Email**: test@example.com

#### 7.2 Test Webhook
```bash
# Installa Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks al tuo server locale
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In un altro terminale, trigger un evento di test
stripe trigger account.updated
```

## 🚀 Deploy in Produzione

### 1. Deploy su Vercel

#### 1.1 Connetti Repository
1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Clicca **New Project**
3. Importa il repository GitHub
4. Configura le environment variables

#### 1.2 Environment Variables Produzione
Copia tutte le variabili da `.env.local` ma sostituisci:
- URL con il dominio di produzione
- Chiavi Stripe con quelle di produzione (quando pronto)

#### 1.3 Deploy
```bash
# Automatic deploy su push a main
git push origin main
```

### 2. Configurazione Produzione Stripe

#### 2.1 Passa a Live Mode
1. Toggle **Live Mode** su Stripe
2. Aggiorna le chiavi API
3. Riconfigura il webhook con URL produzione

#### 2.2 Verifica Compliance
- Completa il **Business Profile**
- Accetta i **Terms of Service**
- Verifica l'**Identity**

## 🔍 Troubleshooting

### Problemi Comuni

#### Database Connection Error
```
Error: Could not connect to database
```
**Soluzione**: Verifica `DATABASE_URL` in `.env.local`

#### Stripe Webhook 401 Error
```
HTTP 401: Missing authorization header
```
**Soluzione**: Disabilita "Verify JWT" nelle impostazioni Edge Function

#### Build Error - Supabase Functions
```
Cannot find module 'https://deno.land/std@0.168.0/http/server.ts'
```
**Soluzione**: Le Supabase functions sono escluse dal build Next.js

#### CORS Error
```
Access to fetch blocked by CORS policy
```
**Soluzione**: Verifica che `NEXT_PUBLIC_APP_URL` sia corretto

### Log Debugging

#### Supabase Logs
```bash
# Visualizza logs Edge Functions
supabase functions logs stripe-webhook
```

#### Stripe Webhook Logs
1. Vai su **Developers** → **Webhooks**
2. Clicca sul tuo endpoint
3. Visualizza **Logs** per debugging

#### Next.js Logs
```bash
# Logs server di sviluppo
npm run dev

# Build logs
npm run build
```

## 📞 Supporto

Se incontri problemi:

1. **Controlla i logs** (browser console, server logs)
2. **Verifica environment variables**
3. **Consulta la documentazione** in `/docs`
4. **Apri un issue** su GitHub
5. **Contatta il supporto**: dev@bemyrider.it

## ✅ Checklist Finale

Prima di andare in produzione:

- [ ] Database schema creato e testato
- [ ] Autenticazione Supabase funzionante
- [ ] Stripe Connect configurato e testato
- [ ] Webhook Stripe configurato e funzionante
- [ ] Edge Functions deployate
- [ ] Environment variables configurate
- [ ] SSL certificato attivo
- [ ] Domain configurato
- [ ] Backup database configurato
- [ ] Monitoraggio attivo

## 📚 Documentazione Correlata

Dopo aver completato il setup, consulta questi documenti per:

### 🚀 Per Utenti
- **[Guida Onboarding](./onboarding-utente.md)** - Come registrarsi e utilizzare la piattaforma
- **[Flussi Utente](./flussi-utente.md)** - Come funziona il processo di prenotazione
- **[FAQ](./faq.md)** - Risposte alle domande più comuni

### 🔧 Per Sviluppatori
- **[Architettura](./architettura.md)** - Diagramma architetturale e schema database completo
- **[Contributing Guide](./CONTRIBUTING.md)** - Come contribuire al progetto
- **[Testing](./testing.md)** - Strategia di testing e QA
- **[Runbook Operativo](./runbook.md)** - Monitoraggio e manutenzione produzione

### 📊 Operazioni
- **[Deployment](./../DEPLOYMENT.md)** - Guida deployment produzione
- **[Roadmap](./ROADMAP.md)** - Pianificazione sviluppo futuro

**Congratulazioni! 🎉 bemyrider è ora configurato e pronto per l'uso!**

### 🎯 Prossimi Passi
1. **Testa l'applicazione** seguendo la [strategia di testing](./testing.md)
2. **Deploy in produzione** usando la [guida deployment](./../DEPLOYMENT.md)
3. **Monitora le performance** con il [runbook operativo](./runbook.md)
4. **Contribuisci al progetto** seguendo la [contributing guide](./CONTRIBUTING.md)
