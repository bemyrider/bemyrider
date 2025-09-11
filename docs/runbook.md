# 🚨 Runbook Operativo - bemyrider

Guida operativa completa per monitoraggio, manutenzione e risoluzione problemi di bemyrider in produzione.

## 📋 Indice

- [Monitoraggio Sistema](#-monitoraggio-sistema)
- [🔒 Operazioni di Sicurezza](#-operazioni-di-sicurezza)
- [Alert e Notifiche](#-alert-e-notifiche)
- [Procedure di Manutenzione](#-procedure-di-manutenzione)
- [Troubleshooting](#-troubleshooting)
- [Disaster Recovery](#-disaster-recovery)
- [Backup e Restore](#-backup-e-restore)
- [Scalabilità](#-scalabilità)
- [Contatti Emergenza](#-contatti-emergenza)

## 📊 Monitoraggio Sistema

### Dashboard Principali

#### Vercel Dashboard
- **Performance**: Response times, throughput, error rates
- **Uptime**: Service availability (target: 99.9%)
- **Functions**: Edge function execution times
- **Analytics**: User traffic patterns

#### Supabase Dashboard
- **Database**: Query performance, connection count
- **Storage**: File upload/download metrics
- **Auth**: Failed login attempts, user registrations
- **Edge Functions**: Execution logs and errors

#### Stripe Dashboard
- **Payments**: Success rates, failed payments
- **Connect**: Account status, onboarding completion
- **Webhooks**: Delivery success, retry attempts

### Metriche Chiave

#### Performance Metrics
```yaml
# Target thresholds
response_time_p95: < 1000ms
error_rate: < 1%
uptime: > 99.9%
database_query_time: < 200ms
```

## 🔒 Operazioni di Sicurezza

### 🚀 **Sistema di Sicurezza Automatica**

bemyrider utilizza un **sistema di sicurezza enterprise-grade** completamente automatico:

#### **Metriche di Sicurezza da Monitorare:**
```yaml
# Security Health Metrics
security_deployment_time: < 15s
rls_policies_active: 32+
security_test_pass_rate: 100%
database_access_control: enabled
audit_trail_active: enabled
```

#### **Comandi Operativi di Sicurezza:**
```bash
# Verifica stato sicurezza (daily check)
npm run db:security

# Applicazione emergenziale sicurezza
npm run db:push

# Verifica manuale policy
npm run db:security:legacy

# Check log sicurezza
tail -f logs/security-deploy.log
```

### 🛡️ **Procedure di Sicurezza Routine**

#### **Daily Security Check:**
```bash
# 1. Verifica stato database
npm run db:security

# 2. Controlla log sicurezza
cat logs/security-deploy.log | tail -20

# 3. Verifica metriche Supabase
# - RLS enabled su tutte le tabelle
# - Policy attive: 32+
# - Nessun errore di sicurezza
```

#### **Post-Deployment Security Verification:**
```bash
# Dopo ogni deploy verificare:
npm run db:security

# Expected output:
# ✅ Connessione al database stabilita
# ✅ Test funzionali superati: 3/3
# ✅ Policy stimate applicate: ~33
# 🎉 Deployment sicurezza completato con successo
```

### 🚨 **Alert di Sicurezza**

#### **Trigger di Alert:**
- **Security deployment failure**: `npm run db:security` fallisce
- **RLS policies missing**: Meno di 30 policy attive
- **Database access violation**: Tentativi di accesso non autorizzato
- **API key exposure**: Chiavi API rilevate in log pubblici

#### **Risposta a Incidenti di Sicurezza:**
```bash
# 1. Isola il problema
git log --oneline -10  # Verifica recenti modifiche

# 2. Applica sicurezza massima
npm run db:security

# 3. Verifica isolamento
# - Controlla accessi database
# - Verifica policy RLS
# - Check log di sicurezza

# 4. Notifica team
# - Documenta incidente
# - Pianifica remediation
```

### 🔐 **Gestione Chiavi API**

#### **Rotazione Chiavi di Emergenza:**
```bash
# 1. Genera nuove chiavi Supabase
# Vai su Supabase Dashboard → Settings → API

# 2. Aggiorna .env.local
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=nuova_chiave
SUPABASE_SERVICE_ROLE_KEY=nuova_service_key

# 3. Test connessione
npm run db:security

# 4. Deploy con nuove chiavi
npm run build
npm run deploy
```

#### **Audit Chiavi API:**
```bash
# Verifica chiavi in uso
grep -r "SUPABASE_" .env* --exclude-dir=node_modules

# Check expiration dates
# Supabase Dashboard → Settings → API → Key Details
```

### 📊 **Monitoraggio Sicurezza Avanzato**

#### **Query di Monitoraggio Database:**
```sql
-- Verifica RLS abilitato
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Conta policy attive
SELECT COUNT(*) as active_policies
FROM pg_policies
WHERE schemaname = 'public';

-- Verifica accessi recenti (audit)
SELECT *
FROM audit_log
WHERE action = 'SECURITY_VIOLATION'
ORDER BY created_at DESC
LIMIT 10;
```

#### **Log Analysis:**
```bash
# Analizza pattern di sicurezza
grep "SECURITY" logs/security-deploy.log | tail -20

# Check errori sicurezza
grep "ERROR" logs/security-deploy.log | grep -i security

# Monitora performance sicurezza
grep "Deployment sicurezza completato" logs/security-deploy.log | tail -7
```

### 🛠️ **Troubleshooting Sicurezza**

#### **Problema: Security deployment fallisce**
```bash
# Diagnosi
npm run db:security 2>&1 | tee security-debug.log

# Check connessione database
ping your-project-ref.supabase.co

# Verifica variabili ambiente
echo $SUPABASE_SERVICE_ROLE_KEY | head -c 20
```

#### **Problema: Policy RLS mancanti**
```bash
# Force reapply
rm -rf logs/security-deploy.log
npm run db:security

# Manual verification
npm run db:security:legacy
```

#### **Problema: Accesso non autorizzato**
```bash
# Emergency lockdown
npm run db:security

# Check recent changes
git log --oneline --since="1 hour ago"

# Audit database access
# Supabase Dashboard → Database → Query → Recent Queries
```

### 📞 **Contatti Sicurezza**

#### **Incident Response Team:**
- **Lead Security**: [Nome Contatto]
- **Database Admin**: [Nome Contatto]
- **DevOps Lead**: [Nome Contatto]

#### **Procedure di Escalation:**
1. **Livello 1**: Try documented solutions
2. **Livello 2**: Contact DevOps Lead
3. **Livello 3**: Full incident response team

[Maggiori dettagli sulla sicurezza →](../scripts/README-SECURITY-UPDATES.md)

#### Business Metrics
```yaml
# Daily active users
dau_target: > 1000

# Conversion rates
rider_onboarding_completion: > 70%
merchant_first_booking: > 60%

# Revenue metrics
monthly_recurring_revenue: > €5000
average_order_value: > €45
```

### Health Checks

#### Application Health
```bash
# Vercel deployment health
curl -f https://bemyrider.it/api/health

# Database connectivity
curl -f https://bemyrider.it/api/health/database

# External services
curl -f https://bemyrider.it/api/health/stripe
curl -f https://bemyrider.it/api/health/supabase
```

#### Automated Health Checks
```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const checks = {
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      stripe: await checkStripe(),
      supabase: await checkSupabase(),
      storage: await checkStorage()
    }
  };

  const isHealthy = Object.values(checks.services).every(service => service.status === 'healthy');

  res.status(isHealthy ? 200 : 503).json(checks);
}

async function checkDatabase() {
  try {
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.from('profiles').select('count').limit(1);
    return { status: error ? 'unhealthy' : 'healthy', latency: Date.now() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

## 🚨 Alert e Notifiche

### Configurazione Alert

#### Vercel Alerts
```yaml
# .vercel/project.json
{
  "alerts": [
    {
      "type": "error_rate",
      "threshold": 5,
      "period": "5m",
      "channels": ["slack", "email"]
    },
    {
      "type": "response_time",
      "threshold": 2000,
      "period": "5m",
      "channels": ["slack"]
    }
  ]
}
```

#### Supabase Alerts
- **Database CPU**: > 80% per 5 minuti
- **Connection Count**: > 90% del limite
- **Failed Auth**: > 10 tentativi/minuto da stesso IP
- **Storage Usage**: > 85% capacity

#### Stripe Alerts
- **Payment Failures**: > 5% failure rate
- **Webhook Failures**: > 3 retry attempts
- **Account Issues**: Onboarding failures

### Canali di Notifica

#### Slack Integration
```yaml
# Alert channels
critical_alerts: "#ops-critical"
performance_alerts: "#ops-performance"
business_alerts: "#business-metrics"
```

#### Email Notifications
- **Critical Issues**: Tech lead + Dev team
- **Performance Degradation**: Dev team only
- **Business Metrics**: Product + Business teams

### Escalation Procedure

#### Livello 1: Automatic Alerts (0-5 min)
- Error rate > 5%
- Response time > 2s
- Service unavailable

#### Livello 2: Manual Investigation (5-15 min)
- Database connection issues
- Payment processing failures
- User authentication problems

#### Livello 3: Team Response (15-60 min)
- Multiple service failures
- Data corruption detected
- Security incidents

#### Livello 4: Emergency (1+ hour)
- Complete system outage
- Data loss incidents
- Security breaches

## 🔧 Procedure di Manutenzione

### Manutenzione Programmata

#### Database Maintenance
```sql
-- Weekly maintenance script
VACUUM ANALYZE;
REINDEX DATABASE bemyrider;
ANALYZE;

-- Update statistics
ANALYZE prenotazioni;
ANALYZE riders_details;
ANALYZE esercenti;
```

#### Cache Management
```bash
# Redis cache cleanup (if implemented)
redis-cli FLUSHDB

# CDN cache invalidation
vercel revalidate
```

#### Log Rotation
```bash
# Vercel logs auto-rotate
# Supabase logs: 30-day retention
# Application logs: ELK stack rotation
```

### Aggiornamenti di Sicurezza

#### Dependency Updates
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Test after updates
npm run test

# Deploy if tests pass
vercel --prod
```

#### Security Patches
1. **Monitor CVEs**: Subscribe to security newsletters
2. **Test Patches**: Deploy to staging first
3. **Rollback Plan**: Prepare rollback procedure
4. **Deploy**: Apply patches during maintenance window

### Database Optimization

#### Query Optimization
```sql
-- Identify slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_prenotazioni_status_date
ON prenotazioni(status, created_at);

CREATE INDEX CONCURRENTLY idx_riders_location
ON riders_details USING GIST(ST_Point(longitude, latitude));
```

#### Connection Pooling
```typescript
// lib/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

## 🔍 Troubleshooting

### Problemi Comuni e Soluzioni

#### 1. Alta Latenza Database
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Kill long-running queries
SELECT pg_cancel_backend(pid) FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 minutes';

-- Check table bloat
SELECT schemaname, tablename, n_dead_tup, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

**Soluzioni:**
- Aggiungi indici mancanti
- Ottimizza query lente
- Aumenta pool di connessioni
- Considera read replicas

#### 2. Errori Stripe Webhook
```typescript
// Check webhook delivery
const webhooks = await stripe.webhooks.list({
  limit: 10
});

// Verify signature
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Soluzioni:**
- Verifica endpoint URL
- Controlla webhook secret
- Implementa idempotency
- Aggiungi retry logic

#### 3. Timeout Applicazione
```typescript
// pages/api/timeout-example.ts
export default async function handler(req, res) {
  // Set timeout for long operations
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s

  try {
    const result = await fetch('https://api.external-service.com', {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    res.status(200).json(result);
  } catch (error) {
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'Request timeout' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

#### 4. Problemi Autenticazione
```typescript
// Debug auth issues
const { data: { session }, error } = await supabase.auth.getSession();

if (error) {
  console.error('Auth error:', error);
}

// Check RLS policies
const { data, error: rlsError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);

if (rlsError) {
  console.error('RLS policy error:', rlsError);
}
```

#### 5. Memory Leaks
```typescript
// Monitor memory usage
if (typeof window !== 'undefined') {
  console.log('Memory usage:', performance.memory);

  // Force garbage collection in development
  if (process.env.NODE_ENV === 'development') {
    if (window.gc) {
      window.gc();
    }
  }
}
```

### Debug Tools

#### Vercel CLI
```bash
# View logs
vercel logs --app bemyrider

# Check environment
vercel env ls

# Redeploy
vercel --prod
```

#### Supabase CLI
```bash
# View function logs
supabase functions logs stripe-webhook

# Check database status
supabase db status

# Reset database (dangerous!)
supabase db reset
```

#### Database Debugging
```sql
-- Enable query logging
SET log_statement = 'all';
SET log_duration = 'on';

-- View active queries
SELECT pid, query, state, wait_event
FROM pg_stat_activity
WHERE state = 'active';

-- Check locks
SELECT relation::regclass, mode, granted
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid;
```

## 🚑 Disaster Recovery

### Scenari di Disaster

#### 1. Database Corruption
```bash
# Stop application
vercel scale --app bemyrider 0

# Restore from backup
pg_restore -d bemyrider backup.sql

# Verify data integrity
psql -d bemyrider -c "SELECT count(*) FROM profiles;"

# Restart application
vercel scale --app bemyrider 1
```

#### 2. Service Outage
```bash
# Check service status
curl -f https://bemyrider.it/api/health

# If down, check Vercel status
vercel status

# Redeploy if needed
vercel --prod --force

# Check external services
curl -f https://api.stripe.com/healthcheck
```

#### 3. Security Breach
1. **Isolate**: Disconnetti sistemi compromessi
2. **Assess**: Identifica scope della breach
3. **Contain**: Cambia credenziali compromesse
4. **Recover**: Ripristina da backup sicuro
5. **Notify**: Informa utenti e autorità se necessario

### Recovery Time Objectives (RTO)
- **Critical Services**: < 1 hour
- **Database**: < 4 hours
- **Full System**: < 8 hours

### Recovery Point Objectives (RPO)
- **User Data**: < 1 hour data loss
- **Transaction Data**: < 5 minutes data loss
- **Analytics Data**: < 24 hours data loss

## 💾 Backup e Restore

### Strategia Backup

#### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="bemyrider_backup_$DATE.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to cloud storage
aws s3 cp $BACKUP_FILE.gz s3://bemyrider-backups/

# Cleanup old backups (keep last 30 days)
find /backups -name "*.gz" -mtime +30 -delete
```

#### File Storage Backups
```bash
# Supabase storage backup
supabase storage cp bucket_name s3://backup-bucket --recursive

# User uploaded files
aws s3 sync s3://bemyrider-uploads s3://bemyrider-backups/uploads
```

### Procedure Restore

#### Database Restore
```bash
# Create new database
createdb bemyrider_restore

# Restore from backup
pg_restore -d bemyrider_restore backup.sql

# Verify restore
psql -d bemyrider_restore -c "SELECT count(*) FROM profiles;"

# Switch to restored database
# Update environment variables
```

#### Application Rollback
```bash
# View deployment history
vercel deployments ls

# Rollback to previous version
vercel rollback [deployment-id]

# Verify rollback success
curl -f https://bemyrider.it/api/health
```

## 📈 Scalabilità

### Monitoraggio Performance

#### Application Metrics
```typescript
// pages/api/metrics.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const metrics = {
    timestamp: Date.now(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    version: process.version,
    environment: process.env.NODE_ENV
  };

  res.status(200).json(metrics);
}
```

#### Database Metrics
```sql
-- Connection usage
SELECT count(*) as active_connections FROM pg_stat_activity;

-- Table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Scaling Strategies

#### Horizontal Scaling
```typescript
// Load balancer configuration
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Worker process
  const app = require('./server');
  app.listen(3000);
}
```

#### Database Scaling
```sql
-- Add read replica
CREATE PUBLICATION bemyrider_pub FOR ALL TABLES;

-- On replica
CREATE SUBSCRIPTION bemyrider_sub
CONNECTION 'host=primary-db dbname=bemyrider user=replica'
PUBLICATION bemyrider_pub;

-- Connection routing
const readPool = new Pool(readConfig);
const writePool = new Pool(writeConfig);
```

#### CDN Optimization
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['bemyrider.it'],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300' }
        ],
      },
    ];
  },
};
```

## 📞 Contatti Emergenza

### Team di Risposta
- **Tech Lead**: Giorgio Di Martino - +39 123 456 7890
- **DevOps**: [Nome] - +39 123 456 7891
- **Security**: [Nome] - +39 123 456 7892

### Fornitori Critici
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com
- **Stripe Support**: support@stripe.com
- **AWS Support**: aws@amazon.com

### Procedure di Escalation

#### Durante Orari Lavorativi (9:00-18:00)
1. **Slack**: Notifica immediata al canale #ops-critical
2. **Call**: Chiamata al tech lead entro 5 minuti
3. **Team**: Attivazione team di risposta entro 15 minuti

#### Fuori Orari Lavorativi
1. **Phone**: Chiamata diretta al tech lead
2. **SMS**: Notifica via SMS per alert critici
3. **On-call**: Rotazione settimanale del developer di turno

### Checklist Disaster Recovery

#### Immediate Actions (0-5 min)
- [ ] Valutare impatto e scope
- [ ] Notificare team di risposta
- [ ] Attivare monitoraggio aggiuntivo
- [ ] Comunicare con utenti se necessario

#### Short-term Recovery (5-60 min)
- [ ] Identificare causa root
- [ ] Implementare workaround
- [ ] Iniziare recovery procedure
- [ ] Aggiornare status page

#### Long-term Prevention (1-24 hours)
- [ ] Analisi post-mortem
- [ ] Implementare fix permanenti
- [ ] Aggiornare procedure
- [ ] Migliorare monitoraggio

---

**Ricorda**: In caso di emergenza, mantieni la calma e segui le procedure documentate. La comunicazione chiara è essenziale per una risoluzione efficace.

*Ultimo aggiornamento: $(date)*
