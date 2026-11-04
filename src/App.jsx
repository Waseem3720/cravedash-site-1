import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import ProductPage from './pages/ProductPage'
import BookingPage from './pages/BookingPage'
import CheckoutPage from './pages/CheckoutPage'
import NotFoundPage from './pages/NotFoundPage'
import AppTabBar from './components/layout/AppTabBar'
import CartDock from './components/layout/CartDock'
import CartDrawer from './components/cart/CartDrawer'
import ItemModal from './components/product/ItemModal'
import AccountPage from './components/account/AccountPage'
import AuthModal from './components/modals/AuthModal'
import PostcodeGate from './components/modals/PostcodeGate'
import ToastHost from './components/ui/ToastHost'
import { useScrolled } from './hooks/useUiEffects'

export default function App() {
  const location = useLocation()
  const scrolled = useScrolled(8)
  const isBooking = location.pathname === '/booking'

  // Page-level classes / CSS variables the original design expects.
  useEffect(() => {
    document.documentElement.classList.add('has-topbar', 'has-app-tabbar')
    document.documentElement.dataset.menuView = 'image'
    const style = document.documentElement.style
    style.setProperty('--orange', '#ff8800')
    style.setProperty('--orange-hover', '#e67a00')
    style.setProperty('--orange-deep', '#cc6d00')
    style.setProperty('--orange-soft', '#FFF3E4')
    style.setProperty('--orange-line', '#FFCF99')
  }, [])

  // Keep the sticky offsets in sync with the real header height.
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector('.cd-hdr')
      const topbar = document.querySelector('.topbar')
      const headerHeight = header ? header.offsetHeight : 72
      const topbarHeight = topbar ? topbar.offsetHeight : 0
      document.documentElement.style.setProperty('--cd-hdr-h', `${headerHeight}px`)
      document.documentElement.style.setProperty('--header-offset', `${headerHeight + topbarHeight}px`)
    }
    measure()
    const timer = window.setTimeout(measure, 250)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', measure)
    }
  }, [location.pathname])

  useEffect(() => {
    if (location.hash) {
      const timer = window.setTimeout(() => {
        const target = document.querySelector(location.hash)
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
      return () => window.clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
    return undefined
  }, [location.pathname, location.hash])

  return (
    <>
      <main data-header-theme="light" data-scrolled={scrolled ? '1' : '0'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isBooking && <AppTabBar />}
      {!isBooking && <CartDock />}

      <ItemModal />
      <CartDrawer />
      <AuthModal />
      <PostcodeGate />
      <AccountPage />
      <ToastHost />
    </>
  )
}
