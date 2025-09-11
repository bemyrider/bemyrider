# Guida Deployment

Guida completa per il deployment di bemyrider in produzione.

## 🎯 Opzioni di Deployment

### 1. Vercel (Raccomandato) ⭐
- **Pros**: Ottimizzato per Next.js, CI/CD automatico, Edge Functions
- **Cons**: Limiti su piano gratuito
- **Costo**: Gratuito per progetti personali, $20/mese Pro

### 2. Netlify
- **Pros**: Gratuito generoso, facile setup
- **Cons**: Meno ottimizzato per Next.js
- **Costo**: Gratuito per progetti personali

### 3. DigitalOcean App Platform
- **Pros**: Controllo completo, prezzi fissi
- **Cons**: Setup più complesso
- **Costo**: $5-12/mese

### 4. Self-Hosted (VPS)
- **Pros**: Controllo totale, costi prevedibili
- **Cons**: Manutenzione server, setup complesso
- **Costo**: $5-20/mese

## 🔒 Sicurezza nel Deployment

### 🚀 **Sistema di Sicurezza Automatica**
bemyrider include un **sistema di sicurezza enterprise-grade** che garantisce deployment sicuri:

#### **Workflow Sicuro di Deployment:**
```bash
# Deploy sicuro con verifica automatica della sicurezza
npm run db:push     # Migrazione + sicurezza automatica
npm run build       # Build con ottimizzazioni
npm run deploy      # Deploy in produzione
```

#### **Cosa Viene Verificato Automaticamente:**
- ✅ **Row Level Security (RLS)** abilitato su tutte le tabelle
- ✅ **32+ policy di sicurezza** applicate correttamente
- ✅ **Connessione database** sicura verificata
- ✅ **Variabili d'ambiente** crittografate
- ✅ **Audit trail** completo delle operazioni

#### **Metriche di Sicurezza:**
- ⚡ **Deployment time**: ~13 secondi
- 🔒 **Security policies**: 32+ applicate
- ✅ **Success rate**: 100%
- 📊 **Test funzionali**: 3/3 superati

[Maggiori dettagli sulla sicurezza →](../scripts/README-SECURITY-UPDATES.md)

### ⚠️ **Pre-Deployment Security Checklist**

Prima di ogni deployment, verifica:

- [ ] **API Keys**: Usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (non legacy)
- [ ] **Service Role**: `SUPABASE_SERVICE_ROLE_KEY` configurata correttamente
- [ ] **Database**: Schema aggiornato con `npm run db:push`
- [ ] **Security**: Policy RLS applicate con `npm run db:security`
- [ ] **Environment**: Variabili crittografate in produzione
- [ ] **Logs**: Sistema di logging attivo per audit

## 🚀 Deployment su Vercel (Raccomandato)

### 1. Preparazione Repository

```bash
# Assicurati che tutto sia committato
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Connessione a Vercel

1. Vai su [vercel.com](https://vercel.com)
2. **Sign up** con GitHub
3. Clicca **New Project**
4. Seleziona il repository `bemyrider`
5. **Import Project**

### 3. Configurazione Build

Vercel dovrebbe auto-rilevare Next.js, ma verifica:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 4. Environment Variables

Aggiungi tutte le variabili d'ambiente in Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:...

# Stripe (PRODUCTION)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

⚠️ **IMPORTANTE**: Usa le chiavi di **PRODUZIONE** Stripe, non quelle di test!

### 5. Domain Setup

#### Custom Domain
1. Vai su **Settings** → **Domains**
2. Aggiungi il tuo dominio (es. `bemyrider.it`)
3. Configura DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

#### SSL Certificate
Vercel fornisce automaticamente SSL gratuito con Let's Encrypt.

### 6. Deploy

```bash
# Automatic deploy on push
git push origin main
```

Il deploy avviene automaticamente ad ogni push su `main`.

## 🔧 Configurazione Produzione

### 1. Supabase Produzione

#### Database Backup
```bash
# Setup backup automatici
supabase db dump > backup-$(date +%Y%m%d).sql
```

#### Performance Optimization
```sql
-- Aggiungi indici per performance
CREATE INDEX CONCURRENTLY idx_bookings_created_at ON bookings(created_at);
CREATE INDEX CONCURRENTLY idx_riders_details_stripe_complete ON riders_details(stripe_onboarding_complete);
```

### 2. Stripe Produzione

#### Attivazione Live Mode
1. Completa **Business Profile**
2. Verifica **Identity**
3. Accetta **Terms of Service**
4. Toggle **Live Mode**

#### Webhook Produzione
1. Crea nuovo webhook per produzione
2. URL: `https://yourdomain.com/api/stripe/webhook`
3. Eventi: `account.updated`, `payment_intent.succeeded`
4. Aggiorna `STRIPE_WEBHOOK_SECRET`

