const DELIVERED = new Set(['delivered', 'completed'])
const CANCELLED = new Set(['cancelled', 'canceled', 'rejected', 'failed', 'refunded'])
const PREPARING = new Set(['processing', 'cooking', 'prepared'])
const CONFIRMED = new Set(['confirmed', 'accepted'])
const OUT_FOR_DELIVERY = new Set(['out_for_delivery', 'on_the_way', 'handover'])

/** 'all' | 'active' | 'delivered' | 'cancelled' — matches the filter pills. */
export function orderBucket(status) {
  const value = String(status || '').toLowerCase()
  if (DELIVERED.has(value)) return 'delivered'
  if (CANCELLED.has(value)) return 'cancelled'
  return 'active'
}

export function orderStatusLabel(status) {
  const value = String(status || '').toLowerCase()
  if (DELIVERED.has(value)) return 'Delivered ✓'
  if (CANCELLED.has(value)) return 'Cancelled'
  if (OUT_FOR_DELIVERY.has(value)) return 'Out for Delivery'
  if (value === 'pending') return 'Pending'
  if (CONFIRMED.has(value)) return 'Confirmed'
  if (PREPARING.has(value)) return 'Preparing'
  return value ? value.replace(/_/g, ' ') : 'Pending'
}

/** 0 = confirmed, 1 = preparing, 2 = out for delivery */
export function orderProgressStep(status) {
  const value = String(status || '').toLowerCase()
  if (OUT_FOR_DELIVERY.has(value)) return 2
  if (PREPARING.has(value)) return 1
  return 0
}

export function formatOrderDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
