import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { clickButton, expectAlert, fillInput, selectCombobox } from '@library/components.fassade.spec';
import type { HealthHubWorld } from '@support/world';

Given('I am signed in to HealthHub', async function (this: HealthHubWorld) {
  const credentials = this.credentials;
  if (!credentials?.email || !credentials.password) {
    throw new Error('Add email and password to healthhub/env.local.json.');
  }

  const page = this.currentPage;
  await page.goto('https://healthhub.qualintia.com/login');
  await fillInput(page, 'Email address*', credentials.email);
  await fillInput(page, 'Password*', credentials.password);
  await clickButton(page, 'Sign in');
  await expect(page).toHaveURL(/\/dashboard$/);
});

When('I create a general appointment for tomorrow', async function (this: HealthHubWorld) {
  const page = this.currentPage;
  await page.goto('https://healthhub.qualintia.com/appointments');
  await clickButton(page, 'New Appointment');

  this.appointmentTitle = `BDD appointment ${Date.now()}`;
  const dialog = page.getByRole('dialog', { name: 'New Appointment' });
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  await fillInput(dialog, 'Title*', this.appointmentTitle);
  await selectCombobox(dialog, 'Type', 'General');
  await fillInput(dialog, 'Date*', date);
  await fillInput(dialog, 'Time*', '10:00');
  await fillInput(dialog, 'Provider', 'Dr. Playwright BDD');
  await fillInput(dialog, 'Location', 'HealthHub Training Application');
  await clickButton(dialog, 'Create Appointment');
  await expect(dialog).toBeHidden();
});

Then('I should see the appointment confirmation {string}', async function (this: HealthHubWorld, message: string) {
  await expectAlert(this.currentPage, message);
});

When('I open Health Records', async function (this: HealthHubWorld) {
  await this.currentPage.goto('https://healthhub.qualintia.com/health-records');
});

Then('I should see the Health Records page and an existing record', async function (this: HealthHubWorld) {
  const page = this.currentPage;
  await expect(page.getByRole('heading', { name: 'Health Records' })).toBeVisible();
  await expect(page.getByRole('table').getByRole('row').nth(1)).toBeVisible();
});

When('I add a sample medication', async function (this: HealthHubWorld) {
  const page = this.currentPage;
  await page.goto('https://healthhub.qualintia.com/medications');
  await clickButton(page, 'Add Medication');

  this.medicationName = `BDD Test Medication ${Date.now()}`;
  const dialog = page.getByRole('dialog', { name: 'Add Medication' });
  const today = new Date();
  const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  await fillInput(dialog, 'Medication Name*', this.medicationName);
  await fillInput(dialog, 'Dosage*', '1 test unit');
  await selectCombobox(dialog, 'Frequency', 'Once daily');
  await fillInput(dialog, 'Start Date*', startDate);
  await fillInput(dialog, 'Instructions', 'Training record created by a BDD test.');
  await clickButton(dialog, 'Add Medication');
});

Then('I should see the medication in my list', async function (this: HealthHubWorld) {
  if (!this.medicationName) {
    throw new Error('Medication was not created in this scenario.');
  }
  await expect(this.currentPage.getByText(this.medicationName, { exact: true })).toBeVisible();
});