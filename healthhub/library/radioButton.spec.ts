import type { Locator, Page } from '@playwright/test';

export async function selectRadioButton(scope: Page | Locator, name: string) {
  await scope.getByRole('radio', { name, exact: true }).check();
}