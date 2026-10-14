import type { Locator, Page } from '@playwright/test';

export async function fillInput(scope: Page | Locator, name: string, value: string) {
  await scope.getByRole('textbox', { name }).fill(value);
}