import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [authView, setAuthView] = useState(null) // 'login' | 'register' | 'forgot'
  const [activeProduct, setActiveProduct] = useState(null)
  const [accountView, setAccountView] = useState(null) // 'hub' | 'profile' | 'orders' | 'addresses'

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const toggleCart = useCallback(() => setCartOpen((open) => !open), [])

  const openAuth = useCallback((view = 'login') => {
    setCartOpen(false)
    setAuthView(view)
  }, [])
  const closeAuth = useCallback(() => setAuthView(null), [])

  const openProduct = useCallback((product) => {
    setCartOpen(false)
    setActiveProduct(product)
  }, [])
  const closeProduct = useCallback(() => setActiveProduct(null), [])

  const openAccount = useCallback((view = 'hub') => {
    setCartOpen(false)
    setActiveProduct(null)
    setAccountView(view)
  }, [])
  const closeAccount = useCallback(() => setAccountView(null), [])

  const value = useMemo(
    () => ({
      cartOpen,
      authView,
      activeProduct,
      accountView,
      openCart,
      closeCart,
      toggleCart,
      openAuth,
      closeAuth,
      setAuthView,
      openProduct,
      closeProduct,
      openAccount,
      closeAccount,
      setAccountView
    }),
    [
      cartOpen,
      authView,
      activeProduct,
      accountView,
      openCart,
      closeCart,
      toggleCart,
      openAuth,
      closeAuth,
      openProduct,
      closeProduct,
      openAccount,
      closeAccount
    ]
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) throw new Error('useUI must be used inside <UIProvider>')
  return context
}

export default UIContext
