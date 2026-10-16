import { test, expect } from '@playwright/test';
/*
test('example test', async ({ page }) => {
    console.log("1: starting test");   
    await page.goto('https://www.google.de');
    console.log("2: seite geöffnet");
    await expect(page).toHaveTitle(/Google/);
    console.log("3: titel überprüft");
});


test('Test 2 Link anklicken', async ({ page }) => {
  await page.goto('https://playwright.dev');

  await page.getByRole('link', { name: 'Get started' }).click();
  console.log("Link 'Get started' clicked");
  await expect(page).toHaveURL(/.*intro/);

});
*/ 
async function addiere(a:number , b:number): Promise<number> {
    return a + b;
}
function multipliziere(a:number , b:number): number {
    return a * b;
}
test('Test 3 Summe  berechnen', async ({ page }) => {
  const a = 5;
  const b = 3;
  const p= multipliziere(a, b);
  const ergebnis: number = await addiere(p, 10);

  expect(ergebnis).toBe(25);
});

test('Test 4 - API Anfrage', async ({ request }) => {
  const url = 'https://jsonplaceholder.typicode.com/users/1';
  const response = await request.get(url);
  expect(response.status()).toBe(200);

  const user = await response.json();
  console.log(`Status: ${response.status()}`, JSON.stringify(user, null, 2));
  await test.info().attach('response', { body: JSON.stringify(user, null, 2), contentType: 'application/json' });

  expect(user.id).toBe(1);
  expect(user.username).toBe('Bret');
});