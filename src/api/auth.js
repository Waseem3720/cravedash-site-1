import { api, setToken, clearToken, getRestaurantId } from './client'

/** Customer sign-in with e-mail and password. Staff use /auth/login; the customer route is separate. */
export async function login({ email, password }) {
  const rid = getRestaurantId()
  const data = await api.post('/auth/customer/login', {
    email,
    password,
    ...(rid ? { restaurant_id: rid } : {})
  })
  if (data?.token) setToken(data.token)
  return data
}

/** Create a customer account (aliases: /auth/register). */
export async function register({ firstName, lastName, phone, email, password }) {
  const name = [firstName, lastName].filter(Boolean).join(' ')
  const rid = getRestaurantId()
  const data = await api.post('/auth/registration', {
    email,
    password,
    name,
    f_name: firstName,
    l_name: lastName,
    phone,
    ...(rid ? { restaurant_id: rid } : {})
  })
  if (data?.token) setToken(data.token)
  return data
}

/** Current session / logged-in user. */
export function getSession() {
  return api.get('/auth/session')
}

export function logout() {
  clearToken()
}

/** Phone OTP — request then verify. */
export function requestOtp(phone) {
  const rid = getRestaurantId()
  return api.post('/auth/otp/request', {
    phone,
    ...(rid ? { restaurant_id: rid } : {})
  })
}

export function verifyOtp({ phone, code }) {
  const rid = getRestaurantId()
  return api.post('/auth/otp/verify', {
    phone,
    code,
    ...(rid ? { restaurant_id: rid } : {})
  })
}

/** Google / Facebook / Apple sign-in. */
export async function socialLogin({ provider, idToken, accessToken, email, name }) {
  const rid = getRestaurantId()
  const data = await api.post(`/auth/oauth/${provider}`, {
    id_token: idToken,
    access_token: accessToken,
    email,
    name,
    ...(rid ? { restaurant_id: rid } : {})
  })
  if (data?.token) setToken(data.token)
  return data
}

export function requestEmailVerification(email) {
  return api.post('/auth/email-verification/request', { email })
}

export function confirmEmailVerification(token) {
  return api.get('/auth/email-verification/confirm', { query: { token } })
}
