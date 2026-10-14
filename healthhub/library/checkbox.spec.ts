import type { Locator, Page } from '@playwright/test';

export async function setCheckbox(scope: Page | Locator, name: string, checked = true) {
  await scope.getByRole('checkbox', { name, exact: true }).setChecked(checked);
}