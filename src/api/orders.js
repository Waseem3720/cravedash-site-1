import { api } from './client'

/** Check a deal and its choices before it is added to the cart. */
export function previewDeal({ dealId, selections }) {
  return api.post('/customer/order/deal-preview', { deal_id: dealId, selections })
}

/** Place the order. `idempotencyKey` stops a double submit creating two orders. */
export function placeOrder(payload, idempotencyKey) {
  return api.post('/customer/orders', payload, {
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined
  })
}

export function listOrders({ limit = 20, offset = 1 } = {}) {
  return api.get('/customer/order/list', { query: { limit, offset } })
}

export function getOrderDetails(orderId) {
  return api.get('/customer/order/details', { query: { order_id: orderId } })
}

/** Public tracking — phone/e-mail verifies the order when signed out. */
export function trackOrder({ orderId, phone, email }) {
  return api.get('/customer/order/track', { query: { order_id: orderId, phone, email } })
}

export function cancelOrder(orderId) {
  return api.put('/customer/order/cancel', { order_id: orderId })
}

/** Status updates for the signed-in customer's orders, newest first. */
export function listNotifications(limit = 20) {
  return api.get('/customer/order/notifications', { query: { limit } })
}

export function createStripeCheckoutSession({ orderId, successUrl, cancelUrl }) {
  return api.post('/stripe/customer/checkout', {
    order_id: orderId,
    success_url: successUrl,
    cancel_url: cancelUrl
  })
}

export function getStripeCheckoutStatus({ sessionId, orderId }) {
  return api.get('/stripe/customer/checkout/status', {
    query: {
      ...(sessionId ? { session_id: sessionId } : {}),
      ...(orderId ? { order_id: orderId } : {})
    }
  })
}