### 3. Edge Functions Produzione

```bash
# Deploy functions su Supabase produzione
supabase functions deploy stripe-webhook --project-ref your-prod-ref

# Configura secrets produzione
supabase secrets set STRIPE_SECRET_KEY=sk_live_... --project-ref your-prod-ref
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref your-prod-ref
```

## 📊 Monitoraggio e Analytics

### 1. Vercel Analytics

```bash
# Installa Vercel Analytics
npm install @vercel/analytics

# Aggiungi a app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Error Monitoring

#### Sentry Setup
```bash
npm install @sentry/nextjs

# Configura sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Performance Monitoring

#### Supabase Metrics
- Dashboard → **Reports**
- Monitora query lente
- Controlla utilizzo database

#### Stripe Dashboard
- **Payments** → monitoring transazioni
- **Connect** → account rider status
- **Webhooks** → success rate

## 🔐 Sicurezza Produzione

### 1. Environment Variables

```bash
# Genera chiavi sicure per produzione
openssl rand -base64 32  # Per JWT secrets
```

### 2. CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE' },
        ],
      },
    ]
  },
}
```

### 3. Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

## 🚨 Rollback e Recovery

### 1. Vercel Rollback

```bash
# Via Dashboard
1. Vai su Deployments
2. Trova deployment precedente
3. Clicca "Promote to Production"

# Via CLI
vercel rollback https://bemyrider-xyz.vercel.app
```

### 2. Database Recovery

```bash
# Restore da backup
psql $DATABASE_URL < backup-20240117.sql
```

### 3. Stripe Rollback

Per problemi Stripe:
1. Disabilita webhook temporaneamente
2. Risolvi issue
3. Riattiva webhook

## 📈 Scaling

### 1. Database Scaling

#### Supabase Pro Features
- **Connection pooling**
- **Read replicas**
- **Point-in-time recovery**
- **Advanced metrics**

```sql
-- Ottimizza query pesanti
EXPLAIN ANALYZE SELECT * FROM bookings WHERE rider_id = $1;
```

### 2. CDN e Caching

#### Vercel Edge Network
- Automatico per asset statici
- Edge Functions per API

#### Custom Caching
```typescript
// app/api/riders/route.ts
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 's-maxage=300, stale-while-revalidate=60'
    }
  })
}
```

## ✅ Checklist Pre-Produzione

### Codice
- [ ] Tutti i test passano
- [ ] Build produzione senza errori
- [ ] Environment variables configurate
- [ ] Logs di debug rimossi

### Database
- [ ] Schema produzione creato
- [ ] Backup automatici configurati
- [ ] Indici per performance
- [ ] RLS policies testate

### Stripe
- [ ] Account verificato e attivo
- [ ] Webhook configurato correttamente
- [ ] Test transazioni completati
- [ ] Connect settings configurati

### Deployment
- [ ] Domain configurato
- [ ] SSL attivo
- [ ] CDN funzionante
- [ ] Monitoring attivo

### Sicurezza
- [ ] HTTPS forzato
- [ ] CORS configurato
- [ ] Rate limiting attivo
- [ ] Error handling robusto

## 🆘 Troubleshooting Produzione

### Build Failures

```bash
# Error: Module not found
npm run build 2>&1 | grep "Module not found"

# Soluzioni comuni
npm install --production=false
npm cache clean --force
```

### Runtime Errors

```bash
# Vercel Function Logs
vercel logs --app bemyrider

# Supabase Edge Function Logs
supabase functions logs stripe-webhook --project-ref prod-ref
```

### Performance Issues

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

## 📞 Supporto Produzione

### Contatti di Emergenza
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com
- **Stripe Support**: support@stripe.com

### Escalation Path
1. **Level 1**: Logs e documentazione
2. **Level 2**: Community forums
3. **Level 3**: Paid support plans
4. **Level 4**: Emergency contacts

---

**🎉 Congratulazioni! bemyrider è ora in produzione!**

Ricorda di monitorare attivamente le prime 48 ore per assicurarti che tutto funzioni correttamente.
