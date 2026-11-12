import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { isApiConfigured } from '../api/client'
import * as customerApi from '../api/customer'
import { mapAddress } from '../api/normalise'

const AddressContext = createContext(null)

export const EMPTY_ADDRESS = {
  contactPersonName: '',
  contactPersonNumber: '',
  addressType: 'home',
  house: '',
  floor: '',
  road: '',
  address: '',
  postcode: ''
}

/**
 * Saved delivery / collection addresses.
 * Uses `GET/POST /customer/address/*` when the API is configured and keeps
 * them in localStorage otherwise (demo mode).
 */
export function AddressProvider({ children }) {
  const apiMode = isApiConfigured()
  const [addresses, setAddresses] = useLocalStorage('ppp-addresses', [])

  const reload = useCallback(async () => {
    if (!apiMode) return
    try {
      const data = await customerApi.listAddresses()
      const rows = Array.isArray(data) ? data : data?.addresses
      if (Array.isArray(rows)) setAddresses(rows.map(mapAddress))
    } catch {
      // API unreachable — keep whatever is stored locally.
    }
  }, [apiMode, setAddresses])

  useEffect(() => {
    reload()
  }, [reload])

  const saveAddress = useCallback(
    async (address) => {
      if (apiMode) {
        // Field names follow `POST /customer/address/add` in the API reference.
        const payload = {
          address_type: address.addressType || 'home',
          contact_person_name: address.contactPersonName,
          contact_person_number: address.contactPersonNumber,
          house: address.house || '',
          floor: address.floor || '',
          road: address.road || '',
          town: address.address || '',
          address: [address.house, address.floor, address.road, address.address]
            .filter(Boolean)
            .join(', '),
          address_line_1: address.house || '',
          address_line_2: address.floor || '',
          city: address.address || '',
          postcode: address.postcode || '',
          is_default: Boolean(address.isDefault)
        }
        try {
          if (address.id) await customerApi.updateAddress(address.id, payload)
          else await customerApi.addAddress(payload)
          await reload()
          return
        } catch (error) {
          // A rejected address must not look saved — show the API message.
          if (error?.status) throw error
          // Network down: fall through to the local copy so the form is kept.
        }
      }

      setAddresses((current) => {
        if (address.id) {
          return current.map((entry) => (entry.id === address.id ? { ...entry, ...address } : entry))
        }
        return [{ ...address, id: `addr-${Date.now()}` }, ...current]
      })
    },
    [apiMode, reload, setAddresses]
  )

  const removeAddress = useCallback(
    async (id) => {
      if (apiMode) {
        try {
          await customerApi.deleteAddress(id)
          await reload()
          return
        } catch {
          /* remove locally below */
        }
      }
      setAddresses((current) => current.filter((entry) => entry.id !== id))
    },
    [apiMode, reload, setAddresses]
  )

  const value = useMemo(
    () => ({ addresses, saveAddress, removeAddress, reloadAddresses: reload }),
    [addresses, saveAddress, removeAddress, reload]
  )

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
}

export function useAddresses() {
  const context = useContext(AddressContext)
  if (!context) throw new Error('useAddresses must be used inside <AddressProvider>')
  return context
}

export default AddressContext
