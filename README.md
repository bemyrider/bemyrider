# bemyrider 🚴‍♂️

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/bemyrider/bemyrider/releases)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Connect-blue.svg)](https://stripe.com/)

**bemyrider** è una piattaforma SaaS moderna che connette esercenti locali con rider autonomi per prenotazioni di consegne a tariffa oraria. 

🏪 **Per Esercenti**: Trova e prenota rider qualificati per le tue consegne  
🚴‍♂️ **Per Rider**: Monetizza il tuo tempo con tariffe personalizzate

## 🚀 Caratteristiche Principali

### Per i Rider
- Registrazione e creazione profilo
- Definizione tariffa oraria personalizzata
- Gestione disponibilità tramite calendario
- Integrazione con Stripe Connect per ricevere pagamenti
- Dashboard per visualizzare prenotazioni e guadagni

### Per gli Esercenti
- Sfogliare rider disponibili con filtri
- Prenotare rider per fasce orarie specifiche
- Pagamento sicuro tramite Stripe
- Dashboard per gestire prenotazioni

## 🛠 Stack Tecnologico

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Pagamenti**: Stripe Connect
- **Linguaggio**: TypeScript

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

### 4. Setup Database Supabase

Esegui questi comandi SQL nel tuo progetto Supabase:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('rider', 'merchant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create riders_details table
CREATE TABLE riders_details (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  hourly_rate NUMERIC(10,2) NOT NULL,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availability table
CREATE TABLE availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  rider_amount NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('confermata', 'completata', 'cancellata')) DEFAULT 'confermata',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_riders_details_profile_id ON riders_details(profile_id);
CREATE INDEX idx_availability_rider_id ON availability(rider_id);
CREATE INDEX idx_bookings_rider_id ON bookings(rider_id);
CREATE INDEX idx_bookings_merchant_id ON bookings(merchant_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: users can read all profiles, update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Riders details: viewable by everyone, editable by owner
CREATE POLICY "Riders details are viewable by everyone" ON riders_details FOR SELECT USING (true);
CREATE POLICY "Riders can update own details" ON riders_details FOR UPDATE USING (auth.uid() = profile_id);
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
│   ├── api/stripe/        # Stripe API endpoints
│   ├── auth/              # Pagine di autenticazione
│   ├── dashboard/         # Dashboard utenti
│   └── riders/            # Pagine pubbliche rider
├── components/            # Componenti React
│   ├── ui/               # Componenti shadcn/ui base
│   └── riders/           # Componenti specifici rider
├── docs/                  # 📚 Documentazione completa
│   ├── API.md            # Documentazione API endpoints
│   ├── SETUP.md          # Guida setup dettagliata
│   ├── DEPLOYMENT.md     # Guida deployment produzione
│   └── EDGE-FUNCTIONS.md # Documentazione Edge Functions
├── lib/                  # Utility e configurazioni
│   ├── supabase.ts       # Client Supabase
│   ├── stripe.ts         # Configurazione Stripe
│   └── utils.ts          # Utility functions
├── supabase/             # Supabase configuration
│   └── functions/        # Edge Functions
│       └── stripe-webhook/ # Webhook Stripe handler
├── public/               # Asset statici
├── CHANGELOG.md          # Storia delle modifiche
├── LICENSE               # Licenza proprietaria
└── package.json          # Dipendenze e script
```

## 🔄 Flussi Utente

### Registrazione Rider
1. Utente si registra come rider
2. Completa il profilo con tariffa oraria
3. Attiva Stripe Connect per ricevere pagamenti
4. Gestisce disponibilità nel calendario

### Prenotazione da Esercente
1. Esercente sfoglia rider disponibili
2. Seleziona rider e fascia oraria
3. Completa pagamento con Stripe
4. Rider riceve notifica e pagamento

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