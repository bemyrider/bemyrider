import { test, expect } from '@playwright/test';

/**
 * Test sicuri per l'autenticazione - solo verifica UI, no submit
 */
test.describe('Autenticazione - Test Sicuri', () => {
  test('pagina login dovrebbe caricarsi correttamente', async ({ page }) => {
    test.setTimeout(15000);

    try {
      await page.goto('/auth/login', {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      // Verifica titolo pagina
      await expect(page).toHaveTitle(/bemyrider/);

      // Verifica elementi form senza interazioni
      await expect(page.locator('input[type="email"]')).toBeVisible({
        timeout: 5000,
      });
      await expect(page.locator('input[type="password"]')).toBeVisible({
        timeout: 5000,
      });
      await expect(page.locator('button:has-text("Accedi")')).toBeVisible({
        timeout: 5000,
      });

      // Verifica testo della pagina
      await expect(page.locator('text=Accedi al tuo account')).toBeVisible({
        timeout: 5000,
      });
    } catch (error) {
      console.error('❌ Test login fallito:', error);
      throw error;
    }
  });

  test('pagina registrazione dovrebbe caricarsi correttamente', async ({
    page,
  }) => {
    test.setTimeout(15000);

    try {
      await page.goto('/auth/register', {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      // Verifica elementi base
      await expect(page.locator('input[type="email"]')).toBeVisible({
        timeout: 5000,
      });

      // Verifica selezione ruolo - cerca l'opzione Rider specifica
      await expect(
        page
          .locator('div.cursor-pointer')
          .filter({ hasText: 'Rider' })
          .filter({ hasText: 'Effettuo consegne' })
      ).toBeVisible({ timeout: 5000 });
      await expect(
        page.locator('text=Create your bemyrider Account')
      ).toBeVisible({ timeout: 5000 });
    } catch (error) {
      console.error('❌ Test registrazione fallito:', error);
      throw error;
    }
  });

  test('link registrazione dovrebbe essere presente nella pagina login', async ({
    page,
  }) => {
    test.setTimeout(15000);

    try {
      await page.goto('/auth/login', {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      // Verifica link alla registrazione
      await expect(page.locator('text=Registrati')).toBeVisible({
        timeout: 5000,
      });
    } catch (error) {
      console.error('❌ Test link registrazione fallito:', error);
      throw error;
    }
  });
});
