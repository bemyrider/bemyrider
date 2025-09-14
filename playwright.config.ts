import { defineConfig, devices } from '@playwright/test';

/**
 * Configurazione sicura e minima per Playwright
 * Ottimizzata per evitare crash di sistema
 */
export default defineConfig({
  testDir: './tests',

  // Timeout ragionevoli per evitare blocchi
  timeout: 10000,
  expect: {
    timeout: 5000,
  },

  // Esecuzione sequenziale per ridurre carico
  fullyParallel: false,
  workers: 1,

  // Configurazione sicura per browser
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,

    // Screenshot solo su fallimento per risparmiare risorse
    screenshot: 'only-on-failure',

    // Video disabilitato per ridurre consumo memoria
    video: 'off',

    // Trace disabilitato inizialmente per performance
    trace: 'off',
  },

  // Solo browser principale per iniziare
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Configurazioni aggiuntive per stabilità
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        },
      },
    },
  ],

  // Reporter minimale
  reporter: [['list'], ['html', { open: 'never' }]],

  // Configurazione per evitare problemi di memoria
  globalSetup: undefined,
  globalTeardown: undefined,
});
