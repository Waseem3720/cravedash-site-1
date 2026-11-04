import { useEffect, useState } from 'react'
import AccountView from './AccountView'
import { listNotifications } from '../../api/orders'

/** Order status updates from the server. Nothing is shown until the server answers. */
export default function NotificationsView({ onBack }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listNotifications()
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data?.notifications) ? data.notifications : [])
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || 'Notifications could not be loaded.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AccountView title="Notifications" subtitle="Updates about your orders" onBack={onBack} hero>
      {loading ? <p className="account-muted">Loading notifications…</p> : null}
      {error ? <p className="account-muted">{error}</p> : null}
      {!loading && !error && items.length === 0 ? <p className="account-muted">No notifications yet.</p> : null}
      {items.length > 0 ? (
        <div className="notification-list">
          {items.map((entry) => {
            const done = !['pending', 'confirmed', 'preparing'].includes(String(entry.status))
            return (
              <article className="card notification-card" key={entry.id}>
                <span className={`tag ${done ? 'tag--done' : 'tag--prep'}`}>
                  <i className="dot" />{' '}
                  {entry.created_at ? new Date(entry.created_at).toLocaleString('en-GB') : ''}
                </span>
                <strong>{entry.title}</strong>
                <p>{entry.message}</p>
              </article>
            )
          })}
        </div>
      ) : null}
    </AccountView>
  )
}
