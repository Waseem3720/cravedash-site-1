/**
 * Small fetch wrapper for the CraveDash API.
 *
 * The base URL, storefront key and tenant id come from `.env`
 * (`VITE_API_BASE_URL`, `VITE_API_KEY`, `VITE_RESTAURANT_ID`) so nothing is
 * hard-coded in the components.
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')
export const API_KEY = import.meta.env.VITE_API_KEY || ''

const RESTAURANT_STORAGE_KEY = 'cravedash_restaurant_id'

/**
 * Dynamically resolves the active restaurant tenant.
 * Priority:
 * 1. URL search parameter: `?restaurant_id=r15` or `?r=r15`
 * 2. Saved preference in localStorage
 * 3. Fallback to `VITE_RESTAURANT_ID` from `.env`
 */
export function getRestaurantId() {
  try {
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search)
      const fromUrl = params.get('restaurant_id') || params.get('r')
      if (fromUrl && fromUrl.trim()) {
        const clean = fromUrl.trim()
        window.localStorage.setItem(RESTAURANT_STORAGE_KEY, clean)
        return clean
      }
      const stored = window.localStorage.getItem(RESTAURANT_STORAGE_KEY)
      if (stored && stored.trim()) return stored.trim()
    }
  } catch {
    /* storage or url access blocked */
  }
  return import.meta.env.VITE_RESTAURANT_ID || ''
}

export function setRestaurantId(id) {
  try {
    if (id) window.localStorage.setItem(RESTAURANT_STORAGE_KEY, String(id).trim())
    else window.localStorage.removeItem(RESTAURANT_STORAGE_KEY)
  } catch {
    /* storage blocked */
  }
}

/**
 * Kept for backwards compatibility with existing imports.
 * Uses a getter so callers always evaluate the current active tenant.
 */
export const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || ''

const TOKEN_STORAGE_KEY = 'ppp-api-token'

/**
 * True when the API can actually be called.
 *
 * The storefront contract (site1.md) says the gateway resolves the Porto Piri
 * Piri tenant on its own, so no `X-API-KEY` / `X-Restaurant-Id` is required for
 * public customer calls — the base URL alone is enough. Both headers are still
 * sent when they happen to be set in `.env`.
 */
export function isApiConfigured() {
  return Boolean(API_BASE_URL)
}

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    /* storage blocked — the token simply won't persist */
  }
}

export function clearToken() {
  setToken('')
}

export class ApiError extends Error {
  constructor(message, { status = 0, payload = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function buildQuery(query) {
  if (!query) return ''
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  })
  const search = params.toString()
  return search ? `?${search}` : ''
}

function errorMessage(data, status) {
  if (data && typeof data === 'object') {
    // Spec error envelope: { success:false, error:{ code, message } }
    if (data.error && typeof data.error === 'object') {
      const message = data.error.message || data.error.detail || data.error.code
      if (typeof message === 'string' && message) return message
    }
    if (typeof data.message === 'string' && data.message) return data.message
    if (typeof data.error === 'string' && data.error) return data.error
    if (data.errors && typeof data.errors === 'object') {
      const first = Object.values(data.errors)[0]
      if (Array.isArray(first) && first.length) return String(first[0])
      if (typeof first === 'string') return first
    }
  }
  return `Request failed (${status})`
}

/**
 * Runs one request and returns the payload.
 * `{ success, data }` envelopes are unwrapped so callers get the useful part.
 */
export async function request(
  path,
  { method = 'GET', body, query, headers = {}, signal, timeout = 12000 } = {}
) {
  if (!API_BASE_URL) {
    throw new ApiError('API base URL is missing — set VITE_API_BASE_URL in .env')
  }

  // The local gateway's public routes take the tenant from `restaurant_id` in the query string.
  const activeRestaurantId = getRestaurantId()
  const tenantQuery = activeRestaurantId ? { restaurant_id: activeRestaurantId, ...query } : query
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}${buildQuery(tenantQuery)}`
  const requestHeaders = { Accept: 'application/json', ...headers }
  const token = getToken()

  if (API_KEY) requestHeaders['X-API-KEY'] = API_KEY
  if (activeRestaurantId) requestHeaders['X-Restaurant-Id'] = activeRestaurantId
  if (token) requestHeaders.Authorization = `Bearer ${token}`

  let payload
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      payload = body
    } else {
      requestHeaders['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
  }

  // Abort a request that hangs (unreachable host, dead tunnel) instead of
  // leaving the UI spinning forever.
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeout)
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true })

  let response
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: payload,
      signal: controller.signal
    })
  } catch (networkError) {
    throw new ApiError('Network error — the API could not be reached.', { payload: networkError })
  } finally {
    window.clearTimeout(timer)
  }

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    if (response.status === 401) clearToken()
    throw new ApiError(errorMessage(data, response.status), { status: response.status, payload: data })
  }

  if (data && typeof data === 'object' && !Array.isArray(data) && 'data' in data) return data.data
  return data
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { body, method: 'POST', ...options }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' })
}

export default api
