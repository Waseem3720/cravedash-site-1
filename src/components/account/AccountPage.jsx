import { useEffect } from 'react'
import AccountHub from './AccountHub'
import AddressesView from './AddressesView'
import CouponsView from './CouponsView'
import FavouritesView from './FavouritesView'
import LoyaltyView from './LoyaltyView'
import NotificationsView from './NotificationsView'
import OrdersView from './OrdersView'
import ProfileView from './ProfileView'
import ReferView from './ReferView'
import SupportView from './SupportView'
import WalletView from './WalletView'
import { useAuth } from '../../context/AuthContext'
import { useUI } from '../../context/UIContext'
import { useToast } from '../../context/ToastContext'
import { useBodyLock } from '../../hooks/useUiEffects'

/**
 * Account panel — the same `.account-page-root` overlay the original design
 * opens from the navbar avatar. The site header stays visible (and sticky)
 * above it, exactly like the front end.
 */
export default function AccountPage() {
  const { accountView, setAccountView, closeAccount } = useUI()
  const { isSignedIn, logout, deleteAccount } = useAuth()
  const { toast } = useToast()
  const open = Boolean(accountView) && isSignedIn

  useBodyLock(open)

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeAccount()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closeAccount])

  // Signing out closes the overlay.
  useEffect(() => {
    if (!isSignedIn && accountView) closeAccount()
  }, [isSignedIn, accountView, closeAccount])

  if (!open) return null

  const backToHub = () => setAccountView('hub')

  const handleDelete = () => {
    if (window.confirm('Delete your account permanently? This cannot be undone.')) {
      deleteAccount()
      toast('Account deleted')
    }
  }

  return (
    <div className="account-page-root" role="dialog" aria-modal="true" aria-label="My Account">
      <div className="container account-page-shell">
          <button
            type="button"
            className="account-page-close"
            aria-label="Close"
            onClick={closeAccount}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="account-page-content">
            {accountView === 'hub' && (
              <AccountHub
                onOpen={setAccountView}
                onLogout={() => {
                  logout()
                  toast('Signed out')
                }}
                onDeleteAccount={handleDelete}
              />
            )}
            {accountView === 'profile' && <ProfileView onBack={backToHub} />}
            {accountView === 'orders' && <OrdersView onBack={backToHub} />}
            {accountView === 'addresses' && <AddressesView onBack={backToHub} />}
            {accountView === 'wallet' && <WalletView onBack={backToHub} />}
            {accountView === 'loyalty' && <LoyaltyView onBack={backToHub} />}
            {accountView === 'coupons' && <CouponsView onBack={backToHub} />}
            {accountView === 'refer' && <ReferView onBack={backToHub} />}
            {accountView === 'favourites' && <FavouritesView onBack={backToHub} />}
            {accountView === 'notifications' && <NotificationsView onBack={backToHub} />}
          {accountView === 'support' && <SupportView onBack={backToHub} />}
        </div>
      </div>
    </div>
  )
}
