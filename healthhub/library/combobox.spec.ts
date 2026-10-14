import type { Locator, Page } from '@playwright/test';

export async function selectCombobox(scope: Page | Locator, name: string, label: string) {
  await scope.getByRole('combobox', { name }).selectOption({ label });
}