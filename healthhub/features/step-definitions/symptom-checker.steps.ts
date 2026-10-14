import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { clickButton, selectCombobox, selectRadioButton, setCheckbox } from '@library/components.fassade.spec';
import type { HealthHubWorld } from '@support/world';

When('I open the Symptom Checker', async function (this: HealthHubWorld) {
  const page = this.currentPage;
  await page.getByTestId('nav-symptom-checker').click();
  await expect(page.getByTestId('symptom-next-btn')).toBeVisible();
});

When('I select the symptoms {string}', async function (this: HealthHubWorld, symptoms: string) {
  const page = this.currentPage;
  for (const symptom of symptoms.split(',').map(value => value.trim())) {
    await setCheckbox(page, symptom);
  }
  await clickButton(page, 'Next');
});

When('I specify mild symptoms lasting 2 to 3 days', async function (this: HealthHubWorld) {
  const page = this.currentPage;
  await selectRadioButton(page, 'Mild');
  await selectCombobox(page, '', '2-3 days');
  await clickButton(page, 'Next');
});

When('I report a fever and recent travel', async function (this: HealthHubWorld) {
  const page = this.currentPage;
  await setCheckbox(page, 'Do you have a fever?');
  await setCheckbox(page, 'Have you traveled recently?');
  await clickButton(page, 'Next');
});

When('I submit the symptom assessment', async function (this: HealthHubWorld) {
  await clickButton(this.currentPage, 'Get Results');
});

Then('I should see the symptom recommendation {string}', async function (this: HealthHubWorld, message: string) {
  await expect(this.currentPage.getByRole('main').getByText(message)).toBeVisible();
});

When('I choose to book an appointment from the symptom results', async function (this: HealthHubWorld) {
  await clickButton(this.currentPage, 'Book Appointment');
});