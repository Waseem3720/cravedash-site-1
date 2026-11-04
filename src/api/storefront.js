import { api } from './client'

/** Restaurant details, opening times, fees and enabled payment methods. */
export function getConfig() {
  return api.get('/public/config')
}

export function getDeliveryFee({ postcode, subtotal } = {}) {
  return api.get('/public/delivery-fee', { query: { postcode, subtotal } })
}

/** Postcode check used by the "Where should we deliver?" gate. */
export function checkPostcode(postcode) {
  return api.get('/public/check-postcode', { query: { postcode }, timeout: 8000 })
}

/** Home page hero banners: the restaurant's banners arrive with the public config. */
export async function getBanners() {
  const config = await api.get('/public/config')
  return Array.isArray(config?.banners) ? config.banners : []
}

/** Public coupon list for the account "Coupons" page. */
export function getCoupons() {
  return api.get('/coupon/list')
}

/** Validate a promo code against the cart subtotal. */
export function applyCoupon({ code, subtotal }) {
  return api.post('/coupon/apply', { code, subtotal })
}
