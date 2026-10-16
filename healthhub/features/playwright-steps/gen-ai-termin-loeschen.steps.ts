// Erstellt von playwright-ai (bdd-codegen) – vor dem Uebernehmen pruefen.
import { expect, type Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { clickButton, fillInput, selectCombobox } from '@library/components.fassade.spec';

const { Given, When, Then } = createBdd();
// Eigener Zustand: der Titel aus "I have a scheduled general appointment for tomorrow"
// (gen-ai-termin-absagen.steps.ts) liegt in einer nicht exportierten WeakMap und ist hier nicht erreichbar.
const scenarioState = new WeakMap<object, { appointmentTitle?: string }>();

function appointmentTitleFor(page: Page) {
  const appointmentTitle = scenarioState.get(page)?.appointmentTitle;
  if (!appointmentTitle) {
    throw new Error('Appointment was not created in this scenario.');
  }
  return appointmentTitle;
}

// Die Suche filtert nicht zuverlaessig; "Recently Added" holt den neuen Termin auf Seite 1.
async function appointmentRow(page: Page) {
  await page.getByTestId('appointments-sort').selectOption({ label: 'Recently Added' });
  return page.getByRole('row', { name: appointmentTitleFor(page) });
}

async function openDeleteDialog(page: Page) {
  const row = await appointmentRow(page);
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Delete appointment' }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete Appointment' });
  await expect(dialog).toBeVisible();
  return dialog;
}

Given('I have a scheduled general appointment for tomorrow that I want to delete', async ({ page }) => {
  await page.goto('/appointments', { waitUntil: 'domcontentloaded' });
  await clickButton(page, 'New Appointment');

  const appointmentTitle = `BDD termin-loeschen ${Date.now()}`;
  scenarioState.set(page, { appointmentTitle });
  const dialog = page.getByRole('dialog', { name: 'New Appointment' });
  await expect(dialog).toBeVisible();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  await fillInput(dialog, 'Title*', appointmentTitle);
  await selectCombobox(dialog, 'Type', 'General');
  await fillInput(dialog, 'Date*', date);
  await fillInput(dialog, 'Time*', '10:00');
  await clickButton(dialog, 'Create Appointment');
  await expect(dialog).toBeHidden();
});

When('I delete the appointment', async ({ page }) => {
  const dialog = await openDeleteDialog(page);
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(dialog).toBeHidden();
});

When('I start to delete the appointment but cancel the confirmation', async ({ page }) => {
  const dialog = await openDeleteDialog(page);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toBeHidden();
});

Then('the appointment should no longer be in my appointment list', async ({ page }) => {
  // Die Zeile war vor dem Loeschen sichtbar (openDeleteDialog), toBeHidden prueft also ein echtes Verschwinden.
  const row = await appointmentRow(page);
  await expect(row).toBeHidden();
});

Then('the appointment should still be in my appointment list', async ({ page }) => {
  const row = await appointmentRow(page);
  await expect(row).toBeVisible();
  await expect(row.getByRole('cell', { name: 'Scheduled', exact: true })).toBeVisible();
});
