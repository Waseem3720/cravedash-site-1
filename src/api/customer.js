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
