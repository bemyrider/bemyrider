# API Documentation

## Panoramica

L'API di bemyrider fornisce endpoints per gestire l'integrazione con Stripe Connect, l'autenticazione utenti e la gestione dei profili rider.

**Base URL**: `https://yourdomain.com/api`

## Autenticazione

Tutti gli endpoints API utilizzano l'autenticazione Supabase JWT. Il token deve essere incluso nell'header `Authorization`:

```
Authorization: Bearer <supabase-jwt-token>
```

## Endpoints Stripe

### POST /api/stripe/onboarding

Inizia il processo di onboarding Stripe Connect per un rider.

**Richiesta:**
```http
POST /api/stripe/onboarding
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

**Risposta di successo (200):**
```json
{
  "url": "https://connect.stripe.com/setup/...",
  "stripe_account_id": "acct_...",
  "status": "created"
}
```

**Risposta se già completato (200):**
```json
{
  "url": "https://yourdomain.com/dashboard/rider?onboarding_complete=true",
  "status": "already_complete"
}
```

**Errori:**
- `401 Unauthorized`: Token mancante o non valido
- `500 Internal Server Error`: Errore nella creazione account Stripe

### GET /api/stripe/onboarding

Verifica lo stato dell'onboarding Stripe per un rider.

**Richiesta:**
```http
GET /api/stripe/onboarding
Authorization: Bearer <jwt-token>
```

**Risposta (200):**
```json
{
  "status": "has_stripe_account",
  "stripe_account_id": "acct_...",
  "stripe_onboarding_complete": true
}
```

**Possibili stati:**
- `no_stripe_account`: Nessun account Stripe associato
- `has_stripe_account`: Account esistente con stato onboarding

### POST /api/stripe/create-account

Crea un nuovo account Stripe Express per un rider.

**Richiesta:**
```http
POST /api/stripe/create-account
Authorization: Bearer <jwt-token>
```

**Risposta (200):**
```json
{
  "url": "https://connect.stripe.com/setup/..."
}
```

### POST /api/stripe/create-login-link

Crea un link di login per la dashboard Stripe del rider.

**Richiesta:**
```http
POST /api/stripe/create-login-link
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "accountId": "acct_..."
}
```

**Risposta (200):**
```json
{
  "url": "https://connect.stripe.com/express/..."
}
```

### POST /api/stripe/create-payment-intent

Crea un Payment Intent per una prenotazione.

**Richiesta:**
```http
POST /api/stripe/create-payment-intent
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "amount": 2500,
  "currency": "eur",
  "riderId": "uuid",
  "startTime": "2024-01-17T10:00:00Z",
  "endTime": "2024-01-17T12:00:00Z"
}
```

**Risposta (200):**
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_..."
}
```

### GET /api/stripe/check-account-status

Verifica lo stato di un account Stripe.

**Richiesta:**
```http
GET /api/stripe/check-account-status?accountId=acct_...
Authorization: Bearer <jwt-token>
```

**Risposta (200):**
```json
{
  "accountId": "acct_...",
  "detailsSubmitted": true,
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "onboardingComplete": true
}
```

## Webhook Endpoints

### POST /api/stripe/webhook

Gestisce i webhook di Stripe per aggiornamenti automatici.

**Headers richiesti:**
```
Stripe-Signature: t=...,v1=...
```

**Eventi gestiti:**
- `account.updated`: Aggiorna stato onboarding rider
- `payment_intent.succeeded`: Conferma pagamento prenotazione
- `payment_intent.payment_failed`: Gestisce pagamenti falliti

**Risposta (200):**
```json
{
  "received": true,
  "processed": true
}
```

## Codici di Errore

### Errori Comuni

| Codice | Descrizione |
|--------|-------------|
| `400` | Bad Request - Parametri mancanti o non validi |
| `401` | Unauthorized - Token di autenticazione mancante o non valido |
| `404` | Not Found - Risorsa non trovata |
| `500` | Internal Server Error - Errore interno del server |

### Errori Specifici Stripe

| Codice | Messaggio | Descrizione |
|--------|-----------|-------------|
| `stripe_account_not_found` | Account Stripe non trovato | L'account Stripe specificato non esiste |
| `onboarding_incomplete` | Onboarding non completato | L'account Stripe non ha completato l'onboarding |
| `webhook_verification_failed` | Verifica webhook fallita | La firma del webhook Stripe non è valida |

## Rate Limiting

Attualmente non ci sono limiti di rate implementati, ma si raccomanda di:
- Non superare 100 richieste al minuto per endpoint
- Implementare retry con backoff esponenziale per errori 5xx

## Esempi di Integrazione

### JavaScript/TypeScript

```typescript
// Inizia onboarding Stripe
const startOnboarding = async () => {
  const response = await fetch('/api/stripe/onboarding', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  if (data.url) {
    window.location.href = data.url;
  }
};

// Verifica stato onboarding
const checkStatus = async () => {
  const response = await fetch('/api/stripe/onboarding', {
    headers: {
      'Authorization': `Bearer ${supabaseToken}`
    }
  });
  
  return await response.json();
};
```

### cURL

```bash
# Inizia onboarding
curl -X POST https://yourdomain.com/api/stripe/onboarding \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json"

# Verifica stato
curl -X GET https://yourdomain.com/api/stripe/onboarding \
  -H "Authorization: Bearer <jwt-token>"
```

## Supporto

Per domande sull'API o problemi di integrazione:
- Email: dev@bemyrider.it
- GitHub Issues: [bemyrider/bemyrider](https://github.com/bemyrider/bemyrider/issues)
