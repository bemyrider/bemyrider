/**
 * 🧪 TEST WEBHOOK STRIPE
 *
 * Script per testare l'endpoint webhook di Stripe
 * Verifica che il webhook gestisca correttamente gli eventi
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/stripe/webhook/route';

// Mock delle dipendenze
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: null,
        })),
      })),
    })),
  })),
}));

jest.mock('stripe', () => ({
  __esModule: true,
  default: class MockStripe {
    webhooks = {
      constructEventAsync: jest.fn(),
    };
  },
}));

describe('/api/stripe/webhook', () => {
  let mockConstructEventAsync: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock della funzione constructEventAsync
    const stripe = require('stripe').default;
    mockConstructEventAsync = stripe.prototype.webhooks.constructEventAsync;
  });

  it('✅ Gestisce correttamente evento account.updated con onboarding completato', async () => {
    // Mock evento account.updated con onboarding completato
    const mockEvent = {
      type: 'account.updated',
      data: {
        object: {
          id: 'acct_test_123',
          details_submitted: true,
          charges_enabled: true,
          payouts_enabled: true,
        },
      },
    };

    mockConstructEventAsync.mockResolvedValue(mockEvent);

    // Crea richiesta mock
    const request = new NextRequest(
      'http://localhost:3000/api/stripe/webhook',
      {
        method: 'POST',
        headers: {
          'stripe-signature': 't=1234567890,v1=test_signature',
          'content-type': 'application/json',
        },
        body: JSON.stringify(mockEvent),
      }
    );

    // Esegui il webhook
    const response = await POST(request);
    const responseData = await response.json();

    // Verifica risposta
    expect(response.status).toBe(200);
    expect(responseData.received).toBe(true);

    // Verifica che constructEventAsync sia stato chiamato correttamente
    expect(mockConstructEventAsync).toHaveBeenCalledWith(
      JSON.stringify(mockEvent),
      't=1234567890,v1=test_signature',
      expect.any(String) // STRIPE_WEBHOOK_SECRET
    );

    console.log('✅ Test account.updated completato con successo');
  });

  it('✅ Gestisce correttamente evento account.updated con onboarding incompleto', async () => {
    // Mock evento account.updated con onboarding incompleto
    const mockEvent = {
      type: 'account.updated',
      data: {
        object: {
          id: 'acct_test_456',
          details_submitted: false,
          charges_enabled: false,
          payouts_enabled: false,
        },
      },
    };

    mockConstructEventAsync.mockResolvedValue(mockEvent);

    // Crea richiesta mock
    const request = new NextRequest(
      'http://localhost:3000/api/stripe/webhook',
      {
        method: 'POST',
        headers: {
          'stripe-signature': 't=1234567890,v1=test_signature',
          'content-type': 'application/json',
        },
        body: JSON.stringify(mockEvent),
      }
    );

    // Esegui il webhook
    const response = await POST(request);
    const responseData = await response.json();

    // Verifica risposta
    expect(response.status).toBe(200);
    expect(responseData.received).toBe(true);

    console.log('✅ Test account.updated incompleto gestito correttamente');
  });

  it('❌ Rigetta webhook con firma non valida', async () => {
    // Mock errore di firma
    mockConstructEventAsync.mockRejectedValue(new Error('Invalid signature'));

    // Crea richiesta mock
    const request = new NextRequest(
      'http://localhost:3000/api/stripe/webhook',
      {
        method: 'POST',
        headers: {
          'stripe-signature': 't=1234567890,v1=invalid_signature',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ type: 'test' }),
      }
    );

    // Esegui il webhook
    const response = await POST(request);
    const responseData = await response.json();

    // Verifica risposta di errore
    expect(response.status).toBe(400);
    expect(responseData.error).toContain('Invalid signature');

    console.log('✅ Test firma non valida rigettato correttamente');
  });

  it('📨 Gestisce eventi non supportati', async () => {
    // Mock evento non supportato
    const mockEvent = {
      type: 'customer.created',
      data: {
        object: {
          id: 'cus_test_123',
        },
      },
    };

    mockConstructEventAsync.mockResolvedValue(mockEvent);

    // Crea richiesta mock
    const request = new NextRequest(
      'http://localhost:3000/api/stripe/webhook',
      {
        method: 'POST',
        headers: {
          'stripe-signature': 't=1234567890,v1=test_signature',
          'content-type': 'application/json',
        },
        body: JSON.stringify(mockEvent),
      }
    );

    // Esegui il webhook
    const response = await POST(request);
    const responseData = await response.json();

    // Verifica risposta
    expect(response.status).toBe(200);
    expect(responseData.received).toBe(true);

    console.log('✅ Test evento non supportato gestito correttamente');
  });

  it('🔍 Logga informazioni dettagliate per debugging', async () => {
    // Mock evento account.updated
    const mockEvent = {
      type: 'account.updated',
      data: {
        object: {
          id: 'acct_test_debug',
          details_submitted: true,
          charges_enabled: true,
          payouts_enabled: true,
        },
      },
    };

    mockConstructEventAsync.mockResolvedValue(mockEvent);

    // Spy su console.log per verificare i log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Crea richiesta mock
    const request = new NextRequest(
      'http://localhost:3000/api/stripe/webhook',
      {
        method: 'POST',
        headers: {
          'stripe-signature': 't=1234567890,v1=test_signature',
          'content-type': 'application/json',
        },
        body: JSON.stringify(mockEvent),
      }
    );

    // Esegui il webhook
    await POST(request);

    // Verifica che siano stati loggati i messaggi appropriati
    expect(consoleSpy).toHaveBeenCalledWith(
      '🔄 Webhook ricevuto per account:',
      'acct_test_debug'
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      '✅ Onboarding completato per account:',
      'acct_test_debug'
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      '✅ Database aggiornato con successo per account:',
      'acct_test_debug'
    );

    consoleSpy.mockRestore();
    console.log('✅ Test logging dettagliato completato');
  });
});
