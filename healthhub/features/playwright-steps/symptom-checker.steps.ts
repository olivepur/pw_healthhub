import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { clickButton, selectCombobox, selectRadioButton, setCheckbox } from '@library/components.fassade.spec';

const { When, Then } = createBdd();

When('I open the Symptom Checker', async ({ page }) => {
  await page.getByTestId('nav-symptom-checker').click();
  await expect(page.getByTestId('symptom-next-btn')).toBeVisible();
});

When('I select the symptoms {string}', async ({ page }, symptoms: string) => {
  for (const symptom of symptoms.split(',').map(value => value.trim())) {
    await setCheckbox(page, symptom);
  }
  await clickButton(page, 'Next');
});

When('I specify mild symptoms lasting 2 to 3 days', async ({ page }) => {
  await selectRadioButton(page, 'Mild');
  await selectCombobox(page, '', '2-3 days');
  await clickButton(page, 'Next');
});

When('I report a fever and recent travel', async ({ page }) => {
  await setCheckbox(page, 'Do you have a fever?');
  await setCheckbox(page, 'Have you traveled recently?');
  await clickButton(page, 'Next');
});

When('I submit the symptom assessment', async ({ page }) => {
  await clickButton(page, 'Get Results');
});

Then('I should see the symptom recommendation {string}', async ({ page }, message: string) => {
  await expect(page.getByRole('main').getByText(message)).toBeVisible();
});

When('I choose to book an appointment from the symptom results', async ({ page }) => {
  await clickButton(page, 'Book Appointment');
});