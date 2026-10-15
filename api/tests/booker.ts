import { APIRequestContext, expect } from '@playwright/test';

export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
};

export function newBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'Playwright',
    lastname: `Test-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2026-11-01', checkout: '2026-11-03' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

export async function getToken(request: APIRequestContext): Promise<string> {
  const username = process.env.BOOKER_USERNAME;
  const password = process.env.BOOKER_PASSWORD;
  if (!username || !password) {
    throw new Error('BOOKER_USERNAME/BOOKER_PASSWORD fehlen (Umgebung oder api/env.local.json).');
  }
  const response = await request.post('/auth', { data: { username, password } });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.token, 'Login fehlgeschlagen').toBeTruthy();
  return body.token;
}

export async function createBooking(request: APIRequestContext, booking: Booking = newBooking()) {
  const response = await request.post('/booking', { data: booking });
  expect(response.status()).toBe(200);
  const body = await response.json();
  return { id: body.bookingid as number, booking: body.booking as Booking };
}

export async function deleteBooking(request: APIRequestContext, id: number, token: string) {
  return request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
}
