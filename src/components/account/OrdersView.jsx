import { useMemo, useState } from 'react'
import AccountView from './AccountView'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { dishImage, formatPrice, onDishImageError } from '../../utils/format'
import { formatOrderDate, orderBucket, orderProgressStep, orderStatusLabel } from '../../utils/orderStatus'
import { isApiConfigured } from '../../api/client'
import { getOrderDetails, trackOrder as trackOrderApi } from '../../api/orders'
import { mapOrder } from '../../api/normalise'

function Tick() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="11"
      height="11"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 13 4 4 10-10" />
    </svg>
  )
}

export default function OrdersView({ onBack }) {
  const { orders, refreshAccount, cancelOrder } = useAuth()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [filter, setFilter] = useState('all')
  const [detailsOpen, setDetailsOpen] = useState(null)
  /** Order details fetched for orders the list response left without lines. */
  const [lines, setLines] = useState({})
  /** Live status from `GET /customer/order/track`, keyed by order id. */
  const [tracking, setTracking] = useState({})
  const [busy, setBusy] = useState(null)

  const counts = useMemo(() => {
    const tally = { all: orders.length, active: 0, delivered: 0, cancelled: 0 }
    orders.forEach((order) => {
      tally[orderBucket(order.status)] += 1
    })
    return tally
  }, [orders])

  const visible = useMemo(
    () => orders.filter((order) => filter === 'all' || orderBucket(order.status) === filter),
    [orders, filter]
  )

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'delivered', label: 'Delivered', count: counts.delivered },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled }
  ]

  const reorder = (order) => {
    const orderLines = order.items?.length ? order.items : lines[order.id] || []
    // Deal lines carry product_id null — they re-order through the deal popup,
    // not a product id, so they are skipped rather than added broken.
    const usable = orderLines.filter((line) => line.productId)
    usable.forEach((line) => {
      addItem(
        { id: line.productId, name: line.name, price: line.price, image: line.image },
        line.quantity,
        { unitPrice: line.price, optionPath: line.optionPath || '' }
      )
    })
    toast(`${usable.length} line${usable.length === 1 ? '' : 's'} added back to your cart`)
  }

  /** `GET /customer/order/details` supplies the lines the list endpoint omits. */
  const loadLines = async (order) => {
    if (!isApiConfigured() || order.items?.length) return
    try {
      const data = await getOrderDetails(order.id)
      const mapped = mapOrder(data?.order || data)
      setLines((current) => ({ ...current, [order.id]: mapped.items }))
    } catch {
      /* the card still shows its summary */
    }
  }

  const toggleDetails = (order) => {
    const next = detailsOpen === order.id ? null : order.id
    setDetailsOpen(next)
    if (next) loadLines(order)
  }

  /** "Track Order" pulls the live status from the API, then shows the tracker. */
  const trackOrder = async (order) => {
    setDetailsOpen(order.id)
    await loadLines(order)
    if (!isApiConfigured()) return

    try {
      const data = await trackOrderApi({
        orderId: order.id,
        phone: order.customer?.phone || undefined,
        email: order.customer?.email || undefined
      })
      if (data) {
        setTracking((current) => ({
          ...current,
          [order.id]: {
            status: data.status || order.status,
            driverDistanceKm: data.driver_distance_km ?? null,
            deliveryManAssigned: Boolean(data.delivery_man_assigned),
            history: Array.isArray(data.history) ? data.history : []
          }
        }))
      }
      await refreshAccount()
      toast('Order status updated')
    } catch (error) {
      toast(error?.message || 'Could not fetch live tracking', 'error')
    }
  }

  /** `PUT /customer/order/cancel` — only while the order is still pending. */
  const requestCancel = async (order) => {
    const label = order.id
    if (!window.confirm(`Cancel order #${label}? This cannot be undone.`)) return

    setBusy(order.id)
    try {
      await cancelOrder(order.id)
      toast(`Order #${label} cancelled`)
    } catch (error) {
      toast(error?.message || 'This order could not be cancelled', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <AccountView
      title="My Orders"
      subtitle="Track and manage all your previous orders"
      onBack={onBack}
      hero
      headExtra={
        <div className="filters">
          {filters.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`filter${filter === entry.id ? ' is-active' : ''}`}
              onClick={() => setFilter(entry.id)}
            >
              {entry.label}
              {typeof entry.count === 'number' ? ` (${entry.count})` : ''}
            </button>
          ))}
        </div>
      }
    >
      {visible.length === 0 ? (
        <p className="account-muted">No orders in this list.</p>
      ) : (
        <div className="account-order-list">
          {visible.map((order) => {
            const live = tracking[order.id]
            const status = live?.status || order.status
            const bucket = orderBucket(status)
            const step = orderProgressStep(status)
            const items = order.items?.length ? order.items : lines[order.id] || []
            const detailsCount = items.length
            const typeLabel = String(order.orderType || order.mode || 'order').replace(/_/g, ' ')

            return (
              <article className="order-card" key={order.id}>
                {bucket === 'active' ? (
                  <div className="order-card__flag">
                    <span className="dot" aria-hidden="true" />
                    {step === 2 ? 'Out for delivery' : step === 1 ? 'Preparing your order' : 'Order confirmed'}
                  </div>
                ) : null}

                <div className="order-card__body">
                  <div className="order-card__top">
                    <h2 className="order-card__id">Order #{order.id}</h2>
                    <span
                      className={
                        bucket === 'delivered'
                          ? 'tag tag--done'
                          : bucket === 'cancelled'
                            ? 'tag tag--cancel'
                            : 'tag tag--prep'
                      }
                    >
                      <i className="dot" /> {orderStatusLabel(status)}
                    </span>
                  </div>

                  {order.createdAt ? (
                    <p className="order-card__date">{formatOrderDate(order.createdAt)}</p>
                  ) : null}

                  <div className="order-card__items">
                    {items[0]?.image ? (
                      <img alt="" src={dishImage(items[0].image)} onError={onDishImageError} />
                    ) : null}
                    <p>
                      {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
                      {detailsCount > 0 ? (
                        <span>
                          {' '}
                          · {detailsCount} item{detailsCount === 1 ? '' : 's'}
                        </span>
                      ) : null}
                      <br />
                      <span>Total {formatPrice(order.total || 0)}</span>
                    </p>
                  </div>

                  {detailsOpen === order.id ? (
                    <div className="lines">
                      {items.map((line, lineIndex) => (
                        <div className="lines__row" key={`${order.id}-${lineIndex}`}>
                          <span className="lines__qty">{line.quantity}</span>
                          <b>
                            {line.name}
                            {line.optionPath ? <small className="cart-item__opt"> {line.optionPath}</small> : null}
                          </b>
                          <span>{formatPrice(line.price * line.quantity)}</span>
                        </div>
                      ))}
                      <div className="lines__row lines__row--sub">
                        <span className="lines__qty">£</span>
                        <b>{order.mode === 'delivery' ? 'Delivery' : 'Collection'}</b>
                        <span>{formatPrice(order.deliveryCharge || 0)}</span>
                      </div>
                      <div className="lines__row">
                        <span className="lines__qty">=</span>
                        <b>Total paid</b>
                        <span>{formatPrice(order.total || 0)}</span>
                      </div>
                    </div>
                  ) : null}

                  {bucket === 'active' ? (
                    <div className="track">
                      <div className={`track__step${step >= 0 ? ' is-done' : ''}`}>
                        <span className="track__dot">{step > 0 ? <Tick /> : '1'}</span>
                        <small>Confirmed</small>
                      </div>
                      <div className={`track__bar${step >= 1 ? ' is-done' : ''}`} />
                      <div className={`track__step${step === 1 ? ' is-current' : ''}${step > 1 ? ' is-done' : ''}`}>
                        <span className="track__dot">{step > 1 ? <Tick /> : '2'}</span>
                        <small>Preparing</small>
                      </div>
                      <div className={`track__bar${step >= 2 ? ' is-done' : ''}`} />
                      <div className={`track__step${step === 2 ? ' is-current' : ''}`}>
                        <span className="track__dot">3</span>
                        <small>Out for Delivery</small>
                      </div>
                    </div>
                  ) : null}

                  {bucket === 'active' && live?.driverDistanceKm != null ? (
                    <p className="order-card__date">
                      {live.deliveryManAssigned ? 'Driver assigned' : 'Assigning a driver'} ·{' '}
                      {Number(live.driverDistanceKm).toFixed(1)} km away
                    </p>
                  ) : null}

                  <div
                    className="order-card__actions"
                    style={bucket === 'cancelled' ? { gridTemplateColumns: '1fr' } : undefined}
                  >
                    <button
                      type="button"
                      className="btn btn--ghost btn--block"
                      onClick={() => toggleDetails(order)}
                    >
                      {detailsOpen === order.id ? 'Hide Details' : 'View Details'}
                    </button>
                    {bucket !== 'cancelled' ? (
                      <button
                        type="button"
                        className="btn btn--primary btn--block"
                        onClick={() => (bucket === 'active' ? trackOrder(order) : reorder(order))}
                      >
                        {bucket === 'active' ? 'Track Order' : 'Reorder'}
                      </button>
                    ) : null}
                    {String(status).toLowerCase() === 'pending' ? (
                      <button
                        type="button"
                        className="btn btn--ghost btn--block"
                        style={{ gridColumn: '1 / -1' }}
                        disabled={busy === order.id}
                        onClick={() => requestCancel(order)}
                      >
                        {busy === order.id ? 'Cancelling…' : 'Cancel order'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </AccountView>
  )
}
