import { test, expect } from '@playwright/test';
import { getToken } from './booker';

test.describe('POST /auth', () => {
  test('liefert mit gültigen Zugangsdaten einen Token', async ({ request }) => {
    const token = await getToken(request);
    expect(token).toMatch(/^\w+$/);
  });

  test('lehnt falsche Zugangsdaten ab', async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: 'nobody', password: 'wrong' },
    });
    // Eigenheit der API: Fehler kommt mit Status 200 und einem "reason".
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ reason: 'Bad credentials' });
  });
});
