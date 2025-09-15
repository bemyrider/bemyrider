# Sistema di Controllo Connessione

## Panoramica

Il sistema di controllo connessione di bemyrider monitora automaticamente lo stato della connessione internet e la disponibilità dei servizi, fornendo feedback visivo all'utente e gestendo automaticamente i retry delle chiamate API.

## Componenti Principali

### 1. Hook `useConnectionStatus`

**File:** `lib/hooks/use-connection-status.ts`

Hook personalizzato che monitora lo stato della connessione internet e la disponibilità dei servizi.

```typescript
import { useConnectionStatus } from '@/lib/hooks/use-connection-status';

const MyComponent = () => {
  const {
    isOnline, // Stato connessione internet del browser
    isConnected, // Stato connessione ai servizi
    isHealthy, // Connessione stabile (online + connected)
    needsRetry, // Necessita retry automatico
    maxRetriesReached, // Raggiunto limite retry
    forceCheck, // Funzione per forzare controllo
    resetRetryCount, // Funzione per resettare retry
    lastChecked, // Timestamp ultimo controllo
    retryCount, // Numero tentativi attuali
  } = useConnectionStatus({
    checkInterval: 30000, // Intervallo controllo (ms)
    maxRetries: 3, // Massimo numero retry
    testUrl: '/api/health', // URL per test connessione
    onStatusChange: status => {
      console.log('Status changed:', status);
    },
  });
};
```

### 2. Hook `useApiWithRetry`

**File:** `lib/hooks/use-api-with-retry.ts`

Hook per eseguire chiamate API con retry automatico in caso di errori di rete.

```typescript
import { useApiWithRetry } from '@/lib/hooks/use-api-with-retry';

const MyComponent = () => {
  const { execute, retry, loading, error, retryCount } = useApiWithRetry({
    maxRetries: 3,
    retryDelay: 1000,
    onSuccess: data => console.log('Success:', data),
    onError: error => console.error('Error:', error),
  });

  const fetchData = async () => {
    const result = await execute(async () => {
      const response = await fetch('/api/data');
      return await response.json();
    });
  };
};
```

### 3. Componente `ConnectionStatusBanner`

**File:** `components/ConnectionStatusBanner.tsx`

Banner di notifica che mostra lo stato della connessione all'utente.

```typescript
import ConnectionStatusBanner from '@/components/ConnectionStatusBanner';

const MyPage = () => {
  return (
    <div>
      <ConnectionStatusBanner
        showWhenOnline={false}  // Mostra solo quando offline
        autoHide={true}         // Nasconde automaticamente
        hideDelay={3000}        // Delay per nascondere (ms)
      />
      {/* Contenuto della pagina */}
    </div>
  );
};
```

### 4. Endpoint Health Check

**File:** `app/api/health/route.ts`

Endpoint leggero per testare la disponibilità del server.

```typescript
// GET /api/health
// HEAD /api/health (per test più leggeri)

// Risposta:
{
  "status": "healthy",
  "timestamp": "2024-01-17T10:30:00.000Z",
  "responseTime": "15ms",
  "services": {
    "api": "ok",
    "server": "ok"
  }
}
```

## Utilizzo

### Integrazione Base

1. **Aggiungi il banner alla pagina:**

```typescript
import ConnectionStatusBanner from '@/components/ConnectionStatusBanner';

export default function MyPage() {
  return (
    <div>
      <ConnectionStatusBanner />
      {/* Contenuto */}
    </div>
  );
}
```

2. **Usa il hook per chiamate API:**

```typescript
import { useApiWithRetry } from '@/lib/hooks/use-api-with-retry';

const MyComponent = () => {
  const { execute, loading, error } = useApiWithRetry();

  const handleSubmit = async () => {
    const result = await execute(async () => {
      // La tua chiamata API qui
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await response.json();
    });
  };
};
```

### Configurazione Avanzata

#### Personalizzazione Hook Connessione

```typescript
const connectionStatus = useConnectionStatus({
  checkInterval: 10000, // Controlla ogni 10 secondi
  maxRetries: 5, // Massimo 5 tentativi
  testUrl: '/api/custom-health', // URL personalizzato
  onStatusChange: status => {
    // Logica personalizzata quando cambia lo stato
    if (status.isHealthy) {
      showSuccessNotification('Connessione ripristinata');
    } else if (!status.isOnline) {
      showErrorNotification('Connessione internet assente');
    }
  },
});
```

