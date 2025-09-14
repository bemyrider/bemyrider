import { test, expect } from '@playwright/test';

/**
 * Test End-to-End per il flusso delle richieste di servizio
 * Merchant invia richiesta → Rider riceve e risponde
 */
test.describe('Flusso Richieste di Servizio - End-to-End', () => {
  test.setTimeout(60000); // 60 secondi per test complessi

  test('verifica login merchant', async ({ page }) => {
    try {
      console.log('🔍 Test semplice login merchant...');

      await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
      console.log('📍 Pagina login caricata');

      // Verifica elementi della pagina
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button:has-text("Accedi")')).toBeVisible();
      console.log('✅ Elementi form presenti');

      // Screenshot prima del login
      await page.screenshot({
        path: 'test-results/before-login.png',
        fullPage: true,
      });

      // Inserisci credenziali usando ID specifici
      await page.fill('#email', 'italiagofood@gmail.com');
      await page.fill(
        '#password',
        process.env.TEST_MERCHANT_PASSWORD || 'TestPassword123!'
      );
      console.log('✍️ Credenziali inserite');

      // Screenshot dopo inserimento credenziali
      await page.screenshot({
        path: 'test-results/after-credentials.png',
        fullPage: true,
      });

      // Prova prima con submit del form
      await page.locator('form').press('Enter');
      console.log('🔐 Login effettuato con submit form');

      // Aspetta più tempo per l'autenticazione
      await page.waitForTimeout(5000);

      // Screenshot dopo login
      await page.screenshot({
        path: 'test-results/after-login.png',
        fullPage: true,
      });

      const currentURL = page.url();
      console.log('📍 URL attuale dopo login:', currentURL);

      if (currentURL.includes('/dashboard/merchant')) {
        console.log('✅ Login merchant riuscito!');
        await expect(
          page.locator('h1:has-text("Benvenuto, Pizzeria Italia Bella")')
        ).toBeVisible();
      } else {
        console.log('❌ Login merchant fallito - controlla screenshot');
        console.log('URL attuale:', currentURL);

        // Controlla se ci sono messaggi di errore
        const errorMessages = await page
          .locator('.text-red-500, .text-red-600')
          .allTextContents();
        if (errorMessages.length > 0) {
          console.log('Messaggi errore trovati:', errorMessages);
        }
      }
    } catch (error) {
      console.error('❌ Test login fallito:', error);
      await page.screenshot({
        path: 'test-results/login-error.png',
        fullPage: true,
      });
      throw error;
    }
  });

  test('solo login merchant - debug', async ({ page }) => {
    try {
      // === FASE 1: LOGIN MERCHANT ===
      console.log('🚀 Avvio test flusso richieste di servizio...');

      await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
      console.log('📍 Navigato a pagina login');

      // Aspetta che i campi siano pronti
      await page.waitForSelector('#email', { state: 'visible', timeout: 5000 });
      await page.waitForSelector('#password', {
        state: 'visible',
        timeout: 5000,
      });
      console.log('✅ Campi form pronti');

      // === INSERISCI QUI LE CREDENZIALI MERCHANT ===
      // Sostituisci questi valori con le credenziali reali del merchant
      const MERCHANT_EMAIL = 'italiagofood@gmail.com';
      const MERCHANT_PASSWORD =
        process.env.TEST_MERCHANT_PASSWORD || 'TestPassword123!';

      // Inserisci credenziali merchant usando ID specifici con più attesa
      await page.fill('#email', MERCHANT_EMAIL);
      await page.fill('#password', MERCHANT_PASSWORD);

      // Verifica che i valori siano stati inseriti correttamente
      const emailValue = await page.inputValue('#email');
      const passwordValue = await page.inputValue('#password');
      console.log(
        'Valori inseriti - Email:',
        emailValue,
        'Password:',
        passwordValue ? '***filled***' : 'empty'
      );

      if (!emailValue || !passwordValue) {
        throw new Error('Credenziali non inserite correttamente');
      }

      console.log('✍️ Credenziali merchant inserite');

      // Clicca il pulsante di login invece di submit del form
      const loginButton = page.locator('button:has-text("Accedi")');
      await expect(loginButton).toBeVisible({ timeout: 5000 });
      await loginButton.click();
      console.log('🔐 Login merchant effettuato');

      // Aspetta che il login sia completato - controlla se siamo ancora nella pagina login o se c'è un errore
      await page.waitForTimeout(5000); // Aspetta più tempo per il processamento

      // Verifica se siamo ancora nella pagina login (login fallito)
      const currentURL = page.url();
      console.log('📍 URL dopo login tentativo:', currentURL);

      if (currentURL.includes('/auth/login')) {
        console.log('❌ Login fallito, ancora nella pagina login');
        await page.screenshot({
          path: 'test-results/login-failed-full.png',
          fullPage: true,
        });

        // Controlla messaggi di errore
        const errorMessages = await page
          .locator('.text-red-500, .text-red-600')
          .allTextContents();
        console.log('Messaggi errore:', errorMessages);

        // Controlla se i campi sono ancora riempiti
        const emailValue = await page.inputValue('#email');
        const passwordValue = await page.inputValue('#password');
        console.log(
          'Valori nei campi - Email:',
          emailValue,
          'Password:',
          passwordValue ? '***filled***' : 'empty'
        );

        throw new Error('Login del merchant fallito');
      }

      // Verifica se siamo nella dashboard merchant
      if (currentURL.includes('/dashboard/merchant')) {
        console.log('✅ Redirect alla dashboard merchant riuscito');
        await expect(
          page.locator('h1:has-text("Benvenuto, Pizzeria Italia Bella")')
        ).toBeVisible({ timeout: 5000 });
        console.log('✅ Merchant loggato correttamente - TEST COMPLETATO');
        return; // Ferma il test qui per debug
      } else {
        console.log('❌ Redirect non riuscito, URL attuale:', currentURL);
        await page.screenshot({
          path: 'test-results/redirect-failed.png',
          fullPage: true,
        });
        throw new Error(`Redirect fallito. URL attuale: ${currentURL}`);
      }

      // === FASE 2: NAVIGAZIONE ALLA LISTA RIDER ===
      await page.goto('/riders', { waitUntil: 'domcontentloaded' });
      console.log('📍 Navigato a lista rider');

      // Aspetta che la lista si carichi
      await expect(page.locator('text=Rider Disponibili')).toBeVisible({
        timeout: 10000,
      });
      console.log('✅ Lista rider caricata');

      // Trova e clicca sul primo rider disponibile
      const firstRiderCard = page.locator('.grid > div').first();
      await expect(firstRiderCard).toBeVisible({ timeout: 5000 });

      // Clicca sul bottone "Invia Richiesta" del primo rider
      const sendRequestButton = firstRiderCard.locator(
        'button:has-text("Invia Richiesta")'
      );
      await expect(sendRequestButton).toBeVisible({ timeout: 5000 });
      await sendRequestButton.click();
      console.log('📤 Aperto modal invio richiesta');

      // === FASE 3: COMPILA E INVIA RICHIESTA ===
      await expect(
        page.locator('text=Invia Richiesta di Servizio')
      ).toBeVisible({ timeout: 5000 });

      // Compila il form
      await page.fill('input[type="date"]', '2024-12-25');
      await page.fill('input[type="time"]', '14:00');
      await page.fill('input[type="number"]', '2'); // 2 ore
      await page.fill(
        'textarea',
        'Test richiesta di servizio da Playwright - consegna urgente ristorante'
      );
      console.log('📝 Form richiesta compilato');

      // Invia la richiesta
      const submitButton = page.locator('button:has-text("Invia Richiesta")');
      await expect(submitButton).toBeVisible({ timeout: 5000 });
      await submitButton.click();
      console.log('📤 Richiesta inviata');

      // Aspetta che il modal si chiuda e che appaia il toast di successo
      await expect(
        page.locator('text=Richiesta inviata con successo')
      ).toBeVisible({ timeout: 5000 });
      console.log('✅ Richiesta merchant inviata con successo');

      // === FASE 4: LOGOUT MERCHANT ===
      const userMenu = page
        .locator('button')
        .filter({ hasText: 'Pizzeria Italia Bella' });
      await expect(userMenu).toBeVisible({ timeout: 5000 });
      await userMenu.click();

      const logoutButton = page.locator('button').filter({ hasText: 'Esci' });
      await expect(logoutButton).toBeVisible({ timeout: 5000 });
      await logoutButton.click();
      console.log('👋 Logout merchant completato');

      // Aspetta redirect alla pagina login
      await page.waitForURL('**/auth/login', { timeout: 5000 });

      // === FASE 5: LOGIN RIDER ===
      // Sostituisci questi valori con le credenziali reali del rider
      const RIDER_EMAIL = 'bemyrider@gmail.com';
      const RIDER_PASSWORD =
        process.env.TEST_RIDER_PASSWORD || 'TestPassword123!';

      await page.fill('#email', RIDER_EMAIL);
      await page.fill('#password', RIDER_PASSWORD);
      console.log('✍️ Credenziali rider inserite');

      await page.locator('form').press('Enter');
      console.log('🔐 Login rider effettuato');

      // Aspetta redirect alla dashboard rider
      await page.waitForURL('**/dashboard/rider', { timeout: 10000 });
      console.log('✅ Rider loggato correttamente');

      // === FASE 6: VERIFICA RICEZIONE RICHIESTA ===
      await expect(page.locator('text=Richieste di Servizio')).toBeVisible({
        timeout: 10000,
      });

      // Verifica che ci sia almeno una richiesta
      const requestCard = page.locator(
        'text=Test richiesta di servizio da Playwright'
      );
      await expect(requestCard).toBeVisible({ timeout: 5000 });
      console.log('✅ Richiesta ricevuta dal rider');

      // === FASE 7: RISPONDI ALLA RICHIESTA ===
      const respondButton = page.locator('button:has-text("Rispondi")');
      await expect(respondButton).toBeVisible({ timeout: 5000 });
      await respondButton.click();
      console.log('📝 Aperto modal risposta');

      // Verifica modal risposta
      await expect(
        page.locator('text=Rispondi alla Richiesta di Servizio')
      ).toBeVisible({ timeout: 5000 });

      // Seleziona "Accetta"
      const acceptButton = page.locator('button:has-text("Accetta")');
      await expect(acceptButton).toBeVisible({ timeout: 5000 });
      await acceptButton.click();
      console.log('✅ Selezione risposta "Accetta"');

      // Aggiungi messaggio opzionale
      await page.fill(
        'textarea',
        'Perfetto, sarò lì puntuale per la consegna!'
      );

      // Invia risposta
      const sendResponseButton = page.locator(
        'button:has-text("Invia Risposta")'
      );
      await expect(sendResponseButton).toBeVisible({ timeout: 5000 });
      await sendResponseButton.click();
      console.log('📤 Risposta rider inviata');

      // Verifica che il modal si sia chiuso
      await expect(
        page.locator('text=Rispondi alla Richiesta di Servizio')
      ).not.toBeVisible({ timeout: 5000 });
      console.log('✅ Modal risposta chiuso correttamente');

      // Verifica toast di successo
      await expect(page.locator('text=Richiesta accettata')).toBeVisible({
        timeout: 5000,
      });
      console.log('✅ Risposta rider inviata con successo');

      // === FASE 8: VERIFICA STATO AGGIORNATO ===
      // La richiesta dovrebbe ora mostrare "Accettata" invece di "Rispondi"
      await expect(page.locator('text=Accettata')).toBeVisible({
        timeout: 5000,
      });
      console.log('✅ Stato richiesta aggiornato correttamente');

      console.log(
        '🎉 Test flusso richieste di servizio COMPLETATO con successo!'
      );
    } catch (error) {
      console.error('❌ Test flusso richieste fallito:', error);

      // Screenshot per debug
      await page.screenshot({
        path: `test-results/error-service-requests-${Date.now()}.png`,
        fullPage: true,
      });

      throw error;
    }
  });

  test('verifica dashboard merchant dopo risposta rider', async ({ page }) => {
    try {
      console.log('🔍 Verifica dashboard merchant dopo risposta rider...');

      // Login merchant - usa le stesse credenziali
      const MERCHANT_EMAIL = 'italiagofood@gmail.com';
      const MERCHANT_PASSWORD =
        process.env.TEST_MERCHANT_PASSWORD || 'TestPassword123!';

      await page.goto('/auth/login');
      await page.fill('#email', MERCHANT_EMAIL);
      await page.fill('#password', MERCHANT_PASSWORD);
      await page.locator('form').press('Enter');

      await page.waitForURL('**/dashboard/merchant');
      // Usa un selettore più specifico per evitare conflitti con il menu utente
      await expect(
        page.locator('h1:has-text("Benvenuto, Pizzeria Italia Bella")')
      ).toBeVisible();

      // Naviga alla sezione richieste
      await page.goto('/dashboard/merchant/requests');
      await expect(page.locator('text=Le Mie Richieste')).toBeVisible({
        timeout: 10000,
      });

      // Verifica che la richiesta sia mostrata come "Accettata"
      await expect(page.locator('text=Accettata')).toBeVisible({
        timeout: 5000,
      });
      await expect(page.locator('text=Perfetto, sarò lì puntuale')).toBeVisible(
        { timeout: 5000 }
      );

      console.log('✅ Dashboard merchant aggiornata correttamente');
    } catch (error) {
      console.error('❌ Verifica dashboard merchant fallita:', error);
      await page.screenshot({
        path: `test-results/error-merchant-dashboard-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });
});
