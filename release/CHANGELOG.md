# Changelog

Tutte le modifiche importanti a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-01-03

### 🎉 Aggiornamento Maggiore - Sistema Richieste di Servizio Avanzato

#### ✨ Nuove Funzionalità Principali

##### 🚀 **Sistema Richieste di Servizio Completo**
- **Validazione disponibilità rider** in tempo reale con controlli intelligenti
- **Form di richiesta avanzato** con validazione client-side e server-side
- **Campo indirizzo di servizio** flessibile per indirizzi diversi dall'attività
- **Validazione istruzioni obbligatorie** con minimo 2 caratteri
- **Alert visivi** per conflitti di disponibilità con messaggi specifici
- **Controlli temporali** per giorni e orari disponibili del rider
- **Prevenzione errori** con disabilitazione pulsante in caso di conflitti

##### 🔧 **Miglioramenti UX/UI**
- **Calendario limitato** a 7 giorni massimo per le richieste
- **Dropdown durata** con opzioni "1 ora" e "2 ore"
- **Riepilogo dinamico** che appare solo con campi validi
- **Feedback immediato** per validazione disponibilità
- **Messaggi di errore** chiari e specifici

##### 🛡️ **Sicurezza e Validazione**
- **Row Level Security (RLS)** attivato per tabella `service_requests`
- **Politiche di accesso** specifiche per merchant e rider
- **Validazione doppia** client-side e server-side
- **Controlli di integrità** per tutti i campi obbligatori

#### 🗄️ **Aggiornamenti Database**
- **Tabella `service_requests`** con RLS attivo e politiche di sicurezza
- **Campo `merchant_address`** obbligatorio per indirizzi di servizio
- **Enum `ServiceRequestStatus`** per gestione stati richieste
- **Relazioni** tra merchant, rider e richieste di servizio

#### 🧹 **Pulizia e Ottimizzazione**
- **Rimozione file temporanei** API di debug
- **Correzione tipi TypeScript** per compatibilità build
- **Ottimizzazione validazioni** per performance migliori

---

## [1.3.0] - 2025-01-03

### 🎉 Aggiornamento Maggiore - Dashboard Merchant Completa

#### ✨ Nuove Funzionalità Principali

##### 🏪 **Dashboard Merchant Completa**
- **Sezione profilo attività** completa con gestione informazioni business
- **Modal di modifica profilo** con validazione e salvataggio automatico
- **Gestione dati fiscali** per fatturazione e ricevute
- **Indicatori di completamento** profilo con stato visivo
- **Integrazione database** con tabelle `esercenti` e `esercente_tax_details`

##### 📝 **Gestione Profilo Attività**
- **Informazioni business**: Nome attività, descrizione, telefono, indirizzo
- **Validazione campi** obbligatori e formattazione automatica
- **Salvataggio real-time** con feedback immediato
- **Gestione errori** completa con messaggi user-friendly

##### 🏢 **Dati Fiscali Avanzati**
- **Ragione sociale** e partita IVA per fatturazione
- **Indirizzo fiscale** separato da quello business
- **Validazione partita IVA** italiana (11 cifre)
- **Modal dedicato** per gestione dati fiscali

##### 🎨 **Interfaccia Utente Migliorata**
- **Design coerente** con il resto dell'applicazione
- **Layout responsive** per mobile e desktop
- **Pulsanti di azione** facilmente accessibili
- **Indicatori di stato** per completamento profilo

#### 🔧 Miglioramenti Tecnici

##### 🗄️ **Integrazione Database**
- **Componenti modali** per gestione dati merchant
- **API calls** ottimizzate per Supabase
- **Gestione stati** con React hooks
- **Type safety** completa con TypeScript

##### 🛡️ **Validazione e Sicurezza**
- **Validazione input** lato client e server
- **Gestione errori** robusta con fallback
- **Sanitizzazione dati** prima del salvataggio
- **Controlli di accesso** per operazioni sensibili

#### 🐛 Fix e Correzioni

##### 🔧 **Pulizia Repository**
- **Ottimizzazione build** e eliminazione file temporanei
- **Aggiornamento .gitignore** per ignorare file generati
- **Repository pulito** e ottimizzato
- **Commit history** ottimizzata

#### 📱 **Funzionalità UI/UX**

##### 🎪 **Dashboard Merchant Rinnovata**
- **Sezione profilo** prominente in alto
- **Azioni rapide** per modifica profilo e dati fiscali
- **Visualizzazione stato** completamento informazioni
- **Navigazione intuitiva** tra sezioni

##### 🔒 **Gestione Dati**
- **Modal dedicati** per ogni tipo di informazione
- **Salvataggio progressivo** senza perdita dati
- **Feedback visivo** per operazioni in corso
- **Gestione stati** di caricamento e errore

#### 🛠️ File e Strutture Create/Modificate

##### 📄 **Nuovi File**
- `components/EditMerchantProfileModal.tsx` - Modal gestione profilo business
- `components/FiscalDataMerchantModal.tsx` - Modal gestione dati fiscali

