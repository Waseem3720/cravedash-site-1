import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const LINKS = [
  { id: 'profile', label: 'My Profile' },
  { id: 'orders', label: 'My Orders' },
  { id: 'addresses', label: 'Saved Addresses' }
]

const MORE_LINKS = [
  { id: 'wallet', label: 'Wallet' },
  { id: 'loyalty', label: 'Loyalty Points' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'refer', label: 'Refer & Earn' },
  { id: 'favourites', label: 'Favourites' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'support', label: 'Help & Support' }
]

export default function AccountHub({ onOpen, onLogout, onDeleteAccount }) {
  const { user, fullName, initials } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="account-hub">
      <div className="page-head account-page-head">
        <p className="eyebrow">Account</p>
        <h1>My Account</h1>
        <p>Manage your profile, orders, and addresses</p>
      </div>

      <div className="card account-hub-card">
        <div className="account-hub-head">
          <div className="account-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              <span className="avatar account-avatar-fallback">{initials}</span>
            )}
          </div>
          <div>
            <h2 className="card__title">{fullName}</h2>
            <p className="account-hub-meta">
              {user?.email || '—'}
              {user?.phone ? ` · ${user.phone}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="card account-nav-card">
        <div className="account-nav">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              className="account-link-btn"
              onClick={() => onOpen(link.id)}
            >
              {link.label}
              <span aria-hidden="true">›</span>
            </button>
          ))}
          <button type="button" className="account-link-btn is-danger" onClick={onLogout}>
            Logout
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      <div className="card account-nav-card account-more-card">
        <button
          type="button"
          className="account-link-btn account-more-toggle"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
        >
          More
          <span aria-hidden="true">{moreOpen ? '▴' : '▾'}</span>
        </button>

        {moreOpen && (
          <div className="account-nav">
            {MORE_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                className="account-link-btn"
                onClick={() => onOpen(link.id)}
              >
                {link.label}
                <span aria-hidden="true">›</span>
              </button>
            ))}
            <button type="button" className="account-link-btn is-danger" onClick={onDeleteAccount}>
              Delete account
              <span aria-hidden="true">›</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
