import { api } from './client'

/** The signed-in customer's saved products that are still on the menu. */
export function getWishlist() {
  return api.get('/customer/wish-list')
}

export function addToWishlist(productId) {
  return api.post('/customer/wish-list/add', { product_id: productId })
}

export function removeFromWishlist(productId) {
  return api.post('/customer/wish-list/remove', { product_id: productId })
}
