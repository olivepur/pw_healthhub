import { expect, type Locator, type Page } from '@playwright/test';

export async function expectAlert(scope: Page | Locator, message: string) {
  await expect(scope.getByRole('status').getByText(message, { exact: true })).toBeVisible();
}