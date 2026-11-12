import { api } from './client'

/** Profile details, wallet/loyalty balances and default addresses. */
export function getCustomer() {
  return api.get('/customer/info')
}

export function updateCustomer(payload) {
  return api.put('/customer/info', payload)
}

/** Alias used by the "My Profile" form — the spec retired /customer/update-profile. */
export function updateProfile(payload) {
  return updateCustomer(payload)
}

export function deleteAccount() {
  return api.del('/customer/remove-account')
}

/** Saved delivery / collection addresses. */
export function listAddresses() {
  return api.get('/customer/address/list')
}

export function addAddress(address) {
  return api.post('/customer/address/add', address)
}

export function updateAddress(id, address) {
  return api.post(`/customer/address/update/${id}`, address)
}

export function deleteAddress(id) {
  return api.del(`/customer/address/${id}`)
}

export function transferLoyaltyToWallet(point) {
  return api.post('/customer/loyalty-point/point-transfer', { point: Number(point) })
}

export function getWalletTransactions(limit = 30, offset = 0) {
  return api.get('/customer/wallet/transactions', { query: { limit, offset } })
}

export function getLoyaltyTransactions(limit = 30, offset = 0) {
  return api.get('/customer/loyalty-point/transactions', { query: { limit, offset } })
}

export function getReferralInfo() {
  return api.get('/customer/referral')
}

export function applyReferralCode(code) {
  return api.post('/customer/referral/apply', { code: String(code || '').trim().toUpperCase() })
}

export function getSupportTickets() {
  return api.get('/customer/support')
}

export function createSupportTicket({ subject, message, orderId }) {
  return api.post('/customer/support', {
    subject: String(subject || '').trim(),
    message: String(message || '').trim(),
    ...(orderId ? { order_id: String(orderId).trim() } : {})
  })
}
