# 🧪 Testing Strategy - bemyrider

Questa guida descrive la strategia completa di testing per bemyrider, includendo setup, esecuzione e best practices per garantire qualità e affidabilità del codice.

## 📋 Indice

- [Panoramica Strategia](#-panoramica-strategia)
- [Setup Ambiente Testing](#-setup-ambiente-testing)
- [Testing Pyramid](#-testing-pyramid)
- [Unit Testing](#-unit-testing)
- [Integration Testing](#-integration-testing)
- [End-to-End Testing](#-end-to-end-testing)
- [API Testing](#-api-testing)
- [Performance Testing](#-performance-testing)
- [Security Testing](#-security-testing)
- [Test Automation](#-test-automation)
- [CI/CD Integration](#-cicd-integration)
- [Best Practices](#-best-practices)

## 🎯 Panoramica Strategia

### Obiettivi Testing
- **Qualità**: Garantire che il codice funzioni come previsto
- **Affidabilità**: Prevenire regressioni e bug in produzione
- **Manutenibilità**: Codice testato è più facile da modificare
- **Performance**: Verificare che le performance siano accettabili
- **Sicurezza**: Testare vulnerabilità e sicurezza dei dati

### Metriche di Successo
- **Coverage**: ≥ 80% statements, ≥ 75% branches, ≥ 85% functions
- **Reliability**: < 0.1% bug rate in produzione
- **Performance**: < 2 secondi tempo di risposta medio
- **Security**: Zero vulnerabilità critiche

## 🛠️ Setup Ambiente Testing

### Dipendenze Principali
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "playwright": "^1.40.0",
    "supertest": "^6.3.0",
    "cypress": "^13.0.0",
    "k6": "^0.47.0"
  }
}
```

### Configurazione Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_*.{js,jsx,ts,tsx}'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80
    }
  }
};
```

### Setup File
```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    }))
  }
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    query: {}
  })
}));
```

## 🏗️ Testing Pyramid

```
          E2E Tests (Slow, High Value)
                 ↗️
    Integration Tests (Medium, Medium Value)
                 ↗️
Unit Tests (Fast, Low Value)
```

### Distribuzione Test
- **Unit Tests**: 70% - Test isolati di funzioni/componenti
- **Integration Tests**: 20% - Test interazioni tra componenti
- **E2E Tests**: 10% - Test flussi utente completi

## 🧩 Unit Testing

### Componenti React
```typescript
// __tests__/components/RiderCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RiderCard } from '@/components/RiderCard';

const mockRider = {
  id: '1',
  fullName: 'Mario Rossi',
  hourlyRate: 12.50,
  avgRating: 4.8,
  vehicleType: 'e_bike' as const,
  profilePictureUrl: 'https://example.com/photo.jpg'
};

describe('RiderCard', () => {
  it('renders rider information correctly', () => {
    render(<RiderCard rider={mockRider} />);

    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getByText('€12.50/ora')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByAltText('Foto profilo Mario Rossi')).toBeInTheDocument();
  });

  it('displays correct vehicle icon', () => {
    render(<RiderCard rider={mockRider} />);

    const vehicleIcon = screen.getByTestId('vehicle-icon');
    expect(vehicleIcon).toHaveAttribute('data-icon', 'e-bike');
  });

  it('calls onContact when contact button is clicked', () => {
    const mockOnContact = jest.fn();
    render(<RiderCard rider={mockRider} onContact={mockOnContact} />);

    const contactButton = screen.getByRole('button', { name: /contatta/i });
    fireEvent.click(contactButton);

    expect(mockOnContact).toHaveBeenCalledWith('1');
  });

  it('shows loading state when isLoading is true', () => {
    render(<RiderCard rider={mockRider} isLoading={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Mario Rossi')).not.toBeInTheDocument();
  });
});
```

### Custom Hooks
```typescript
// __tests__/hooks/useRiderAvailability.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRiderAvailability } from '@/hooks/useRiderAvailability';

const mockSupabaseResponse = {
  data: [
    {
      id: '1',
      rider_id: 'rider-1',
      day_of_week: 'Lun',
      start_time: '09:00',
      end_time: '17:00'
    }
  ],
  error: null
};

describe('useRiderAvailability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns rider availability', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue(mockSupabaseResponse)
    }));

    // Mock the supabase client
    jest.mock('@/lib/supabase', () => ({
      supabase: { from: mockFrom }
    }));

    const { result } = renderHook(() => useRiderAvailability('rider-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.availability).toEqual(mockSupabaseResponse.data);
    expect(result.current.error).toBe(null);
  });

  it('handles error states', async () => {
    const mockError = new Error('Database connection failed');
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockRejectedValue(mockError)
    }));

    jest.mock('@/lib/supabase', () => ({
      supabase: { from: mockFrom }
    }));

    const { result } = renderHook(() => useRiderAvailability('rider-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.availability).toEqual([]);
  });
});
```

### Utility Functions
```typescript
// __tests__/utils/formatters.test.ts
import { formatCurrency, formatDate, formatDuration } from '@/utils/formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats euro amounts correctly', () => {
      expect(formatCurrency(12.5)).toBe('€12.50');
      expect(formatCurrency(1000)).toBe('€1,000.00');
      expect(formatCurrency(0)).toBe('€0.00');
    });

    it('handles negative amounts', () => {
      expect(formatCurrency(-50)).toBe('-€50.00');
    });

    it('rounds to 2 decimal places', () => {
      expect(formatCurrency(12.345)).toBe('€12.35');
      expect(formatCurrency(12.344)).toBe('€12.34');
    });
  });

  describe('formatDate', () => {
    it('formats dates in Italian locale', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date)).toBe('15 gennaio 2024');
    });

    it('formats time correctly', () => {
      const date = new Date('2024-01-15T14:30:00');
      expect(formatDate(date, { includeTime: true })).toBe('15 gennaio 2024, 14:30');
    });
  });

  describe('formatDuration', () => {
    it('formats hours and minutes', () => {
      expect(formatDuration(90)).toBe('1 ora e 30 minuti');
      expect(formatDuration(60)).toBe('1 ora');
      expect(formatDuration(30)).toBe('30 minuti');
    });

    it('handles zero duration', () => {
      expect(formatDuration(0)).toBe('0 minuti');
    });
  });
});
```

## 🔗 Integration Testing

### API Routes
```typescript
// __tests__/api/service-requests.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/service-requests';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('/api/service-requests', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn()
      },
      from: jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ id: '1', status: 'pending' }],
          error: null
        })
      }))
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('creates service request successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: {
        riderId: 'rider-1',
        startDate: '2024-01-15',
        startTime: '10:00',
        duration: 2,
        description: 'Consegna urgente'
      }
    });

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'merchant-1' } },
      error: null
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.request).toHaveProperty('id');
  });

  it('validates required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: {
        // Missing required fields
        riderId: 'rider-1'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
  });

  it('handles authentication errors', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {}
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });
});
```

### Database Integration
```typescript
// __tests__/integration/database/service-requests.test.ts
import { createClient } from '@supabase/supabase-js';
import { ServiceRequestService } from '@/services/ServiceRequestService';

describe('ServiceRequestService Integration', () => {
  let supabase: any;
  let service: ServiceRequestService;

  beforeEach(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.***REMOVED***!
    );
    service = new ServiceRequestService(supabase);
  });

  describe('createServiceRequest', () => {
    it('creates service request and updates related tables', async () => {
      const requestData = {
        merchantId: 'merchant-1',
        riderId: 'rider-1',
        startTime: new Date('2024-01-15T10:00:00Z'),
        duration: 2,
        description: 'Test delivery'
      };

      const result = await service.createServiceRequest(requestData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');

      // Verify database state
      const { data: booking } = await supabase
        .from('prenotazioni')
        .select('*')
        .eq('id', result.data!.id)
        .single();

      expect(booking).toBeTruthy();
      expect(booking.status).toBe('in_attesa');
    });

    it('handles concurrent requests correctly', async () => {
      const requestData = {
        merchantId: 'merchant-1',
        riderId: 'rider-1',
        startTime: new Date('2024-01-15T10:00:00Z'),
        duration: 2,
        description: 'Concurrent test'
      };

      // Create multiple concurrent requests
      const promises = Array(5).fill().map(() =>
        service.createServiceRequest(requestData)
      );

      const results = await Promise.all(promises);

      // Verify all succeeded (no race conditions)
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});
```

## 🌐 End-to-End Testing

### Playwright Setup
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example
```typescript
// e2e/service-request-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Service Request Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test data
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'merchant@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard/merchant');
  });

  test('complete service request flow', async ({ page }) => {
    // Navigate to rider search
    await page.click('[data-testid="search-riders"]');
    await expect(page).toHaveURL('/search');

    // Search for available rider
    await page.fill('[data-testid="location-search"]', 'Milano');
    await page.click('[data-testid="search-button"]');

    // Wait for results
    await page.waitForSelector('[data-testid="rider-card"]');
    const riderCards = page.locator('[data-testid="rider-card"]');
    await expect(riderCards).toHaveCountGreaterThan(0);

    // Select first rider
    await riderCards.first().click();

    // Fill service request form
    await page.fill('[data-testid="date-input"]', '2024-01-20');
    await page.fill('[data-testid="time-input"]', '14:00');
    await page.selectOption('[data-testid="duration-select"]', '2');
    await page.fill('[data-testid="description-input"]', 'Consegna urgente ristorante');

    // Submit request
    await page.click('[data-testid="submit-request"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Richiesta inviata');

    // Check dashboard
    await page.goto('/dashboard/merchant');
    await expect(page.locator('[data-testid="pending-requests"]')).toContainText('1');
  });

  test('rider accepts service request', async ({ page, context }) => {
    // Create new page for rider
    const riderPage = await context.newPage();

    // Rider login
    await riderPage.goto('/auth/login');
    await riderPage.fill('[data-testid="email"]', 'rider@test.com');
    await riderPage.fill('[data-testid="password"]', 'password123');
    await riderPage.click('[data-testid="login-button"]');

    // Check for new request notification
    await expect(riderPage.locator('[data-testid="notification-badge"]')).toBeVisible();

    // View request details
    await riderPage.click('[data-testid="view-request"]');
    await expect(riderPage.locator('[data-testid="request-description"]')).toContainText('Consegna urgente');

    // Accept request
    await riderPage.click('[data-testid="accept-request"]');

    // Confirm acceptance
    await riderPage.click('[data-testid="confirm-acceptance"]');

    // Verify status update
    await expect(riderPage.locator('[data-testid="request-status"]')).toContainText('Accettata');

    // Verify merchant notification (on original page)
    await expect(page.locator('[data-testid="request-status"]')).toContainText('Accettata');
  });
});
```

## 🔌 API Testing

### Supertest per API Routes
```typescript
// __tests__/api/stripe/webhook.test.ts
import request from 'supertest';
import { createServer } from 'http';
import handler from '@/pages/api/stripe/webhook';

describe('/api/stripe/webhook', () => {
  let server: any;

  beforeAll(() => {
    server = createServer((req, res) => {
      handler(req, res);
    });
  });

  it('handles account.updated event', async () => {
    const webhookPayload = {
      id: 'evt_test_webhook',
      object: 'event',
      type: 'account.updated',
      data: {
        object: {
          id: 'acct_test_account',
          details_submitted: true,
          charges_enabled: true
        }
      }
    };

    const signature = 't=1234567890,v1=test_signature';

    const response = await request(server)
      .post('/api/stripe/webhook')
      .set('Stripe-Signature', signature)
      .send(webhookPayload)
      .expect(200);

    expect(response.body.received).toBe(true);
    expect(response.body.processed).toBe(true);
  });

  it('verifies webhook signature', async () => {
    const response = await request(server)
      .post('/api/stripe/webhook')
      .send({ type: 'test' })
      .expect(400);

    expect(response.body.error).toContain('Invalid signature');
  });

  it('handles payment_intent.succeeded', async () => {
    const paymentIntentPayload = {
      id: 'evt_payment_succeeded',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_payment',
          amount: 2500,
          currency: 'eur',
          status: 'succeeded'
        }
      }
    };

    // Mock database update
    const mockUpdate = jest.fn().mockResolvedValue({ success: true });

    const response = await request(server)
      .post('/api/stripe/webhook')
      .set('Stripe-Signature', 't=123,v1=valid')
      .send(paymentIntentPayload)
      .expect(200);

    expect(mockUpdate).toHaveBeenCalled();
  });
});
```

## ⚡ Performance Testing

### K6 Load Testing
```javascript
// performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test homepage load
  const homepageResponse = http.get(`${BASE_URL}/`);
  check(homepageResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  // Test search functionality
  const searchResponse = http.get(`${BASE_URL}/search?q=milano`);
  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  // Test API endpoint
  const apiResponse = http.get(`${BASE_URL}/api/riders`);
  check(apiResponse, {
    'API status is 200': (r) => r.status === 200,
    'API response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}
```

### Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  pull_request:
    branches: [ main, develop ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/search
            http://localhost:3000/dashboard/rider
          configPath: ./lighthouse.config.js
          uploadArtifacts: true
          temporaryPublicStorage: true
```

## 🔒 Security Testing

### Dependency Vulnerability Scanning
```yaml
# .github/workflows/security.yml
name: Security Scan
on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Mondays
  push:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run npm audit
        run: npm audit --audit-level high
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Authentication Testing
```typescript
// __tests__/security/auth.test.ts
import request from 'supertest';
import { createServer } from 'http';
import handler from '@/pages/api/auth/login';

describe('Authentication Security', () => {
  it('prevents brute force attacks', async () => {
    const server = createServer((req, res) => handler(req, res));

    // Attempt multiple failed logins
    for (let i = 0; i < 10; i++) {
      await request(server)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
    }

    // Next attempt should be rate limited
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(429); // Too Many Requests
  });

  it('validates JWT tokens properly', async () => {
    const server = createServer((req, res) => handler(req, res));

    // Test with malformed JWT
    const response = await request(server)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid.jwt.token');

    expect(response.status).toBe(401);
  });

  it('prevents SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";

    // This should be sanitized and not execute SQL
    const result = await searchRiders(maliciousInput);

    // Should return safe results, not error
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
```

## 🤖 Test Automation

### GitHub Actions CI/CD
```yaml
# .github/workflows/test.yml
name: Test Suite
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit
        env:
          ***REMOVED***: ***REMOVED***postgres:postgres@localhost:5432/test

      - name: Run integration tests
        run: npm run test:integration
        env:
          ***REMOVED***: ***REMOVED***postgres:postgres@localhost:5432/test

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 📋 Best Practices

### Test Organization
- **File Naming**: `*.test.ts`, `*.spec.ts`
- **Directory Structure**: Mirror source code structure
- **Test Groups**: Describe blocks per funzionalità
- **Test Cases**: it() blocks per scenario specifico

### Test Data Management
- **Factories**: Crea dati di test consistenti
- **Fixtures**: Usa dati statici per test prevedibili
- **Cleanup**: Rimuovi dati di test dopo esecuzione
- **Isolation**: Ogni test indipendente dagli altri

### Mocking Strategy
- **External APIs**: Mock Stripe, email services
- **Database**: Usa database di test isolato
- **File System**: Mock operazioni su file
- **Date/Time**: Freeze time per test deterministici

### Performance Testing
- **Realistic Load**: Simula utenti reali
- **Progressive Scaling**: Aumenta gradualmente il load
- **Monitoring**: Traccia metriche chiave
- **Thresholds**: Definisci limiti accettabili

### Accessibility Testing
```typescript
// __tests__/accessibility/RiderCard.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RiderCard } from '@/components/RiderCard';

expect.extend(toHaveNoViolations);

describe('RiderCard Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<RiderCard rider={mockRider} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA labels', () => {
    render(<RiderCard rider={mockRider} />);

    expect(screen.getByLabelText('Foto profilo di Mario Rossi')).toBeInTheDocument();
    expect(screen.getByLabelText('Contatta Mario Rossi')).toBeInTheDocument();
    expect(screen.getByLabelText('Valutazione media: 4.8 stelle')).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(<RiderCard rider={mockRider} />);

    const contactButton = screen.getByRole('button', { name: /contatta/i });

    // Tab to button
    userEvent.tab();
    expect(contactButton).toHaveFocus();

    // Activate with Enter
    userEvent.keyboard('{enter}');
    expect(mockOnContact).toHaveBeenCalled();
  });
});
```

### Continuous Testing
- **Pre-commit Hooks**: Esegui test prima del commit
- **Branch Protection**: Richiedi test per merge
- **Nightly Runs**: Test completi ogni notte
- **Performance Regression**: Monitora performance over time

Questa strategia di testing garantisce che bemyrider mantenga alti standard di qualità, affidabilità e sicurezza in ogni fase dello sviluppo.
