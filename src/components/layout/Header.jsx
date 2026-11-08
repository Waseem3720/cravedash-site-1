import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import TopBar from './TopBar'
import { restaurant } from '../../data/restaurant'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useUI } from '../../context/UIContext'
import { useDelivery } from '../../context/DeliveryContext'
import { useToast } from '../../context/ToastContext'
import { useStorefront } from '../../context/StorefrontContext'
import BranchModal from './BranchModal'

const NAV_LINKS = [
  { label: 'Home', to: '/', path: '/', hash: '' },
  { label: 'Story', to: '/#our-story', path: '/', hash: '#our-story' },
  { label: 'Menu', to: '/menu', path: '/menu' },
  { label: 'Book a table', to: '/booking', path: '/booking' },
  { label: 'Contact', to: '/#contact', path: '/', hash: '#contact' }
]

export default function Header() {
  const { count } = useCart()
  const { user, isSignedIn, initials, displayName, fullName, logout } = useAuth()
  const { openAuth, toggleCart, openAccount } = useUI()
  const { openGate } = useDelivery()
  const { toast } = useToast()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [branchOpen, setBranchOpen] = useState(false)
  const accountRef = useRef(null)
  const { branches, branchId, selectedBranch, selectBranch } = useStorefront()

  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!accountOpen) return undefined
    const onPointerDown = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [accountOpen])

  // Green pill on whichever link was clicked — pages by path, sections by hash.
  const isActive = (link) =>
    location.pathname === link.path && (location.hash || '') === (link.hash || '')

  const handleSignOut = () => {
    logout()
    setAccountOpen(false)
    toast('Signed out')
  }

  return (
    <div className={`site-chrome${menuOpen ? ' is-nav-open' : ''}`}>
      <TopBar />
      <BranchModal
        open={branchOpen}
        branches={branches}
        currentBranchId={branchId}
        onClose={() => setBranchOpen(false)}
        onSelect={(id) => {
          selectBranch(id)
          setBranchOpen(false)
        }}
      />
      <header className="cd-hdr">
        <div className="container cd-hdr__in">
          <Link className="cd-brand" aria-label={`${restaurant.name} home`} to="/">
            <img className="cd-brand__img" src="/images/porto-logo.png" alt={restaurant.name} />
          </Link>

          <nav className={`cd-hdr__nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
            {branches.length > 0 ? (
              <button
                type="button"
                className="cd-hdr__nav-action cd-hdr__branch-mobile"
                onClick={() => setBranchOpen(true)}
              >
                {selectedBranch?.name || 'Select'}
              </button>
            ) : null}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={isActive(link) ? 'is-active' : undefined}
                aria-current={isActive(link) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className="cd-hdr__nav-extras">
              <button type="button" className="cd-hdr__nav-action" onClick={openGate}>
                Check delivery postcode
              </button>
              {isSignedIn ? (
                <>
                  <button
                    type="button"
                    className="cd-hdr__nav-action"
                    onClick={() => openAccount('hub')}
                  >
                    Account ({displayName})
                  </button>
                  <button
                    type="button"
                    className="cd-hdr__nav-action"
                    onClick={() => openAccount('orders')}
                  >
                    My Orders
                  </button>
                  <button type="button" className="cd-hdr__nav-action is-danger" onClick={handleSignOut}>
                    Logout
                  </button>
                </>
              ) : (
                <button type="button" className="cd-hdr__nav-action" onClick={() => openAuth('login')}>
                  Sign In
                </button>
              )}
              <button type="button" className="cd-hdr__nav-action" onClick={toggleCart}>
                Cart{count > 0 ? ` (${count})` : ''}
              </button>
            </div>
          </nav>

          <div className="cd-hdr__actions">
            {branches.length > 0 ? (
              <button
                type="button"
                className="cd-btn cd-btn--ghost cd-hdr__branch"
                onClick={() => setBranchOpen(true)}
              >
                {selectedBranch?.name || 'Select'}
              </button>
            ) : null}

            {isSignedIn ? (
              <div className={`account${accountOpen ? ' is-open' : ''}`} ref={accountRef}>
                {/* Clicking the name goes straight to the account page. */}
                <button
                  className="cd-btn cd-btn--primary account__chip"
                  type="button"
                  onClick={() => {
                    setAccountOpen(false)
                    openAccount('hub')
                  }}
                >
                  <span className="avatar">
                    {user?.avatarUrl ? (
                      <img className="avatar__img" src={user.avatarUrl} alt="" />
                    ) : (
                      initials
                    )}
                  </span>{' '}
                  {displayName || 'Account'}
                </button>
                <button
                  className="account__caret"
                  type="button"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountOpen((open) => !open)}
                >
                  <Icon name="chevron" />
                </button>
                {accountOpen && (
                  <div className="account__menu" role="menu">
                    <button
                      type="button"
                      className="account__head"
                      onClick={() => {
                        setAccountOpen(false)
                        openAccount('hub')
                      }}
                    >
                      <span className="avatar">
                        {user?.avatarUrl ? (
                          <img className="avatar__img" src={user.avatarUrl} alt="" />
                        ) : (
                          initials
                        )}
                      </span>
                      <span className="account__name">{fullName}</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountOpen(false)
                        openAccount('profile')
                      }}
                    >
                      My Profile
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountOpen(false)
                        openAccount('orders')
                      }}
                    >
                      My Orders
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountOpen(false)
                        openAccount('addresses')
                      }}
                    >
                      Saved Addresses
                    </button>
                    <button type="button" role="menuitem" className="is-danger" onClick={handleSignOut}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="cd-btn cd-btn--ghost cd-hdr__signin"
                onClick={() => openAuth('login')}
              >
                Sign In
              </button>
            )}

            <button
              type="button"
              className="cart-btn"
              aria-label={count > 0 ? `Open cart, ${count} items` : 'Open cart'}
              onClick={toggleCart}
            >
              <Icon name="cart" />
              {count > 0 && <span className="cart-btn__count">{count}</span>}
            </button>

            <button
              className={`menu-toggle${menuOpen ? ' is-open' : ''}`}
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </div>
  )
}
