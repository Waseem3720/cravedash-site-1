import { api } from './client'

/** Reservation rules for the restaurant: guests, visit length, how far ahead. */
export function getReservationSettings() {
  return api.get('/customer/reservations/settings')
}

/** Free start times for a date and party size. The server picks the table. */
export function getReservationAvailability({ date, guests }) {
  return api.get('/customer/reservations/availability', { query: { date, guests } })
}

/** Creates the booking for the signed-in customer. The server picks the table and returns it. */
export function createReservation(body) {
  return api.post('/customer/reservations', body)
}
