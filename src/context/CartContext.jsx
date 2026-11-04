import { createContext, useCallback, useContext, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { productSlug } from '../utils/format'
import { couponDiscount } from '../utils/coupon'
import { useStorefront } from './StorefrontContext'

const CartContext = createContext(null)

const STORAGE = {
  items: 'ppp-cart-items',
  mode: 'ppp-cart-mode',
  notes: 'ppp-cart-notes',
  unavailable: 'ppp-cart-unavailable',
  address: 'ppp-cart-address',
  extras: 'ppp-cart-extras'
}

export const EMPTY_CART_ADDRESS = {
  house: '',
  floor: '',
  road: '',
  town: '',
  postcode: '',
  company: '',
  instructions: '',
  deliveryNotes: ''
}

const DEFAULT_EXTRAS = {
  tip: 0,
  cutlery: false,
  coupon: null,
  schedule: { date: '', time: '' }
}

/** Cart lines are keyed by product + chosen options, like the original basket. */
const lineKey = (item) => item.lineId || String(item.productId)

export function CartProvider({ children }) {
  const { ordering } = useStorefront()
  const [items, setItems] = useLocalStorage(STORAGE.items, [])
  const [mode, setMode] = useLocalStorage(STORAGE.mode, 'collection')
  const [notes, setNotes] = useLocalStorage(STORAGE.notes, '')
  const [unavailable, setUnavailable] = useLocalStorage(STORAGE.unavailable, 'remove')
  const [address, setAddressState] = useLocalStorage(STORAGE.address, EMPTY_CART_ADDRESS)
  const [extras, setExtras] = useLocalStorage(STORAGE.extras, DEFAULT_EXTRAS)

  const addItem = useCallback(
    (product, quantity = 1, options = {}) => {
      const optionPath = options.optionPath || ''
      const unitPrice = Number.isFinite(Number(options.unitPrice))
        ? Number(options.unitPrice)
        : product.price
      const lineId = `${product.id}::${optionPath}`

      setItems((current) => {
        const existing = current.find((item) => lineKey(item) === lineId)
        if (existing) {
          return current.map((item) =>
            lineKey(item) === lineId ? { ...item, quantity: item.quantity + quantity } : item
          )
        }

        return [
          ...current,
          {
            lineId,
            productId: product.id,
            name: product.name,
            price: unitPrice,
            image: product.image,
            slug: productSlug(product),
            optionPath,
            quantity,
            addons: Array.isArray(options.addons) ? options.addons : [],
            variation: options.variation || '',
            isDeal: options.isDeal || false,
            selections: Array.isArray(options.selections) ? options.selections : []
          }
        ]
      })
    },
    [setItems]
  )

  const increment = useCallback(
    (key) => {
      setItems((current) =>
        current.map((item) =>
          lineKey(item) === String(key) ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    },
    [setItems]
  )

  const decrement = useCallback(
    (key) => {
      setItems((current) =>
        current
          .map((item) =>
            lineKey(item) === String(key) ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0)
      )
    },
    [setItems]
  )

  const removeItem = useCallback(
    (key) => {
      setItems((current) => current.filter((item) => lineKey(item) !== String(key)))
    },
    [setItems]
  )

  const clear = useCallback(() => {
    setItems([])
    setNotes('')
    setExtras(DEFAULT_EXTRAS)
  }, [setItems, setNotes, setExtras])

  const updateAddress = useCallback(
    (key, value) => setAddressState((current) => ({ ...current, [key]: value })),
    [setAddressState]
  )

  const setAddress = useCallback(
    (next) => setAddressState({ ...EMPTY_CART_ADDRESS, ...next }),
    [setAddressState]
  )

  const setTip = useCallback((tip) => setExtras((current) => ({ ...current, tip })), [setExtras])
  const setCutlery = useCallback(
    (cutlery) => setExtras((current) => ({ ...current, cutlery })),
    [setExtras]
  )
  const setCoupon = useCallback(
    (coupon) => setExtras((current) => ({ ...current, coupon })),
    [setExtras]
  )
  const setSchedule = useCallback(
    (schedule) => setExtras((current) => ({ ...current, schedule: { ...current.schedule, ...schedule } })),
    [setExtras]
  )

  const value = useMemo(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0)
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
    const hasItems = items.length > 0

    const deliveryCharge =
      mode === 'delivery' && hasItems && subtotal < ordering.freeDeliveryOver
        ? ordering.deliveryCharge
        : 0

    const serviceFee = hasItems ? ordering.serviceFee : 0
    const bagCharge = hasItems ? ordering.bagCharge : 0
    const discount = couponDiscount(extras.coupon, subtotal)
    const tip = Number(extras.tip) || 0
    const total = Number(
      Math.max(0, subtotal + deliveryCharge + serviceFee + bagCharge - discount + tip).toFixed(2)
    )

    return {
      items,
      mode,
      notes,
      unavailable,
      address,
      tip,
      cutlery: Boolean(extras.cutlery),
      coupon: extras.coupon,
      schedule: extras.schedule,
      count,
      subtotal,
      deliveryCharge,
      serviceFee,
      bagCharge,
      discount,
      total,
      freeDeliveryOver: ordering.freeDeliveryOver,
      minimumOrder: ordering.minimumOrder,
      isBelowMinimum: subtotal > 0 && subtotal < ordering.minimumOrder,
      addItem,
      increment,
      decrement,
      removeItem,
      clear,
      setMode,
      setNotes,
      setUnavailable,
      updateAddress,
      setAddress,
      setTip,
      setCutlery,
      setCoupon,
      setSchedule
    }
  }, [
    items,
    mode,
    ordering,
    notes,
    unavailable,
    address,
    extras,
    addItem,
    increment,
    decrement,
    removeItem,
    clear,
    setMode,
    setNotes,
    setUnavailable,
    updateAddress,
    setAddress,
    setTip,
    setCutlery,
    setCoupon,
    setSchedule
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}

export default CartContext
