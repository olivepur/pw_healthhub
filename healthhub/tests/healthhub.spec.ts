import { expect, test, type Page } from '@playwright/test';
import process from 'node:process';
import { clickButton, expectAlert, fillInput, selectCombobox } from '@library/components.fassade.spec';

const email = process.env.HEALTHHUB_EMAIL;
const password = process.env.HEALTHHUB_PASSWORD;

async function signIn(page: Page) {
  if (!email || !password) {
    throw new Error('Set HEALTHHUB_EMAIL and HEALTHHUB_PASSWORD before running these tests.');
  }

  await page.goto('/login');
  await fillInput(page, 'Email address*', email);
  await fillInput(page, 'Password*', password);
  await clickButton(page, 'Sign in');
  await expect(page).toHaveURL(/\/dashboard$/);
}

function localDateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

test('0 - sign in to HealthHub', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: /Good afternoon|Good morning|Good evening/ })).toBeVisible();
});

test('1 - create a new appointment', async ({ page }) => {
  await signIn(page);
  await page.goto('/appointments');
  await clickButton(page, 'New Appointment');

  const appointmentTitle = `PR 123`;
  const dialog = page.getByRole('dialog', { name: 'New Appointment' });
  await fillInput(dialog, 'Title*', appointmentTitle);
  await selectCombobox(dialog, 'Type', 'General');
  await fillInput(dialog, 'Date*', localDateOffset(1));
  await fillInput(dialog, 'Time*', '10:00');
  await fillInput(dialog, 'Provider', 'Dr. Playwright Test');
  await fillInput(dialog, 'Location', 'HealthHub Training Application');
  await clickButton(dialog, 'Create Appointment');
  await expectAlert(page, 'Appointment created successfully');
  await expect(dialog).toBeHidden();
});

test('2 - view health records', async ({ page }) => {
  await signIn(page);
  await page.goto('/health-records');

  await expect(page.getByRole('heading', { name: 'Health Records' })).toBeVisible();
  await expect(page.getByRole('table').getByRole('row').nth(1)).toBeVisible();
});

test('3 - add a medication', async ({ page }) => {
  await signIn(page);
  await page.goto('/medications');
  await clickButton(page, 'Add Medication');

  const medicationName = `Playwright Test Supplement ${Date.now()}`;
  const dialog = page.getByRole('dialog', { name: 'Add Medication' });
  await fillInput(dialog, 'Medication Name*', medicationName);
  await fillInput(dialog, 'Dosage*', '1 test unit');
  await selectCombobox(dialog, 'Frequency', 'Once daily');
  await fillInput(dialog, 'Start Date*', localDateOffset(0));
  await fillInput(dialog, 'Instructions', 'Training record created by an automated test.');
  await clickButton(dialog, 'Add Medication');

  await expect(page.getByText(medicationName, { exact: true })).toBeVisible();
});