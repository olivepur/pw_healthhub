import type { Locator, Page } from '@playwright/test';

export async function clickButton(scope: Page | Locator, name: string) {
  await scope.getByRole('button', { name }).click();
}