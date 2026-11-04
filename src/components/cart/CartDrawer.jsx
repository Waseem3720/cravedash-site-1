import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import CartItem from './CartItem'
import ModeTabs from './ModeTabs'
import UnavailableDialog from './UnavailableDialog'
import { useCart } from '../../context/CartContext'
import { useUI } from '../../context/UIContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useBodyLock } from '../../hooks/useUiEffects'
import { formatPrice } from '../../utils/format'

export default function CartDrawer() {
  const {
    items,
    mode,
    subtotal,
    deliveryCharge,
    total,
    notes,
    unavailable,
    minimumOrder,
    isBelowMinimum,
    increment,
    decrement,
    removeItem,
    setMode,
    setNotes,
    setUnavailable
  } = useCart()
  const { cartOpen, closeCart, openAuth } = useUI()
  const { isSignedIn } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [showSummary, setShowSummary] = useState(false)
  const [unavailableOpen, setUnavailableOpen] = useState(false)

  useBodyLock(cartOpen)

  useEffect(() => {
    if (!cartOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [cartOpen, closeCart])

  if (!cartOpen) return null

  const handleCheckout = () => {
    if (!items.length) return
    if (isBelowMinimum) {
      toast(`Minimum order is ${formatPrice(minimumOrder)}`, 'error')
      return
    }
    if (!isSignedIn) {
      openAuth('login')
      return
    }
    closeCart()
    navigate('/checkout')
  }

  const empty = items.length === 0

  return (
    <>
      <div className="cart-app-layer" role="dialog" aria-modal="true" aria-label="Your cart">
        <button type="button" className="cart-app-backdrop" aria-label="Close cart" onClick={closeCart} />

        <aside className="cart cart--drawer" aria-label="Your cart">
          <button type="button" className="cart__close" aria-label="Close cart" onClick={closeCart}>
            <Icon name="close" />
          </button>
          <button type="button" className="cart__back" onClick={closeCart}>
            <Icon name="chevronLeft" />
            Continue shopping
          </button>
          <p className="cart__eyebrow">Your order</p>
          <button
            type="button"
            className="cart__title cd-cart-title-toggle"
            aria-label="Close cart"
            onClick={closeCart}
          >
            Cart ×
          </button>

          <ModeTabs mode={mode} onChange={setMode} />

          {empty ? (
            <p className="note note--err">Your cart is empty. Add something delicious from the menu.</p>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.lineId || item.productId}
                item={item}
                onIncrease={increment}
                onDecrease={decrement}
                onRemove={(id) => {
                  removeItem(id)
                  toast('Item removed from your cart')
                }}
              />
            ))
          )}

          <div className="totals">
            <div className="totals__row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {showSummary && (
              <>
                <div className="totals__row">
                  <span>{mode === 'delivery' ? 'Delivery' : 'Collection'}</span>
                  <span>{deliveryCharge ? formatPrice(deliveryCharge) : 'Free'}</span>
                </div>
                {mode === 'delivery' && !deliveryCharge && subtotal > 0 && (
                  <div className="totals__row">
                    <span>Free delivery applied</span>
                    <span>Yes</span>
                  </div>
                )}
              </>
            )}

            <div className="totals__sep" />
            <div className="grand">
              <div>
                <b>Total</b> <small>(incl. fees and tax)</small>
                <br />
                <a
                  className="link-muted"
                  href="#summary"
                  onClick={(event) => {
                    event.preventDefault()
                    setShowSummary((open) => !open)
                  }}
                >
                  {showSummary ? 'Hide summary' : 'See summary'}
                </a>
              </div>
              <div>
                <span className="grand__val">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="cd-unavail-row"
            aria-haspopup="dialog"
            onClick={() => setUnavailableOpen(true)}
          >
            <span className="cd-unavail-row__ic" aria-hidden="true">
              <Icon name="info" />
            </span>
            <span className="cd-unavail-row__txt">
              <small>If a product is not available</small>
              <b>{unavailable === 'call' ? 'Call me with an alternative' : 'Remove it from my order'}</b>
            </span>
            <span className="cd-unavail-row__chev" aria-hidden="true">
              <Icon name="chevron" />
            </span>
          </button>

          <div className="cart__notes">
            <label htmlFor="cart-note">Notes</label>
            <input
              id="cart-note"
              placeholder="Add notes or special instructions..."
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn--primary btn--block btn--lg"
            style={{ marginTop: 18 }}
            disabled={empty}
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </aside>
      </div>

      <UnavailableDialog
        key={`${unavailableOpen}-${unavailable}`}
        open={unavailableOpen}
        value={unavailable}
        onClose={() => setUnavailableOpen(false)}
        onSave={(choice) => {
          setUnavailable(choice)
          setUnavailableOpen(false)
          toast('Preference saved')
        }}
      />
    </>
  )
}
