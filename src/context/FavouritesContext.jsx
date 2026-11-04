import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { isApiConfigured, getToken } from '../api/client'
import * as wishlistApi from '../api/wishlist'
import { useAuth } from './AuthContext'

const FavouritesContext = createContext(null)

/**
 * Saved products. Signed-in customers keep them on the server (the wish-list); signed-out visitors keep them in this
 * browser only, and they are kept once the customer signs in.
 */
export function FavouritesProvider({ children }) {
  const [ids, setIds] = useLocalStorage('ppp-favourites', [])
  const { user } = useAuth()
  const syncOnServer = isApiConfigured() && Boolean(user) && Boolean(getToken())

  // When a customer is signed in, the server list is the saved list.
  useEffect(() => {
    if (!syncOnServer) return undefined
    let cancelled = false
    wishlistApi
      .getWishlist()
      .then((data) => {
        if (cancelled) return
        const serverIds = (data?.products || []).map((product) => String(product.id))
        setIds(serverIds)
      })
      .catch(() => {
        /* keep the local list when the server cannot be reached */
      })
    return () => {
      cancelled = true
    }
  }, [syncOnServer, setIds])

  const isFavourite = useCallback((id) => ids.includes(id), [ids])

  const toggle = useCallback(
    (id) => {
      const saved = ids.includes(id)
      setIds((current) => (saved ? current.filter((item) => item !== id) : [...current, id]))
      if (!syncOnServer) return
      const request = saved ? wishlistApi.removeFromWishlist(id) : wishlistApi.addToWishlist(id)
      request.catch(() => {
        // Put the product back the way the server has it when the change was refused.
        setIds((current) => (saved ? [...current, id] : current.filter((item) => item !== id)))
      })
    },
    [ids, setIds, syncOnServer]
  )

  const value = useMemo(() => ({ ids, isFavourite, toggle }), [ids, isFavourite, toggle])

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>
}

export function useFavourites() {
  const context = useContext(FavouritesContext)
  if (!context) throw new Error('useFavourites must be used inside <FavouritesProvider>')
  return context
}

export default FavouritesContext
