import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { isValidUkPostcode, normalisePostcode } from '../utils/format'
import { isApiConfigured } from '../api/client'
import { checkPostcode as checkPostcodeApi } from '../api/storefront'

const DeliveryContext = createContext(null)

const INITIAL = {
  postcode: '',
  covered: false,
  zone: '',
  deliveryFee: null,
  intent: null,
  gateDismissed: false
}

export function DeliveryProvider({ children }) {
  const [state, setState] = useLocalStorage('ppp-delivery', INITIAL)
  const [gateOpen, setGateOpen] = useState(() => !state.gateDismissed)

  const openGate = useCallback(() => setGateOpen(true), [])

  const closeGate = useCallback(() => {
    setGateOpen(false)
    setState((current) => ({ ...current, gateDismissed: true }))
  }, [setState])

  /**
   * Validates the postcode locally, then asks the API whether we deliver there
   * (`GET /config/check-postcode`). If the API is not configured or unreachable
   * the demo behaviour is kept so the site never blocks the customer.
   */
  const checkPostcode = useCallback(
    async (value) => {
      const postcode = normalisePostcode(value)
      if (!isValidUkPostcode(postcode)) return { ok: false, reason: 'invalid' }

      if (isApiConfigured()) {
        try {
          const data = await checkPostcodeApi(postcode)
          if (data && data.deliverable === false) {
            setState((current) => ({
              ...current,
              postcode,
              covered: false,
              zone: data.zone || '',
              deliveryFee: data.delivery_fee ?? null
            }))
            return { ok: false, reason: 'not-covered' }
          }
          setState((current) => ({
            ...current,
            postcode,
            covered: true,
            zone: data?.zone || '',
            deliveryFee: data?.delivery_fee ?? null
          }))
          return { ok: true }
        } catch {
          // API down — fall through to the local check.
        }
      }

      setState((current) => ({ ...current, postcode, covered: true }))
      return { ok: true }
    },
    [setState]
  )

  const continueWithDelivery = useCallback(() => {
    setState((current) => ({ ...current, intent: 'delivery', gateDismissed: true }))
    setGateOpen(false)
  }, [setState])

  const continueWithCollection = useCallback(() => {
    setState((current) => ({ ...current, intent: 'collection', covered: false, gateDismissed: true }))
    setGateOpen(false)
  }, [setState])

  const value = useMemo(
    () => ({
      ...state,
      gateOpen,
      openGate,
      closeGate,
      checkPostcode,
      continueWithDelivery,
      continueWithCollection
    }),
    [state, gateOpen, openGate, closeGate, checkPostcode, continueWithDelivery, continueWithCollection]
  )

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>
}

export function useDelivery() {
  const context = useContext(DeliveryContext)
  if (!context) throw new Error('useDelivery must be used inside <DeliveryProvider>')
  return context
}

export default DeliveryContext
