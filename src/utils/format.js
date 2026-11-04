import { restaurant } from '../data/restaurant'

/** £12.50 */
export function formatPrice(value) {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0
  return `${restaurant.currency.symbol}${amount.toFixed(restaurant.currency.decimalPlaces)}`
}

/** "Crispy Samosas (3 pcs)" -> "crispy-samosas-3-pcs" */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Stable product URL like the original /product/buffalo-wings-101/ */
export function productSlug(product) {
  return `${slugify(product.name)}-${product.id}`
}

/** 1 item / 5 items */
export function pluralise(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`
}

/** UK postcode check used by the delivery gate. */
export function isValidUkPostcode(value) {
  const postcode = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ')
  return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/.test(postcode)
}

export function normalisePostcode(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, ' ')
}

/** Fallback picture for a dish whose photo is missing. */
export const DISH_PLACEHOLDER = '/images/product-placeholder.svg'

/** Dish photo source for the menu, the basket and the checkout summary. */
export function dishImage(name) {
  const value = String(name || '')
  // API media arrives as an absolute URL (base_urls + filename) or an inline data URI — pass both through.
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value
  return value ? `/images/dishes/${value}` : DISH_PLACEHOLDER
}

/** Swap in the placeholder once when a dish photo cannot be loaded. */
export function onDishImageError(event) {
  const img = event.currentTarget
  if (img.dataset.fallback === '1') return
  img.dataset.fallback = '1'
  img.src = DISH_PLACEHOLDER
}
