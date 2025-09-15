# Supabase Edge Functions

Questa cartella contiene le Edge Functions per bemyrider.

## 📁 Struttura

```
supabase/functions/
├── README.md                    # Questo file
└── stripe-webhook/             # Function per webhook Stripe
    └── index.ts                # Gestisce eventi account.updated
```

## 🚀 Quick Start

### 1. Setup

```bash
# Installa Supabase CLI
npm install -g @supabase/cli

# Login
supabase login

# Link al progetto
supabase link --project-ref your-project-ref
```

### 2. Deploy

```bash
# Deploy tutte le functions
supabase functions deploy

# Deploy function specifica
supabase functions deploy stripe-webhook
```

### 3. Configura Secrets

```bash
***REMOVED***
supabase secrets set STRIPE_SECRET_KEY=***REMOVED***...
supabase secrets set STRIPE_WEBHOOK_SECRET=***REMOVED***...

***REMOVED***
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set ***REMOVED***=eyJ...
```

## 🔧 stripe-webhook Function

### Scopo

Gestisce webhook Stripe per aggiornamenti automatici dello stato onboarding rider.

### URL

```
https://your-project-ref.supabase.co/functions/v1/stripe-webhook
```

### Eventi Gestiti

- `account.updated`: Aggiorna `stripe_onboarding_complete` nel database

### Environment Variables

- `STRIPE_SECRET_KEY`: Chiave segreta Stripe
- `STRIPE_WEBHOOK_SECRET`: Secret per verifica firma webhook
- `SUPABASE_URL`: URL progetto Supabase
- `***REMOVED***`: Service role key per database

### Configurazione Stripe

1. Vai su [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Aggiungi endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Eventi: `account.updated`
4. Copia signing secret

### Configurazione Supabase

1. Dashboard → Edge Functions → stripe-webhook
2. **Disabilita "Verify JWT"** (importante!)
3. Verifica che sia attiva

## 🧪 Testing

### Test Locale

```bash
# Avvia function localmente
supabase functions serve stripe-webhook --no-verify-jwt

# Test con curl
curl -X POST http://localhost:54321/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=test,v1=test" \
  -d '{"type":"account.updated","data":{"object":{"id":"acct_test"}}}'
```

### Test con Stripe CLI

```bash
# Forward webhook events
stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhook

# Trigger test event
stripe trigger account.updated
```

## 📊 Monitoring

### Logs

```bash
# Visualizza logs
supabase functions logs stripe-webhook

# Logs in tempo reale
supabase functions logs stripe-webhook --follow
```

### Metriche

- Dashboard Supabase → Edge Functions → stripe-webhook
- Visualizza invocations, errors, duration

## 🔍 Troubleshooting

### Errori Comuni

**401 Missing authorization header**

- Soluzione: Disabilita "Verify JWT" nelle impostazioni

**400 Webhook signature verification failed**

- Soluzione: Verifica `STRIPE_WEBHOOK_SECRET`

**404 Rider not found**

- Soluzione: Verifica che `stripe_account_id` esista in `riders_details`

**500 Supabase configuration error**

- Soluzione: Configura `SUPABASE_URL` e `***REMOVED***`

### Debug

```bash
# Verifica secrets
supabase secrets list

# Verifica deployment
supabase functions list

# Test connettività
curl -X GET https://your-project.supabase.co/functions/v1/stripe-webhook
```

## 📚 Documentazione

Per documentazione completa:

- [docs/EDGE-FUNCTIONS.md](../../docs/EDGE-FUNCTIONS.md)
- [docs/API.md](../../docs/API.md)
- [docs/SETUP.md](../../docs/SETUP.md)

## 🆘 Supporto

- **Email**: dev@bemyrider.it
- **GitHub**: [bemyrider/bemyrider](https://github.com/bemyrider/bemyrider)
- **Supabase Docs**: [Edge Functions](https://supabase.com/docs/guides/functions)
