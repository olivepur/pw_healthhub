import { test, expect } from '@playwright/test';

test('GET /ping meldet, dass die API läuft', async ({ request }) => {
  const response = await request.get('/ping');
  expect(response.status()).toBe(201);
  expect(await response.text()).toBe('Created');
});
