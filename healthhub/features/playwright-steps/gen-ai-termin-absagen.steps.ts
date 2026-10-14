// Erstellt von playwright-ai (bdd-codegen) – vor dem Uebernehmen pruefen.
import { expect, type Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { clickButton, fillInput, selectCombobox, selectRadioButton } from '@library/components.fassade.spec';

const { Given, When, Then } = createBdd();
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
  const row = page.getByRole('row', { name: appointmentTitleFor(page) });
  await expect(row).toBeVisible();
  return row;
}

async function openEditDialog(page: Page) {
  const row = await appointmentRow(page);
  await row.getByRole('button', { name: 'Edit appointment' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit Appointment' });
  await expect(dialog).toBeVisible();
  return dialog;
}

Given('I have a scheduled general appointment for tomorrow', async ({ page }) => {
  await page.goto('/appointments');
  await clickButton(page, 'New Appointment');

  const appointmentTitle = `BDD cancel ${Date.now()}`;
  scenarioState.set(page, { appointmentTitle });
  const dialog = page.getByRole('dialog', { name: 'New Appointment' });
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

When('I cancel the appointment', async ({ page }) => {
  const dialog = await openEditDialog(page);
  await selectRadioButton(dialog, 'Cancelled');
  await clickButton(dialog, 'Update Appointment');
  await expect(dialog).toBeHidden();
});

When('I start to cancel the appointment but discard the change', async ({ page }) => {
  const dialog = await openEditDialog(page);
  await selectRadioButton(dialog, 'Cancelled');
  await clickButton(dialog, 'Cancel');
  await expect(dialog).toBeHidden();
});

When('I reload the appointments page', async ({ page }) => {
  // Nicht auf "load" warten: die Seite laedt langsam, der Then-Step wartet ohnehin auf die Zeile.
  await page.reload({ waitUntil: 'domcontentloaded' });
});

Then('the appointment should have the status {string}', async ({ page }, status: string) => {
  const row = await appointmentRow(page);
  await expect(row.getByRole('cell', { name: status, exact: true })).toBeVisible();
});
