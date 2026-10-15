import { test, expect } from '@playwright/test';
import { createBooking, deleteBooking, getToken, newBooking } from './booker';

test.describe('Buchungen lesen', () => {
  test('GET /booking liefert eine Liste von IDs', async ({ request }) => {
    const response = await request.get('/booking');
    expect(response.status()).toBe(200);
    const ids = await response.json();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids[0]).toEqual({ bookingid: expect.any(Number) });
  });

  test('GET /booking filtert nach Name', async ({ request }) => {
    const { id, booking } = await createBooking(request);
    const response = await request.get('/booking', {
      params: { firstname: booking.firstname, lastname: booking.lastname },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toContainEqual({ bookingid: id });
  });

  test('GET /booking/:id gibt 404 für unbekannte ID', async ({ request }) => {
    const response = await request.get('/booking/999999999');
    expect(response.status()).toBe(404);
  });
});

test.describe('Buchung anlegen, ändern, löschen', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await getToken(request);
  });

  test('POST /booking legt eine Buchung an', async ({ request }) => {
    const data = newBooking();
    const { id, booking } = await createBooking(request, data);
    expect(id).toEqual(expect.any(Number));
    expect(booking).toEqual(data);

    const read = await request.get(`/booking/${id}`);
    expect(read.status()).toBe(200);
    expect(await read.json()).toEqual(data);

    await deleteBooking(request, id, token);
  });

  test('PUT /booking/:id ersetzt die ganze Buchung', async ({ request }) => {
    const { id } = await createBooking(request);
    const changed = newBooking({ firstname: 'Geändert', totalprice: 999, depositpaid: false });

    const response = await request.put(`/booking/${id}`, {
      data: changed,
      headers: { Cookie: `token=${token}` },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(changed);

    await deleteBooking(request, id, token);
  });

  test('PATCH /booking/:id ändert nur einzelne Felder', async ({ request }) => {
    const { id, booking } = await createBooking(request);

    const response = await request.patch(`/booking/${id}`, {
      data: { firstname: 'Teilweise', totalprice: 42 },
      headers: { Cookie: `token=${token}` },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...booking, firstname: 'Teilweise', totalprice: 42 });

    await deleteBooking(request, id, token);
  });

  test('DELETE /booking/:id löscht die Buchung', async ({ request }) => {
    const { id } = await createBooking(request);

    const response = await deleteBooking(request, id, token);
    // Eigenheit der API: DELETE antwortet mit 201 Created.
    expect(response.status()).toBe(201);

    const read = await request.get(`/booking/${id}`);
    expect(read.status()).toBe(404);
  });
});

test.describe('Fehlerfälle', () => {
  test('PUT ohne Token wird mit 403 abgelehnt', async ({ request }) => {
    const { id } = await createBooking(request);
    const response = await request.put(`/booking/${id}`, { data: newBooking() });
    expect(response.status()).toBe(403);
  });

  test('DELETE mit ungültigem Token wird mit 403 abgelehnt', async ({ request }) => {
    const { id } = await createBooking(request);
    const response = await deleteBooking(request, id, 'ungueltig');
    expect(response.status()).toBe(403);
  });

  test('POST mit unvollständigen Daten wird abgelehnt', async ({ request }) => {
    const response = await request.post('/booking', { data: { firstname: 'Nur' } });
    // Die API validiert nicht sauber und antwortet mit 500 statt 400.
    expect(response.status()).toBe(500);
  });
});
