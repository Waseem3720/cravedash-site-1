import { api } from './client'

/** Reservation rules for the restaurant: guests, visit length, how far ahead. */
export function getReservationSettings() {
  return api.get('/customer/reservations/settings')
}

/** Free start times for a date and party size. Pass time to verify a single slot. */
export function getReservationAvailability({ date, time, guests }) {
  return api.get('/customer/reservations/availability', { query: { date, time, guests } })
}

/** All active tables with availability for a specific date, time, and party size. */
export function getReservationTables({ date, time, guests }) {
  return api.get('/customer/reservations/tables', { query: { date, time, guests } })
}

/** Creates the booking for the signed-in customer. Accepts preferred_table_id. */
export function createReservation(body) {
  return api.post('/customer/reservations', body)
}