##### 🔄 **File Aggiornati**
- `app/dashboard/merchant/page.tsx` - Dashboard merchant completa
- `.gitignore` - Ottimizzazione regole ignore
- `CHANGELOG.md` - Documentazione nuove funzionalità

#### 🎯 **Impatto Utente**

##### 🚀 **Esperienza Merchant Migliorata**
- **Profilo completo** con tutte le informazioni necessarie
- **Gestione facile** di dati business e fiscali
- **Feedback immediato** per operazioni
- **Design professionale** e intuitivo

##### 🔒 **Dati Sicuri e Organizzati**
- **Separazione** tra dati business e fiscali
- **Validazione** automatica dei campi
- **Salvataggio sicuro** nel database
- **Gestione errori** user-friendly

---

## [1.2.0] - 2025-08-31

### 🎉 Aggiornamento Maggiore - Dashboard Completa e UX Migliorata

#### ✨ Nuove Funzionalità Principali

##### 🗑️ **Gestione Account Utente**
- **Funzionalità eliminazione account** completa per utenti
- **Modal di conferma** con processo a doppio step per sicurezza massima
- **API endpoint sicuro** `/api/account/delete` con cascade deletion
- **Integrazione Supabase Auth** per rimozione completa account

##### 🎨 **Menu Profilo Unificato**
- **TopNavBar moderna** con menu dropdown professionale
- **Icona profilo** con navigazione intuitiva
- **Sezione "Avanzate"** per funzioni sensibili (eliminazione account)
- **Design coerente** tra dashboard merchant e rider

##### 🔧 **Migrazione ORM a Drizzle**
- **Rimozione completa Prisma** (risolti problemi di connettività locale)
- **Schema Drizzle completo** con tutte le tabelle e relazioni
- **Configurazione ottimizzata** per Supabase con `{ prepare: false }`
- **Performance migliorate** e compatibilità totale

##### 🏪 **Dashboard Merchant Completa**
- **Dashboard merchant** completamente funzionale con sezioni:
  - Statistiche in tempo reale (rider disponibili, prenotazioni, consegne completate, spesa totale)
  - Ricerca e visualizzazione rider disponibili
  - Gestione prenotazioni recenti
  - Azioni rapide per trovare rider e gestire attività
- **Logica di creazione profilo** automatica per merchant

##### 🚴‍♂️ **Dashboard Rider Migliorata**
- **Controlli di accesso** rigorosi basati sul ruolo
- **Gestione profilo** completa con dettagli rider
- **Animazioni di loading** uniforme tra dashboard

##### 🔐 **Sistema di Protezione Ruoli Robusto**
- **Controllo accesso rigido**: solo merchant possono accedere alla dashboard merchant, solo rider alla dashboard rider
- **Redirect intelligente** basato sul ruolo utente
- **Creazione profili automatica** con ruolo corretto basato su metadata utente
- **Prevenzione accessi incrociati** tra ruoli diversi

##### 🎯 **Selezione Ruolo Migliorata**
- **Interfaccia di registrazione** con selezione ruolo visuale (icone Bike/Store)
- **Redirect post-registrazione** intelligente basato sul ruolo selezionato
- **Debug logging** completo per tracciare metadata utente

##### 🖥️ **Interfaccia Utente Modernizzata**
- **Navbar fissa** in alto con design moderno
- **Pulsante "Accedi" evidenziato** che reindirizza intelligentemente
- **Rimozione URL parametri confusi** dalla home page
- **Animazioni di loading** uniformi e professionali

##### 🚪 **Logout Migliorato**
- **Reindirizzamento automatico** dopo logout
- **Feedback visivo** durante il processo di logout
- **Gestione stati** con indicatori di caricamento

#### 🔧 Miglioramenti Tecnici

##### 🗄️ **Ristrutturazione Database**
- **Migrazione completa da Prisma a Drizzle ORM**
- **Schema database ottimizzato** con relazioni migliorate
- **Configurazione connection pooling** per Supabase
- **API routes preparate** per integrazione Drizzle

##### 🛡️ **Sicurezza e Robustezza**
- **API endpoint sicuri** per gestione account
- **Validazione input** su tutte le operazioni sensibili
- **Error handling** completo con logging dettagliato
- **Cascade deletion** per mantenere integrità dati

##### 📦 **Dipendenze Aggiornate**
- **Supabase aggiornato** da v2.38.5 a v2.50.0
- **Aggiunta Drizzle ORM** v0.44.5 e Drizzle Kit v0.31.4
- **Risoluzione warning** realtime-js
- **Compatibilità migliorata** con versioni recenti

##### 🏗️ **Architettura Codice**
- **Utility files** organizzati (`lib/types.ts`, `lib/formatters.ts`)
- **Type safety migliorata** con definizioni TypeScript complete
- **Separazione concerns** per componenti riutilizzabili
- **Componenti UI modulari** (TopNavBar, DeleteAccountModal)

##### 🔄 **Redirect e Routing**
- **Rotta `/dashboard`** intelligente che gestisce redirect automatici
- **Gestione stati autenticazione** robusta
- **Fallback e error handling** completi

#### 🐛 Fix e Correzioni

