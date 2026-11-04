import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { loyaltySettings } from '../data/account'
import { isApiConfigured, clearToken, getToken, setToken } from '../api/client'
import * as authApi from '../api/auth'
import * as customerApi from '../api/customer'
import * as ordersApi from '../api/orders'
import { mapOrder } from '../api/normalise'

const AuthContext = createContext(null)

function nameFromEmail(email) {
  const local = String(email || '').split('@')[0] || 'Guest'
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** API user → the shape the header/account views expect. */
function toAccount(user) {
  if (!user) return null
  const full = user.name || ''
  const firstName = user.f_name || user.first_name || full.split(' ')[0] || ''
  const lastName =
    user.l_name || user.last_name || full.split(' ').slice(1).join(' ') || ''
  return {
    id: user.id || user.customer_id || '',
    firstName: firstName || 'Customer',
    lastName,
    email: user.email || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || user.avatar_url || user.image || ''
  }
}

/**
 * Customer account store.
 * Talks to the CraveDash API when it is configured (`.env`), otherwise keeps
 * everything in localStorage so the demo still works end to end.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('ppp-auth-user', null)
  const [orders, setOrders] = useLocalStorage('ppp-orders', [])
  const [walletBalance, setWalletBalance] = useLocalStorage('ppp-wallet-balance', 0)
  const [loyaltyPoints, setLoyaltyPoints] = useLocalStorage('ppp-loyalty-points', 0)
  const [walletTransactions, setWalletTransactions] = useLocalStorage('ppp-wallet-transactions', [])
  const [pointTransactions, setPointTransactions] = useLocalStorage('ppp-point-transactions', [])

  const apiMode = isApiConfigured()

  /** Balances + saved orders come from the API when the customer is signed in. */
  const syncAccount = useCallback(async () => {
    if (!apiMode) return
    const tasks = [customerApi.getCustomer(), ordersApi.listOrders({ limit: 50, offset: 1 })]
    const [profile, list] = await Promise.allSettled(tasks)

    if (profile.status === 'fulfilled' && profile.value) {
      const data = profile.value
      setUser((current) => ({ ...(current || {}), ...toAccount(data.user || data) }))
      if (data.wallet_balance !== undefined) setWalletBalance(Number(data.wallet_balance) || 0)
      if (data.loyalty_points !== undefined) setLoyaltyPoints(Number(data.loyalty_points) || 0)
    }

    if (list.status === 'fulfilled' && list.value) {
      const rows = Array.isArray(list.value) ? list.value : list.value.orders
      if (Array.isArray(rows)) setOrders(rows.map(mapOrder))
    }
  }, [apiMode, setUser, setWalletBalance, setLoyaltyPoints, setOrders])

  // Restore the session from the stored JWT on first load.
  useEffect(() => {
    if (!apiMode || !getToken()) return
    let cancelled = false
    ;(async () => {
      try {
        // Customer tokens are refused by /auth/session (staff only), so the saved customer profile proves the session.
        const profile = await customerApi.getCustomer()
        if (!cancelled) setUser((current) => ({ ...(current || {}), ...toAccount(profile) }))
        if (!cancelled) await syncAccount()
      } catch {
        // Token expired / API unreachable — stay signed out in this tab.
        clearToken()
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiMode])

  const login = useCallback(
    async ({ email, password }) => {
      if (!apiMode) {
        const name = nameFromEmail(email)
        const [firstName, ...rest] = name.split(' ')
        const account = {
          id: `demo-${Date.now()}`,
          firstName: firstName || 'Guest',
          lastName: rest.join(' '),
          email,
          phone: '',
          avatarUrl: ''
        }
        setUser(account)
        return account
      }

      const data = await authApi.login({ email, password })
      const account = toAccount(data?.user)
      setUser(account)
      await syncAccount()
      return account
    },
    [apiMode, setUser, syncAccount]
  )

  const register = useCallback(
    async ({ firstName, lastName, email, phone, password }) => {
      if (!apiMode) {
        const account = {
          id: `demo-${Date.now()}`,
          firstName,
          lastName: lastName || '',
          email,
          phone: phone || '',
          avatarUrl: ''
        }
        setUser(account)
        return account
      }

      const data = await authApi.register({ firstName, lastName, email, phone, password })
      const account = toAccount(data?.user) || {
        id: `cust-${Date.now()}`,
        firstName,
        lastName: lastName || '',
        email,
        phone: phone || '',
        avatarUrl: ''
      }
      setUser(account)
      return account
    },
    [apiMode, setUser]
  )

  /** Used by the My Profile view. */
  const updateProfile = useCallback(
    async (changes) => {
      if (apiMode) {
        // A failed save is shown to the customer; the local copy changes only after the server has saved.
        await customerApi.updateProfile({
          f_name: changes.firstName,
          l_name: changes.lastName,
          name: [changes.firstName, changes.lastName].filter(Boolean).join(' '),
          email: changes.email,
          phone: changes.phone,
          avatar_url: changes.avatarUrl
        })
      }

      let updated = null
      setUser((current) => {
        updated = { ...(current || {}), ...changes }
        return updated
      })
      return updated
    },
    [apiMode, setUser]
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [setUser])

  const deleteAccount = useCallback(async () => {
    if (apiMode) {
      try {
        await customerApi.deleteAccount()
      } catch {
        /* removing the local session is what matters to the customer */
      }
    }
    clearToken()
    setUser(null)
    setOrders([])
    setWalletBalance(0)
    setLoyaltyPoints(0)
    setWalletTransactions([])
    setPointTransactions([])
  }, [apiMode, setUser, setOrders, setWalletBalance, setLoyaltyPoints, setWalletTransactions, setPointTransactions])

  const placeOrder = useCallback(
    async (order) => {
      const localRecord = {
        id: `PP-${Math.floor(100000 + Math.random() * 900000)}`,
        status: order.status || 'pending',
        createdAt: new Date().toISOString(),
        ...order
      }

      if (apiMode) {
        const idempotencyKey = `ppp-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const orderType = (order.orderType || order.mode) === 'delivery' ? 'delivery' : 'collection'
        const payload = {
          // The server prices every line from the catalogue: products by product_id, deals by deal_id with their picks.
          items: (order.items || []).map((line) =>
            line.isDeal
              ? {
                  deal_id: line.dealId || line.productId,
                  qty: line.quantity,
                  selections: line.selections || []
                }
              : {
                  product_id: line.productId,
                  qty: line.quantity,
                  variation: line.variation || undefined,
                  addons: line.addons || []
                }
          ),
          order_type: orderType,
          branch_id: order.branchId || undefined,
          postcode: orderType === 'delivery' ? order.customer?.postcode || undefined : undefined,
          delivery_address:
            orderType === 'delivery'
              ? {
                  address: order.customer?.address || '',
                  postcode: order.customer?.postcode || '',
                  contact_person_name: order.customer?.name || '',
                  contact_person_number: order.customer?.phone || ''
                }
              : undefined,
          payment_method: order.payment === 'card' ? 'card' : 'cash',
          coupon_code: order.coupon || undefined,
          note: order.notes || undefined,
          client_id: idempotencyKey
        }

        const data = await ordersApi.placeOrder(payload, idempotencyKey)
        const mapped = mapOrder(data)
        // The API receipt only carries the id/status/totals — keep the details
        // the customer just entered (address, schedule, payment label).
        const placed = {
          ...localRecord,
          id: mapped.id ?? localRecord.id,
          status: mapped.status || localRecord.status,
          createdAt: mapped.createdAt || localRecord.createdAt,
          subtotal: mapped.subtotal || localRecord.subtotal,
          total: mapped.total || localRecord.total,
          paymentStatus: mapped.paymentStatus || '',
          items: order.items
        }
        setOrders((current) => [placed, ...current])
        return placed
      }

      setOrders((current) => [localRecord, ...current])

      // 1 point per £1 spent, like the loyalty scheme in the original app.
      const earned = Math.floor(Number(order.total || 0))
      if (earned > 0) {
        setLoyaltyPoints((current) => current + earned)
        setPointTransactions((current) => [
          {
            id: `pt-${Date.now()}`,
            label: `Order ${localRecord.id}`,
            points: earned,
            createdAt: localRecord.createdAt
          },
          ...current
        ])
      }

      return localRecord
    },
    [apiMode, setOrders, setLoyaltyPoints, setPointTransactions]
  )

  /** `POST /auth/otp/request` — text a 6-digit login code to the phone. */
  const requestOtp = useCallback(
    async (phone) => {
      if (!apiMode) throw new Error('Phone login needs the live API connection.')
      return authApi.requestOtp(phone)
    },
    [apiMode]
  )

  /** `POST /auth/otp/verify` — the code signs the customer in and returns a JWT. */
  const verifyOtp = useCallback(
    async ({ phone, code }) => {
      if (!apiMode) throw new Error('Phone login needs the live API connection.')
      const data = await authApi.verifyOtp({ phone, code })
      if (data?.token) setToken(data.token)
      const account = toAccount(data?.user) || { id: `cust-${Date.now()}`, firstName: 'Customer', email: '', phone }
      setUser(account)
      await syncAccount()
      return account
    },
    [apiMode, setUser, syncAccount]
  )

  /**
   * `PUT /customer/order/cancel` — the backend only allows this while the
   * order is still `pending`, i.e. before the kitchen starts cooking.
   */
  const cancelOrder = useCallback(
    async (orderId) => {
      if (apiMode) {
        await ordersApi.cancelOrder(orderId)
        await syncAccount()
        return
      }
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status: 'canceled' } : order))
      )
    },
    [apiMode, syncAccount, setOrders]
  )

  /** Loyalty Points → Wallet, mirroring the original convert flow. */
  const convertPointsToWallet = useCallback(
    (points) => {
      // The server has no customer route for this yet; a local-only change would be overwritten by the next sync.
      if (apiMode) throw new Error('Converting points to wallet credit is not available online yet')
      const amount = Number(points)
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter a valid point amount')
      if (amount < loyaltySettings.minimumPoints) {
        throw new Error(`Minimum ${loyaltySettings.minimumPoints} points required`)
      }
      if (amount > loyaltyPoints) throw new Error('You do not have that many points')

      const credit = Number((amount / loyaltySettings.exchangeRate).toFixed(2))
      setLoyaltyPoints((current) => current - amount)
      setWalletBalance((current) => Number((current + credit).toFixed(2)))
      setPointTransactions((current) => [
        {
          id: `pt-${Date.now()}`,
          label: 'Converted to wallet',
          points: -amount,
          createdAt: new Date().toISOString()
        },
        ...current
      ])
      setWalletTransactions((current) => [
        {
          id: `wt-${Date.now()}`,
          label: `Loyalty conversion (${amount} points)`,
          amount: credit,
          createdAt: new Date().toISOString()
        },
        ...current
      ])

      return credit
    },
    [
      loyaltyPoints,
      setLoyaltyPoints,
      setWalletBalance,
      setPointTransactions,
      setWalletTransactions
    ]
  )

  const value = useMemo(() => {
    const fullName = user
      ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Customer'
      : ''

    return {
      user,
      isSignedIn: Boolean(user),
      initials: fullName ? fullName.charAt(0).toUpperCase() : '',
      displayName: user ? user.firstName || user.email : '',
      fullName,
      orders,
      walletBalance,
      loyaltyPoints,
      walletTransactions,
      pointTransactions,
      loyaltySettings,
      apiMode,
      login,
      register,
      requestOtp,
      verifyOtp,
      updateProfile,
      logout,
      deleteAccount,
      placeOrder,
      cancelOrder,
      convertPointsToWallet,
      refreshAccount: syncAccount
    }
  }, [
    user,
    orders,
    walletBalance,
    loyaltyPoints,
    walletTransactions,
    pointTransactions,
    apiMode,
    login,
    register,
    requestOtp,
    verifyOtp,
    updateProfile,
    logout,
    deleteAccount,
    placeOrder,
    cancelOrder,
    convertPointsToWallet,
    syncAccount
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

export default AuthContext
