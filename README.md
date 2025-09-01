# bemyrider 🚴‍♂️

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/bemyrider/bemyrider/releases)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Connect-blue.svg)](https://stripe.com/)

**bemyrider** è una piattaforma SaaS moderna che connette esercenti locali con rider autonomi per prenotazioni di consegne a tariffa oraria. 

🏪 **Per Esercenti**: Trova e prenota rider qualificati per le tue consegne  
🚴‍♂️ **Per Rider**: Monetizza il tuo tempo con tariffe personalizzate

## 🚀 Caratteristiche Principali

### Per i Rider
- ✅ **Registrazione con selezione ruolo** e creazione profilo automatica
- ✅ **Definizione tariffa oraria** personalizzata
- ✅ **Dashboard completa** con protezione accessi basata su ruolo
- ✅ **Integrazione Stripe Connect** per ricevere pagamenti
- ✅ **Gestione profilo** con dettagli e statistiche
- ✅ **Logout sicuro** con reindirizzamento automatico

### Per gli Esercenti
- ✅ **Dashboard merchant completa** con statistiche in tempo reale
- ✅ **Ricerca e visualizzazione** rider disponibili con filtri
- ✅ **Prenotazioni** con gestione calendario e stati
- ✅ **Pagamenti sicuri** tramite Stripe con tracking completo
- ✅ **Azioni rapide** per gestione attività quotidiane
- ✅ **Controllo accessi rigoroso** con protezione ruoli

### Funzionalità Condivise
- 🔐 **Sistema di autenticazione** robusto con Supabase
- 🎯 **Redirect intelligenti** basati su ruolo utente
- 🎨 **Design moderno** con navbar fissa e animazioni fluide
- ⚡ **Performance ottimizzate** con loading states e feedback immediato
- 🔒 **Sicurezza avanzata** con isolamento completo tra ruoli

## 🛠 Stack Tecnologico

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Tailwind Animate
- **UI Components**: shadcn/ui (Radix UI)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **ORM**: Drizzle ORM (migrato da Prisma)
- **Pagamenti**: Stripe Connect
- **Linguaggio**: TypeScript
- **Database**: PostgreSQL con RLS
- **Hosting**: Vercel (raccomandato)

## 📋 Prerequisiti

- Node.js 18+ 
- npm o yarn
- Account Supabase
- Account Stripe (con Connect abilitato)

## 🔧 Setup del Progetto

### 1. Clona il repository
```bash
git clone https://github.com/bemyrider/bemyrider.git
cd bemyrider
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura le variabili d'ambiente
Copia il file `env.example` in `.env.local` e compila le variabili:

```bash
cp env.example .env.local
```

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Setup Database con Drizzle ORM

#### Opzione A: Drizzle Migrations (Raccomandato)
```bash
# Applica le migrations Drizzle
npm run db:push

# Le migrations includono automaticamente:
# - Tutte le tabelle e relazioni
# - Enums (DayOfWeek, PaymentStatus, Status, VehicleType)  
# - Indexes ottimizzati
# - Constraints e chiavi esterne
```

#### Opzione B: SQL Manuale
Esegui il file `drizzle/0000_glossy_krista_starr.sql` nel SQL Editor di Supabase.

#### 🗄️ Schema Database Completo

**Enums:**
- `DayOfWeek`: Lun, Mar, Mer, Gio, Ven, Sab, Dom
- `PaymentStatus`: in_attesa, pagato, rimborsato
- `Status`: in_attesa, confermata, in_corso, completata, annullata
- `VehicleType`: bici, e_bike, scooter, auto

**Tabelle Principali:**
- `profiles` - Profili utenti base (rider/merchant)
- `riders` - Dettagli specifici rider
- `esercenti` - Dettagli specifici merchant
- `prenotazioni` - Sistema prenotazioni completo
- `recensioni` - Sistema rating e feedback
- `disponibilita_riders` - Calendario disponibilità

**Tabelle di Supporto:**
- `rider_tax_details` - Dati fiscali rider
- `esercente_tax_details` - Dati fiscali merchant
- `occasional_performance_receipts` - Ricevute prestazioni

#### 🔐 Row Level Security (RLS)
Tutte le tabelle hanno policies RLS configurate automaticamente per:
- ✅ Sicurezza dati per ruolo
- ✅ Isolamento merchant/rider  
- ✅ Accesso basato su proprietà
CREATE POLICY "Riders can insert own details" ON riders_details FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Availability: viewable by everyone, editable by rider
CREATE POLICY "Availability is viewable by everyone" ON availability FOR SELECT USING (true);
CREATE POLICY "Riders can manage own availability" ON availability FOR ALL USING (auth.uid() = rider_id);

-- Bookings: viewable by participants, insertable by merchants
CREATE POLICY "Bookings are viewable by participants" ON bookings FOR SELECT USING (auth.uid() = rider_id OR auth.uid() = merchant_id);
CREATE POLICY "Merchants can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Participants can update bookings" ON bookings FOR UPDATE USING (auth.uid() = rider_id OR auth.uid() = merchant_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

### 5. Setup Supabase Edge Functions

```bash
# Installa Supabase CLI
npm install -g @supabase/cli

# Login e link progetto
supabase login
supabase link --project-ref your-project-ref

# Deploy Edge Function
supabase functions deploy stripe-webhook

# Configura environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 6. Setup Stripe

1. Crea un account Stripe
2. Abilita Stripe Connect nel dashboard
3. Configura le chiavi API nel file `.env.local`
4. Configura webhook: `https://your-project.supabase.co/functions/v1/stripe-webhook`
5. Eventi webhook: `account.updated`

### 7. Avvia il server di sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## 📁 Struttura del Progetto

```
bemyrider/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── account/       # Account management (delete, etc.)
│   │   ├── bookings/      # Prenotazioni API
│   │   ├── profiles/      # Profili utenti API
│   │   ├── riders/        # Rider-specific API
│   │   └── stripe/        # Stripe API endpoints
│   ├── auth/              # Autenticazione (login, register)
│   ├── dashboard/         # Dashboard protected routes
│   │   ├── merchant/      # Dashboard merchant
│   │   ├── rider/         # Dashboard rider
│   │   └── page.tsx       # Central dashboard router
│   └── riders/            # Pagine pubbliche rider
├── components/            # Componenti React
│   ├── ui/               # shadcn/ui base components
│   ├── riders/           # Componenti specifici rider
│   ├── DeleteAccountModal.tsx  # Modal eliminazione account
│   ├── TopNavBar.tsx     # Navbar principale
│   └── UserNav.tsx       # Menu utente
├── lib/                  # Utility e configurazioni
│   ├── db/               # Database layer
│   │   ├── schema.ts     # Drizzle schema completo
│   │   └── index.ts      # Database client
│   ├── supabase.ts       # Client Supabase
│   ├── supabase-direct.ts # Direct API calls
│   ├── stripe.ts         # Configurazione Stripe
│   ├── types.ts          # Type definitions
│   ├── formatters.ts     # Utility formatters
│   └── utils.ts          # Utility functions
├── drizzle/              # Database migrations
│   ├── 0000_glossy_krista_starr.sql  # Schema SQL
│   └── meta/             # Migration metadata
├── docs/                 # 📚 Documentazione completa
│   ├── API.md           # Documentazione API endpoints
│   ├── SETUP.md         # Guida setup dettagliata
│   ├── DEPLOYMENT.md    # Guida deployment produzione
│   └── architettura.md  # Architettura sistema
├── supabase/            # Supabase configuration
│   └── functions/       # Edge Functions
├── public/              # Asset statici
│   └── bemyrider_logo.svg # Logo principale
├── drizzle.config.ts    # Configurazione Drizzle
├── CHANGELOG.md         # Storia delle modifiche v1.1.0
├── RELEASE_NOTES.md     # Note di release dettagliate
└── package.json         # Dipendenze e script
```

## ✨ Nuove Feature v1.1.0

### 🗑️ Gestione Account Avanzata
- **Eliminazione account sicura** con modal di conferma doppio step
- **API endpoint dedicato** `/api/account/delete` con cascade deletion
- **Integrazione Supabase Auth** per rimozione completa
- **Posizionamento discreto** nel menu "Avanzate"

### 🎨 Menu Profilo Unificato  
- **TopNavBar moderna** con design responsive
- **Dropdown menu** con sezioni organizzate (Impostazioni, Privacy, Avanzate)
- **Icona profilo** con navigazione intuitiva
- **Coerenza UI** tra dashboard merchant e rider

### 🔧 Migrazione ORM a Drizzle
- **Performance ottimizzate** rispetto a Prisma
- **Schema completo** con 8+ tabelle e relazioni
- **Connection pooling** ottimizzato per Supabase  
- **Type safety** migliorata con TypeScript

### 🔐 Sicurezza Enterprise-Grade
- **Isolamento completo** tra ruoli merchant/rider
- **Redirect intelligenti** basati su metadata utente
- **Protezione dashboard** con controlli rigorosi
- **Row Level Security** su tutte le tabelle

## 🔄 Flussi Utente

### Registrazione e Accesso
1. **Registrazione unificata** con selezione ruolo visuale
2. **Redirect automatico** alla dashboard appropriata
3. **Creazione profilo automatica** basata su ruolo
4. **Sistema logout** con feedback immediato

### Dashboard Merchant (Completa v1.1.0)
1. **Statistiche real-time** (rider disponibili, prenotazioni, consegne)
2. **Ricerca rider avanzata** con filtri e preview
3. **Gestione prenotazioni** con storico completo
4. **Menu profilo** con gestione account

### Dashboard Rider (Migliorata v1.1.0)
1. **Gestione profilo** completa con dettagli
2. **Calendario disponibilità** integrato
3. **Stripe onboarding** semplificato
4. **Menu profilo** con funzioni avanzate

## 💰 Modello di Business

- **Commissione**: 15% sul costo della prestazione del rider
- **Pagamento**: Gestito tramite Stripe Connect
- **Tariffa**: Definito dal rider (€/ora)

## 📚 Documentazione

Per informazioni dettagliate, consulta la documentazione completa:

- **[📖 Setup Completo](docs/SETUP.md)** - Guida passo-passo per configurazione
- **[🔧 API Documentation](docs/API.md)** - Documentazione completa API endpoints  
- **[🚀 Deployment Guide](docs/DEPLOYMENT.md)** - Deploy in produzione
- **[⚡ Edge Functions](docs/EDGE-FUNCTIONS.md)** - Supabase Edge Functions
- **[📋 Changelog](CHANGELOG.md)** - Storia delle modifiche

## 🚀 Deployment

### Vercel (Raccomandato)
1. Connetta il repository a Vercel
2. Configura le variabili d'ambiente
3. Deploy automatico

**Per istruzioni dettagliate:** [📖 Guida Deployment](docs/DEPLOYMENT.md)

### Altri Provider
Il progetto può essere deployato su qualsiasi provider che supporti Next.js.

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto **licenza proprietaria personalizzata**. 

### Uso Permesso
- ✅ Studio e valutazione personale
- ✅ Sviluppo non commerciale  
- ✅ Scopi educativi

### Uso Commerciale
- ❌ Richiede autorizzazione scritta
- 💼 Licenze commerciali disponibili su richiesta
- 📧 Contatto: info@bemyrider.it

Vedi il file [`LICENSE`](LICENSE) per tutti i dettagli.

## 📞 Supporto

Per supporto o domande, contatta il team di sviluppo.

## 👤 Founder

Questo progetto è ideato, sviluppato e mantenuto da **Giorgio Di Martino**.

Per contatti: info@bemyrider.it

## 📜 Regole di Progetto

- Tutte le funzionalità devono rispettare i [Termini e Condizioni](https://bemyrider.it/app/termini-e-condizioni-bemyrider/) e la [Privacy Policy](https://bemyrider.it/app/privacy-policy/).
- I dati degli utenti devono essere trattati secondo GDPR e policy privacy.
- UI/UX deve seguire la brand identity (colori, font, componenti shadcn/ui).
- Prima di introdurre nuove feature, verificare che non siano in conflitto con le policy ufficiali.
- Le policy legali hanno priorità su richieste di feature non conformi.

---

**bemyrider** - Connetti rider e esercenti per consegne efficienti e trasparenti 🚴‍♂️🏪 