# 🔒 Sistema di Sicurezza Automatica BemyRider

## 📋 Panoramica

Questo sistema garantisce che le policy Row Level Security (RLS) vengano applicate automaticamente dopo ogni migrazione Drizzle, prevenendo problemi di sicurezza.

## 🚀 Come Funziona

### Workflow Automatico
```bash
# Quando esegui una migrazione Drizzle:
npm run db:push    # O db:migrate

# Automaticamente esegue anche:
npm run db:security
```

### Comandi Disponibili

```bash
# Eseguire migrazioni con sicurezza automatica
npm run db:push        # Push schema + sicurezza automatica
npm run db:migrate     # Migrate + sicurezza automatica

# Applicare solo la sicurezza (manualmente)
npm run db:security    # Applica solo le policy RLS

# Eseguire direttamente lo script
node scripts/apply-security-policies.js
```

## 🔧 Configurazione

### Prerequisiti

Assicurati di avere nel file `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### File Coinvolti

```
scripts/
├── apply-security-policies.js    # Script principale
└── README-SECURITY.md           # Questa documentazione
```

## 🛡️ Policy di Sicurezza Applicabili

### Tabelle Protette
- ✅ `profiles` - Profili utente
- ✅ `riders_details` - Dettagli rider
- ✅ `esercenti` - Esercenti/merchant
- ✅ `prenotazioni` - Prenotazioni
- ✅ `recensioni` - Recensioni
- ✅ `service_requests` - Richieste di servizio
- ✅ `merchant_favorites` - Preferiti merchant
- ✅ `disponibilita_riders` - Disponibilità rider
- ✅ `rider_tax_details` - Dati fiscali rider
- ✅ `esercente_tax_details` - Dati fiscali esercenti
- ✅ `occasional_performance_receipts` - Ricevute prestazioni occasionali

### Livelli di Sicurezza

#### 🔹 **Pubblico** (lettura)
- Profili utente (per ricerca)
- Dettagli rider (per ricerca)
- Disponibilità rider (per matching)

#### 🔹 **Proprietario** (tutte le operazioni)
- I merchant possono gestire solo i propri dati
- I rider possono gestire solo i propri dati
- Gli utenti possono modificare solo il proprio profilo

#### 🔹 **Relazionale** (basato su relazioni)
- Prenotazioni: accessibili a esercente e rider coinvolti
- Recensioni: accessibili alle parti coinvolte
- Richieste servizio: merchant può vedere proprie, rider può vedere inviate a lui

## 🔍 Verifica della Sicurezza

### Verificare Policy Applicabili
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Verificare RLS Abilitato
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 🐛 Troubleshooting

### Errore: "permission denied"
**Soluzione:** Verifica che `SUPABASE_SERVICE_ROLE_KEY` sia corretta nel file `.env`

### Errore: "connection refused"
**Soluzione:** Verifica che `NEXT_PUBLIC_SUPABASE_URL` sia corretta

### Policy non applicate
**Soluzione:** Esegui manualmente:
```bash
npm run db:security
```

## 📝 Log dello Script

Lo script fornisce feedback dettagliato:
```
🔒 Applicando policy di sicurezza RLS...
🔗 Testando connessione al database...
✅ Connessione stabilita con successo
🔧 Applicando policy di sicurezza...
✅ Policy applicate: 32
✅ Tabelle con RLS abilitato: 11/11
🎉 Sicurezza applicata con successo!
```

## 🔄 Aggiornamenti Futuri

Quando aggiungi nuove tabelle al database:

1. **Aggiorna lo schema Drizzle** (`lib/db/schema.ts`)
2. **Genera la migrazione** (`npm run db:generate`)
3. **Aggiungi policy RLS** allo script `apply-security-policies.js`
4. **Testa la migrazione** (`npm run db:push`)

## ⚡ Vantaggi del Sistema

- 🚀 **Automatico**: Non devi ricordare di applicare la sicurezza
- 🔒 **Sicuro**: Zero rischi di dimenticare policy critiche
- ⚡ **Veloce**: Applicazione in pochi secondi
- 🔍 **Trasparente**: Log dettagliato di ogni operazione
- 🛠️ **Mantenibile**: Codice organizzato e documentato

## 📞 Supporto

Per problemi o domande sul sistema di sicurezza, consulta:
- Questo documento
- I commenti nel codice dello script
- La documentazione Supabase RLS
