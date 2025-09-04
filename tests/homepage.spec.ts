import { test, expect } from '@playwright/test';

/**
 * Test sicuri per la homepage - versione minima per evitare crash
 */
test.describe('Homepage - Test Sicuri', () => {
  test('dovrebbe caricare la homepage correttamente', async ({ page }) => {
    // Timeout esplicito per questo test
    test.setTimeout(15000);

    try {
      // Carica la homepage con timeout
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 });

      // Verifica che la pagina sia caricata (controllo base)
      await expect(page).toHaveTitle(/bemyrider/);

      // Verifica elementi essenziali senza interazioni pesanti
      await expect(
        page.locator('h1').filter({ hasText: 'Connetti Rider e Esercenti' })
      ).toBeVisible({ timeout: 5000 });
    } catch (error) {
      console.error('❌ Test homepage fallito:', error);
      throw error;
    }
  });

  test('dovrebbe mostrare i pulsanti principali', async ({ page }) => {
    test.setTimeout(15000);

    try {
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 });

      // Verifica presenza pulsanti senza cliccarli
      await expect(page.locator('text=Diventa Rider')).toBeVisible({
        timeout: 5000,
      });
      await expect(page.locator('text=Registra la tua Attività')).toBeVisible({
        timeout: 5000,
      });
    } catch (error) {
      console.error('❌ Test pulsanti fallito:', error);
      throw error;
    }
  });

  test('dovrebbe mostrare il logo bemyrider', async ({ page }) => {
    test.setTimeout(15000);

    try {
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 });

      // Verifica logo (se presente come immagine)
      const logo = page
        .locator('img[alt*="bemyrider"]')
        .or(page.locator('text=bemyrider'));
      await expect(logo.first()).toBeVisible({ timeout: 5000 });
    } catch (error) {
      console.error('❌ Test logo fallito:', error);
      throw error;
    }
  });
});
