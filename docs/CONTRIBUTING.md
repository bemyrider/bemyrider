# 🤝 Contributing Guide - bemyrider

Benvenuto nel progetto bemyrider! 🎉 Siamo felici che tu voglia contribuire allo sviluppo della piattaforma. Questa guida ti aiuterà a capire come contribuire in modo efficace e rispettando gli standard del progetto.

## 📋 Indice

- [Prima di Iniziare](#-prima-di-iniziare)
- [Setup Ambiente Sviluppo](#-setup-ambiente-sviluppo)
- [Processo di Sviluppo](#-processo-di-sviluppo)
- [Standard di Codice](#-standard-di-codice)
- [Testing](#-testing)
- [Pull Request Process](#-pull-request-process)
- [Tipi di Contributi](#-tipi-di-contributi)
- [Comunità e Supporto](#-comunità-e-supporto)

## 🚀 Prima di Iniziare

### Requisiti

- **Git**: Version control system
- **Node.js 18+**: Runtime JavaScript
- **npm o yarn**: Package manager
- **GitHub Account**: Per contribuire via pull request

### Conoscenze Richieste

- **TypeScript**: Linguaggio principale del progetto
- **Next.js**: Framework React per full-stack
- **PostgreSQL**: Database utilizzato
- **Supabase**: Backend-as-a-Service
- **Stripe**: Sistema pagamenti

### Codice di Condotta

- **Rispetto**: Tratta tutti con rispetto e professionalità
- **Collaborazione**: Lavora in team e comunica chiaramente
- **Qualità**: Mantieni alti standard di qualità del codice
- **Sicurezza**: Considera sempre implicazioni di sicurezza

## 🛠️ Setup Ambiente Sviluppo

### 1. Fork e Clone

```bash
# Fork del repository su GitHub
# Poi clona il tuo fork
git clone https://github.com/YOUR_USERNAME/bemyrider.git
cd bemyrider

# Aggiungi upstream remoto
git remote add upstream https://github.com/bemyrider/bemyrider.git
```

### 2. Installazione Dipendenze

```bash
# Installa tutte le dipendenze
npm install

# Verifica che tutto funzioni
npm run dev
```

### 3. Configurazione Environment

```bash
# Copia il file di esempio
cp env.example .env.local

# Compila tutte le variabili richieste
# Vedi SETUP.md per dettagli completi
```

### 4. Database Setup

```bash
# Avvia Supabase localmente (se usi Supabase CLI)
supabase start

# Oppure configura database remoto
# Segui le istruzioni in SETUP.md
```

### 5. Verifica Setup

```bash
# Test build
npm run build

# Test linting
npm run lint

# Test TypeScript
npm run type-check
```

## 🔄 Processo di Sviluppo

### 1. Scegli un Task

- Controlla la **[ROADMAP.md](./ROADMAP.md)** per feature pianificate
- Guarda le **GitHub Issues** per bug e feature request
- Unisciti alle discussioni su **Discord** per idee collaborative

### 2. Crea un Branch

```bash
# Crea branch con nome descrittivo
git checkout -b feature/nome-feature
# oppure
git checkout -b fix/descrizione-bug
# oppure
git checkout -b docs/aggiornamento-documentazione
```

### 3. Sviluppo Iterativo

```bash
# Scrivi codice seguendo gli standard
# Commit frequentemente con messaggi chiari
git add .
git commit -m "feat: aggiungi funzionalità X

- Implementa logica principale
- Aggiungi test unitari
- Aggiorna documentazione
- Fix linting errors"
```

### 4. Test e Quality Assurance

```bash
# Esegui tutti i test
npm run test

# Verifica linting
npm run lint

# Build per verificare errori
npm run build

# Test manuali dell'interfaccia
```

### 5. Pull Request

```bash
# Push del branch
git push origin feature/nome-feature

# Crea Pull Request su GitHub
# Segui il template PR fornito
```

## 📝 Standard di Codice

### TypeScript

```typescript
// ✅ CORRETTO
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'rider' | 'merchant';
  createdAt: Date;
}

// ❌ SBAGLIATO
interface userProfile {
  id: string;
  fullName: string;
  email: string;
  role: string; // Non tipizzato correttamente
  created_at: Date; // snake_case invece di camelCase
}
```

### Naming Conventions

- **File**: `kebab-case.ts` (es. `user-profile.ts`)
- **Componenti**: `PascalCase.tsx` (es. `UserProfile.tsx`)
- **Funzioni**: `camelCase` (es. `getUserProfile`)
- **Costanti**: `UPPER_SNAKE_CASE` (es. `MAX_RETRY_ATTEMPTS`)
- **Tipi**: `PascalCase` (es. `UserProfile`, `ApiResponse`)

### Struttura File

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group per autenticazione
│   ├── api/               # API Routes
│   └── dashboard/         # Dashboard pages
├── components/            # Componenti React riutilizzabili
│   ├── ui/               # Componenti base (shadcn/ui)
│   └── forms/            # Componenti form
├── lib/                   # Utility e configurazioni
│   ├── supabase/         # Client Supabase
│   ├── stripe/           # Configurazioni Stripe
│   └── utils/            # Utility functions
└── types/                # TypeScript type definitions
```

### Commit Messages

Seguiamo il [Conventional Commits](https://conventionalcommits.org/) standard:

```bash
# ✅ CORRETTO
feat: aggiungi ricerca rider per zona
fix: risolvi errore caricamento profilo
docs: aggiorna guida API
refactor: ottimizza query database
test: aggiungi test per componente login

# ❌ SBAGLIATO
update code
bug fix
add stuff
```

### Commenti e Documentazione

```typescript
// ✅ CORRETTO - JSDoc per funzioni importanti
/**
 * Calcola il prezzo totale di una prenotazione
 * @param hourlyRate - Tariffa oraria del rider in euro
 * @param hours - Numero di ore richieste
 * @param taxRate - Aliquota IVA applicata
 * @returns Prezzo totale comprensivo di IVA
 */
function calculateTotalPrice(
  hourlyRate: number,
  hours: number,
  taxRate: number = 0.22
): number {
  const subtotal = hourlyRate * hours;
  const tax = subtotal * taxRate;
  return subtotal + tax;
}

// ✅ CORRETTO - Commenti per logica complessa
// Verifica se il rider è disponibile per la data richiesta
// Considerando le sue disponibilità settimanali e ferie
const isRiderAvailable = (
  requestedDate: Date,
  riderAvailability: Availability[]
): boolean => {
  // Logica di controllo disponibilità...
};
```

## 🧪 Testing

### Strategia di Testing

- **Unit Tests**: Funzioni e componenti isolati
- **Integration Tests**: Interazioni tra componenti
- **E2E Tests**: Flussi utente completi
- **API Tests**: Endpoints e logica backend

### Comandi di Test

```bash
# Test unitari
npm run test:unit

# Test di integrazione
npm run test:integration

# Test E2E
npm run test:e2e

# Coverage report
npm run test:coverage

# Test specifici
npm run test -- component-name
```

### Scrivere Test

```typescript
// ✅ CORRETTO - Test completo per componente
import { render, screen, fireEvent } from '@testing-library/react';
import { RiderCard } from './RiderCard';

describe('RiderCard', () => {
  const mockRider = {
    id: '1',
    fullName: 'Mario Rossi',
    hourlyRate: 12.50,
    avgRating: 4.8,
    vehicleType: 'e_bike' as const
  };

  it('renders rider information correctly', () => {
    render(<RiderCard rider={mockRider} />);

    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getByText('€12.50/ora')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('calls onContact when contact button is clicked', () => {
    const mockOnContact = jest.fn();
    render(<RiderCard rider={mockRider} onContact={mockOnContact} />);

    fireEvent.click(screen.getByRole('button', { name: /contatta/i }));

    expect(mockOnContact).toHaveBeenCalledWith(mockRider.id);
  });
});
```

### Coverage Requirements

- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 85%
- **Lines**: ≥ 80%

## 🔄 Pull Request Process

### Template PR

Quando crei una PR, usa questo template:

```markdown
## 📝 Descrizione

Breve descrizione delle modifiche apportate.

## 🎯 Tipo di Cambiamento

- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change
- [ ] 📚 Documentation
- [ ] 🎨 Style/UI
- [ ] 🔧 Refactoring
- [ ] ⚡ Performance

## ✅ Checklist

- [ ] Test aggiunti/aggiornati
- [ ] Documentazione aggiornata
- [ ] Linting superato
- [ ] TypeScript errors risolti
- [ ] Build locale funzionante

## 🧪 Test Eseguiti

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing

## 📋 Issues Correlate

Closes #123
Relates to #456

## 📸 Screenshots (se applicabile)

[Inserisci screenshots delle modifiche UI]
```

### Review Process

1. **Auto-checks**: GitHub Actions esegue linting, test, build
2. **Code Review**: Almeno un maintainer deve approvare
3. **Testing**: Reviewer testa le modifiche
4. **Approval**: PR viene mergiata da maintainer

### Branch Strategy

- **main**: Codice di produzione
- **develop**: Sviluppo attivo
- **feature/**: Nuove funzionalità
- **fix/**: Bug fixes
- **hotfix/**: Fix critici per produzione

## 🎯 Tipi di Contributi

### 💻 Sviluppo

- Implementare nuove funzionalità
- Fixare bug e problemi
- Ottimizzazioni performance
- Miglioramenti sicurezza

### 📚 Documentazione

- Guide utente e sviluppatore
- API documentation
- Code comments
- Tutorial e esempi

### 🎨 Design & UX

- Miglioramenti interfaccia
- User experience
- Responsive design
- Accessibilità

### 🧪 Testing & QA

- Scrivere test automatici
- Testing manuale
- QA e bug hunting
- Performance testing

### 🌐 Traduzioni

- Supporto multi-lingua
- Traduzioni interfaccia
- Documentazione localizzata

## 🌍 Comunità e Supporto

### Canali di Comunicazione

- **GitHub Issues**: Bug reports e feature requests
- **GitHub Discussions**: Domande generali e discussioni
- **Discord**: Chat real-time per sviluppatori
- **Email**: dev@bemyrider.it per questioni tecniche

### Come Ottenere Aiuto

1. **Controlla la documentazione** esistente
2. **Cerca in GitHub Issues** problemi simili
3. **Chiedi su Discord** per domande rapide
4. **Apri una Issue** per problemi complessi

### Riconoscimenti

Tutti i contributori sono riconosciuti:

- **GitHub Contributors**: Lista automatica
- **Changelog**: Crediti per ogni release
- **Hall of Fame**: Contributori attivi mensilmente

## 📋 Best Practices

### Sicurezza

- Mai committare chiavi API o segreti
- Usa environment variables per configurazioni sensibili
- Implementa input validation
- Considera OWASP guidelines

### Performance

- Lazy loading per componenti pesanti
- Ottimizzazione immagini
- Bundle splitting
- Caching strategico

### Accessibilità

- Supporto screen readers
- Navigazione keyboard
- Contrasto colori adeguato
- Test con assistive technologies

---

## 🎉 Pronto per Contribuire?

1. **Scegli un task** dalla roadmap o issues
2. **Setup il tuo ambiente** seguendo questa guida
3. **Sviluppa seguendo gli standard** qui descritti
4. **Crea una Pull Request** ben documentata
5. **Partecipa al review process**

**Grazie per il tuo contributo a bemyrider!** 🚀

Hai domande? Non esitare a chiedere su Discord o aprire una GitHub Issue.
