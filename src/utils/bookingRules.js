/**
 * Reservation rules — a straight port of the original booking-rules.js so the
 * React booking page behaves exactly like the static one.
 */
export const defaults = {
  enabled: true,
  days: [0, 1, 2, 3, 4, 5, 6],
  open: '12:00',
  close: '22:00',
  step: 30,
  duration: 90,
  max_guests: 8,
  lead_min: 60,
  advance_days: 30,
  hidden: [],
  max_per_slot: 4
}

function minutes(hm) {
  return Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3))
}

export function parts(date, zone = 'Europe/London') {
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date)
  const v = {}
  p.forEach((x) => {
    v[x.type] = x.value
  })
  return { date: `${v.year}-${v.month}-${v.day}`, time: `${v.hour}:${v.minute}` }
}

export function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const d = new Date(`${date}T12:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date
}

export function normalize(value) {
  const s = { ...defaults, ...(value || {}) }
  for (const k of ['step', 'duration', 'max_guests', 'lead_min', 'advance_days', 'max_per_slot']) {
    s[k] = Number(s[k])
    const min = ['lead_min', 'advance_days', 'max_per_slot'].includes(k) ? 0 : 1
    if (!Number.isFinite(s[k]) || !Number.isInteger(s[k]) || s[k] < min) {
      throw new Error(`Invalid reservation setting: ${k}`)
    }
  }
  if (s.step > 1440 || s.duration > 1440 || s.advance_days > 3650 || s.max_guests > 1000) {
    throw new Error('Reservation settings are outside supported limits.')
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.open) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.close) || minutes(s.close) <= minutes(s.open)) {
    throw new Error('Invalid booking hours.')
  }
  if (!Array.isArray(s.days) || s.days.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
    throw new Error('Invalid booking days.')
  }
  if (!Array.isArray(s.hidden)) s.hidden = []
  s.enabled = ![false, 0, '0', 'false'].includes(s.enabled)
  return s
}

export function dateError(date, guests, settings, now = new Date(), zone) {
  const s = normalize(settings)
  if (!s.enabled) return 'Online table booking is currently unavailable.'
  if (!validDate(date)) return 'Choose a valid date.'
  if (!Number.isInteger(Number(guests)) || Number(guests) < 1 || Number(guests) > s.max_guests) {
    return `Choose between 1 and ${s.max_guests} guests.`
  }
  const today = parts(now, zone).date
  const diff = (Date.parse(`${date}T00:00Z`) - Date.parse(`${today}T00:00Z`)) / 864e5
  if (diff < 0) return 'Choose today or a future date.'
  if (diff > s.advance_days) return `Bookings open up to ${s.advance_days} days ahead.`
  if (!s.days.includes(new Date(`${date}T12:00Z`).getUTCDay())) return 'We do not take bookings on this day.'
  return ''
}

export function slots(date, guests, settings, now = new Date(), zone) {
  const s = normalize(settings)
  if (dateError(date, guests, s, now, zone)) return []
  const cutoff = parts(new Date(now.getTime() + s.lead_min * 60000), zone)
  const out = []
  for (let m = minutes(s.open); m <= minutes(s.close) - s.step; m += s.step) {
    const hm = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    if (!s.hidden.includes(hm) && (date > cutoff.date || (date === cutoff.date && hm >= cutoff.time))) {
      out.push(hm)
    }
  }
  return out
}

function isActive(booking) {
  return !['cancelled', 'canceled', 'no_show', 'completed'].includes(booking.status)
}

export function tableFor(date, time, guests, settings, tables, bookings) {
  const s = normalize(settings)
  const same = (bookings || []).filter((b) => b.date === date && isActive(b))
  if (same.filter((b) => b.time === time).length >= s.max_per_slot) return null
  const start = minutes(time)
  const end = start + s.duration
  return (
    (tables || [])
      .filter((t) => t.active !== false && t.active !== 0 && Number(t.seats) >= Number(guests))
      .sort((a, b) => a.seats - b.seats)
      .find((t) => {
        return !same.some((b) => {
          const bs = minutes(b.time)
          const be = bs + (Number(b.duration) || s.duration)
          return b.table_id === t.id && start < be && bs < end
        })
      }) || null
  )
}