#### Personalizzazione Hook API

```typescript
const apiRetry = useApiWithRetry({
  maxRetries: 5,
  retryDelay: 2000,
  retryCondition: error => {
    // Condizioni personalizzate per retry
    return (
      error.status >= 500 ||
      error.name === 'TypeError' ||
      error.message.includes('network')
    );
  },
  onRetry: (attempt, error) => {
    console.log(`Retry attempt ${attempt}:`, error);
  },
});
```

## Stati della Connessione

### 1. Online + Connected (Healthy)

- ✅ Connessione internet attiva
- ✅ Servizi raggiungibili
- ✅ Tutto funziona normalmente

### 2. Online + Not Connected (Unstable)

- ✅ Connessione internet attiva
- ❌ Servizi non raggiungibili
- 🔄 Tentativi di riconnessione automatici

### 3. Offline

- ❌ Connessione internet assente
- ❌ Servizi non raggiungibili
- ⏳ Attesa ripristino connessione

## Test e Debug

### Pagina di Test

Visita `/test-connection` per:

- Monitorare lo stato della connessione in tempo reale
- Eseguire test specifici (health endpoint, database, latenza)
- Simulare problemi di connessione
- Verificare il comportamento del sistema

### Debug in Console

```typescript
// Abilita logging dettagliato
const connectionStatus = useConnectionStatus({
  onStatusChange: status => {
    console.log('Connection Status:', {
      isOnline: status.isOnline,
      isConnected: status.isConnected,
      retryCount: status.retryCount,
      lastChecked: status.lastChecked,
    });
  },
});
```

### Test Manuali

1. **Disconnessione Internet:**
   - Disattiva WiFi/ethernet
   - Verifica che il banner mostri "Connessione Internet Assente"

2. **Problemi Server:**
   - Simula errori 500 nel health endpoint
   - Verifica retry automatici e notifiche

3. **Ripristino Connessione:**
   - Riattiva connessione
   - Verifica che il banner mostri "Connessione Ripristinata"

## Best Practices

### 1. Gestione Errori

```typescript
const { execute, error, loading } = useApiWithRetry({
  onError: error => {
    // Gestisci errori specifici
    if (error.status === 401) {
      redirectToLogin();
    } else if (error.status >= 500) {
      showServerErrorNotification();
    }
  },
});
```

### 2. UX Ottimale

```typescript
// Mostra loading state durante retry
if (loading) {
  return <LoadingSpinner message="Verifica connessione..." />;
}

// Mostra errori solo se necessario
if (error && maxRetriesReached) {
  return <ErrorMessage onRetry={handleRetry} />;
}
```

### 3. Performance

```typescript
// Usa intervalli appropriati per il controllo
const connectionStatus = useConnectionStatus({
  checkInterval: 30000, // 30s per produzione
  // checkInterval: 5000,  // 5s per sviluppo
});
```

## Troubleshooting

### Problemi Comuni

1. **Banner non si mostra:**
   - Verifica che `ConnectionStatusBanner` sia importato e renderizzato
   - Controlla che `showWhenOnline` sia configurato correttamente

2. **Retry non funziona:**
   - Verifica che `retryCondition` sia configurata correttamente
   - Controlla che `maxRetries` sia > 0

3. **Health endpoint non risponde:**
   - Verifica che `/api/health` sia accessibile
   - Controlla i log del server per errori

### Log e Monitoraggio

```typescript
// Aggiungi logging per debug
console.log('Connection Status:', {
  isOnline: navigator.onLine,
  isConnected: connectionStatus.isConnected,
  retryCount: connectionStatus.retryCount,
  lastChecked: connectionStatus.lastChecked,
});
```

## Sicurezza

- L'endpoint `/api/health` è pubblico e non richiede autenticazione
- Non esporre informazioni sensibili nel health check
- Usa HTTPS in produzione per evitare man-in-the-middle attacks
- Limita la frequenza dei controlli per evitare abusi

## Performance

- Il controllo della connessione è ottimizzato per non impattare le performance
- Usa HEAD requests quando possibile per ridurre il traffico
- Implementa caching appropriato per i controlli di salute
- Considera l'uso di Web Workers per controlli pesanti
