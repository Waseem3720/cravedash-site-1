/**
 * API surface for the customer storefront.
 *
 * Base URL / key / tenant come from `.env` (see `.env.example`):
 *   VITE_API_BASE_URL, VITE_API_KEY, VITE_RESTAURANT_ID
 */
export * as authApi from './auth'
export * as catalogApi from './catalog'
export * as storefrontApi from './storefront'
export * as customerApi from './customer'
export * as ordersApi from './orders'
export { api, ApiError, API_BASE_URL, isApiConfigured, getToken, setToken, clearToken } from './client'
