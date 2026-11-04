/** Booking configuration (mirrors booking-config.json from the original site). */
export const bookingConfig = {
  mode: 'demo',
  timezone: 'Europe/London',
  restaurantId: 'r1',
  storageKey: 'cravedash_booking_design_demo_v2',
  restaurantName: 'TKR',
  logoUrl: '/images/tkr-logo.jpg'
}

/** Tables used by the demo/preview booking mode. */
export const demoTables = [
  { id: 'T1', number: 1, seats: 2, active: true, area: 'Window seat' },
  { id: 'T2', number: 2, seats: 2, active: true, area: 'Cosy corner' },
  { id: 'T3', number: 3, seats: 4, active: true, area: 'Main dining' },
  { id: 'T4', number: 4, seats: 4, active: true, area: 'Window seat' },
  { id: 'T5', number: 5, seats: 6, active: true, area: 'Family table' },
  { id: 'T6', number: 6, seats: 8, active: true, area: 'Group dining' }
]

export default bookingConfig
