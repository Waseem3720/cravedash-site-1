import { restaurant } from '../data/restaurant'

/** Simple demo opening check: open from `opensAt` until 03:00. */
export function isRestaurantOpen(date = new Date()) {
  const opensAt = restaurant.ordering.opensAt
  const hour = date.getHours()
  return hour >= opensAt || hour < 3
}

export function closingNotice() {
  const opensAt = String(restaurant.ordering.opensAt).padStart(2, '0')
  return `Restaurant is closed now (opens ${opensAt}:00). Please schedule your preorder.`
}