##### 🔧 **Correzioni Critiche**
- **Fix errori TypeScript** nella dashboard merchant e test pages
- **Gestione array vs oggetti** nelle query Supabase
- **Risoluzione problemi linting** per import mancanti
- **Correzione redirect loop** potenziali
- **Fix configurazione ESLint** con TypeScript
- **Risoluzione errori build** per componenti UI mancanti
- **Fix sintassi JavaScript** con semicolon e duplicazioni

##### 🎨 **Miglioramenti UX**
- **Eliminazione confusione URL** parametri role
- **Unificazione esperienza** tra rider e merchant
- **Feedback immediato** per azioni utente

#### 📱 **Funzionalità UI/UX**

##### 🎪 **Homepage Rinnovata**
- **Pulsanti unificati** che reindirizzano tutti a `/auth/register`
- **Selezione ruolo** chiara nella pagina di registrazione
- **Design coerente** e professionale

##### 🔒 **Sicurezza e Accesso**
- **Controlli di ruolo** in tutte le dashboard
- **Prevenzione accessi non autorizzati**
- **Gestione sessioni** migliorata

#### 🛠️ File e Strutture Create/Modificate

##### 📄 **Nuovi File**
- `app/dashboard/page.tsx` - Redirect intelligente
- `app/dashboard/merchant/page.tsx` - Dashboard merchant completa
- `lib/types.ts` - Definizioni TypeScript
- `lib/formatters.ts` - Utility di formattazione
- `app/debug-user/page.tsx` - Strumento di debug
- `app/test-roles/page.tsx` - Test protezione ruoli
- `fix-merchant-roles.sql` - Script correzione database

##### 🔄 **File Aggiornati**
- `app/auth/register/page.tsx` - Selezione ruolo e debug
- `app/auth/login/page.tsx` - Redirect intelligente post-login
- `app/dashboard/rider/page.tsx` - Protezione ruoli e logout migliorato
- `app/page.tsx` - Navbar fissa e URL unificati
- `package.json` - Aggiornamenti dipendenze

#### 🎯 **Impatto Utente**

##### 🚀 **Esperienza Migliorata**
- **Onboarding fluido** con selezione ruolo chiara
- **Navigazione intuitiva** con redirect automatici
- **Design professionale** e coerente
- **Performance ottimizzate** con loading states

##### 🔒 **Sicurezza Aumentata**
- **Isolamento completo** tra ruoli merchant e rider
- **Prevenzione accessi non autorizzati**
- **Gestione profili** robusta e affidabile

---

## [1.0.0] - 2024-01-17

### 🎉 Prima Release Stabile

#### ✨ Nuove Funzionalità
- **Autenticazione completa** con Supabase Auth
- **Stripe Connect onboarding** per rider
- **Dashboard rider** con gestione profilo
- **Sistema di pagamenti** integrato con Stripe
- **API endpoints** per gestione account Stripe
- **Webhook handling** per aggiornamenti automatici
- **Database schema** completo con Drizzle ORM
- **UI responsive** con Tailwind CSS e Radix UI

#### 🔧 Componenti Tecnici
- **Next.js 14** con App Router
- **TypeScript** per type safety
- **Supabase** per backend e database
- **Stripe Connect** per pagamenti
- **Edge Functions** per webhook processing
- **Drizzle ORM** per database management

#### 🛠️ Fix e Miglioramenti
- Risolti errori di build e import
- Rimosso codice duplicato da API routes
- Implementato reindirizzamento automatico post-onboarding
- Ottimizzata configurazione Next.js per Edge Functions
- Escluse Supabase functions da build TypeScript
- Sostituiti componenti mancanti con alternative funzionali

#### 🏗️ Architettura
- **Frontend**: Next.js con React 18
- **Backend**: Supabase con PostgreSQL
- **Pagamenti**: Stripe Connect
- **Hosting**: Vercel-ready con standalone output
- **Database**: PostgreSQL con Row Level Security

#### 📁 Struttura Progetto
```
bemyrider/
├── app/                    # Next.js App Router
│   ├── api/stripe/        # API endpoints Stripe
│   ├── auth/              # Pagine autenticazione
│   └── dashboard/         # Dashboard utenti
├── components/            # Componenti React
│   ├── ui/               # Componenti UI base
│   └── riders/           # Componenti specifici rider
├── lib/                  # Utilities e configurazioni
├── supabase/            # Edge Functions e schema
└── src/db/              # Drizzle ORM e migrazioni
```

#### 🔐 Sicurezza
- Row Level Security (RLS) su database
- Webhook signature verification
- Autenticazione JWT con Supabase
- Environment variables per chiavi sensibili

#### 🚀 Deploy Ready
- Configurazione Vercel ottimizzata
- Environment variables template
- Database migrations automatiche
- Edge Functions deployment ready

---

## Versioni Future

### [1.1.0] - Pianificata
- Sistema di prenotazioni
- Calendario disponibilità rider
- Notifiche real-time
- Dashboard esercenti

### [1.2.0] - Pianificata
- Sistema di rating e recensioni
- Tracking GPS consegne
- Report e analytics
- Sistema di supporto
