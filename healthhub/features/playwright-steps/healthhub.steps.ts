import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import process from 'node:process';
import { clickButton, expectAlert, fillInput, selectCombobox } from '@library/components.fassade.spec';

const { Given, When, Then } = createBdd();
const scenarioState = new WeakMap<object, { appointmentTitle?: string; medicationName?: string }>();

function stateFor(page: object) {
  let state = scenarioState.get(page);
  if (!state) {
    state = {};
    scenarioState.set(page, state);
  }
  return state;
}

Given('I am signed in to HealthHub', async ({ page }) => {
  const { HEALTHHUB_EMAIL: email, HEALTHHUB_PASSWORD: password } = process.env;
  if (!email || !password) {
    throw new Error('Set HEALTHHUB_EMAIL and HEALTHHUB_PASSWORD in healthhub/env.local.json.');
  }

  await page.goto('/login');
  await fillInput(page, 'Email address*', email);
  await fillInput(page, 'Password*', password);
  await clickButton(page, 'Sign in');
  await expect(page).toHaveURL(/\/dashboard$/);
});

When('I create a general appointment for tomorrow', async ({ page }) => {
  await page.goto('/appointments');
  await clickButton(page, 'New Appointment');

  const appointmentTitle = `BDD appointment ${Date.now()}`;
  stateFor(page).appointmentTitle = appointmentTitle;
  const dialog = page.getByRole('dialog', { name: 'New Appointment' });
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  await fillInput(dialog, 'Title*', appointmentTitle);
  await selectCombobox(dialog, 'Type', 'General');
  await fillInput(dialog, 'Date*', date);
  await fillInput(dialog, 'Time*', '10:00');
  await fillInput(dialog, 'Provider', 'Dr. Playwright BDD');
  await fillInput(dialog, 'Location', 'HealthHub Training Application');
  await clickButton(dialog, 'Create Appointment');
  await expect(dialog).toBeHidden();
});

Then('I should see the appointment confirmation {string}', async ({ page }, message: string) => {
  await expectAlert(page, message);
});

When('I open Health Records', async ({ page }) => {
  await page.goto('/health-records');
});

Then('I should see the Health Records page and an existing record', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Health Records' })).toBeVisible();
  await expect(page.getByRole('table').getByRole('row').nth(1)).toBeVisible();
});

When('I add a sample medication', async ({ page }) => {
  await page.goto('/medications');
  await clickButton(page, 'Add Medication');

  const medicationName = `BDD Test Medication ${Date.now()}`;
  stateFor(page).medicationName = medicationName;
  const dialog = page.getByRole('dialog', { name: 'Add Medication' });
  const today = new Date();
  const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  await fillInput(dialog, 'Medication Name*', medicationName);
  await fillInput(dialog, 'Dosage*', '1 test unit');
  await selectCombobox(dialog, 'Frequency', 'Once daily');
  await fillInput(dialog, 'Start Date*', startDate);
  await fillInput(dialog, 'Instructions', 'Training record created by a BDD test.');
  await clickButton(dialog, 'Add Medication');
});

Then('I should see the medication in my list', async ({ page }) => {
  const medicationName = stateFor(page).medicationName;
  if (!medicationName) {
    throw new Error('Medication was not created in this scenario.');
  }
  await expect(page.getByText(medicationName, { exact: true })).toBeVisible();
});