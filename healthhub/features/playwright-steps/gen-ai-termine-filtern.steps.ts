// Erstellt von playwright-ai (bdd-codegen) – vor dem Uebernehmen pruefen.
import { expect, type Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

// Datenzeilen haben "Edit appointment", die Kopfzeile nicht.
async function expectRowsOfPageHaveStatus(page: Page, status: string) {
  const rows = page.getByRole('row').filter({ has: page.getByRole('button', { name: 'Edit appointment' }) });
  await expect(rows.first()).toBeVisible();
  await expect(rows.filter({ hasNot: page.getByRole('cell', { name: status, exact: true }) })).toHaveCount(0);
}

When('I filter my appointments by the status {string}', async ({ page }, status: string) => {
  if (!page.url().endsWith('/appointments')) {
    await page.goto('/appointments', { waitUntil: 'domcontentloaded' });
  }
  // Das Select hat keinen zugaenglichen Namen, deshalb data-testid.
  const statusFilter = page.getByTestId('appointments-status-filter');
  await expect(statusFilter).toBeVisible();
  await statusFilter.selectOption({ label: status });
});

Then('every appointment on all pages should have the status {string}', async ({ page }, status: string) => {
  await expectRowsOfPageHaveStatus(page, status);

  // Bis 10 Treffer gibt es keine Seitennavigation; sonst Buttons appointments-page-1 … -N mit 10 Zeilen je Seite.
  const pagination = page.getByTestId('appointments-pagination');
  for (let pageNumber = 2; (await page.getByTestId(`appointments-page-${pageNumber}`).count()) > 0; pageNumber++) {
    await page.getByTestId(`appointments-page-${pageNumber}`).click();
    await expect(pagination).toContainText(`Showing ${(pageNumber - 1) * 10 + 1} to`);
    await expectRowsOfPageHaveStatus(page, status);
  }
});
