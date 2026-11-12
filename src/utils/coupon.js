import { coupons } from '../data/account'

/** Coupons from the account area plus the code used in the design. */
const CATALOGUE = [
  ...coupons,
  { id: 'cp-4', code: 'PORTO10', title: 'Porto piri piri offer', discount: '10% off', minSpend: 20 }
]

export function findCoupon(code) {
  const needle = String(code || '').trim().toUpperCase()
  if (!needle) return null
  return CATALOGUE.find((coupon) => coupon.code === needle) || null
}

/** Discount amount for a coupon against the given subtotal. */
export function couponDiscount(coupon, subtotal) {
  if (!coupon) return 0
  const amount = Number(subtotal) || 0
  if (amount <= 0) return 0
  if (coupon.minSpend && amount < coupon.minSpend) return 0

  if (Number.isFinite(Number(coupon.discountValue)) && Number(coupon.discountValue) > 0) {
    const val = Number(coupon.discountValue)
    let raw = coupon.discountType === 'percent' ? (amount * val) / 100 : val
    const cap = Number(coupon.maxDiscount || 0)
    if (cap > 0) raw = Math.min(raw, cap)
    return Number(Math.max(0, Math.min(amount, raw)).toFixed(2))
  }

  const value = String(coupon.discount || '').trim().toLowerCase()

  // "10% off" → percentage of the subtotal.
  const percentMatch = value.match(/([\d.]+)\s*%/) || (value.endsWith('%') ? value.match(/([\d.]+)/) : null)
  if (percentMatch) {
    const percent = Number.parseFloat(percentMatch[1])
    if (!Number.isFinite(percent)) return 0
    let raw = (amount * percent) / 100
    const cap = Number(coupon.maxDiscount || 0)
    if (cap > 0) raw = Math.min(raw, cap)
    return Number(Math.max(0, Math.min(amount, raw)).toFixed(2))
  }

  // "£5 off" → flat amount, never more than the subtotal.
  const flatMatch = value.match(/([\d.]+)/)
  if (!flatMatch) return 0
  const flat = Number.parseFloat(flatMatch[1])
  if (!Number.isFinite(flat)) return 0
  return Number(Math.min(flat, amount).toFixed(2))
}
