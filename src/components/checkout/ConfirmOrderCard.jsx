import { useCart } from '../../context/CartContext'
import { useStorefront } from '../../context/StorefrontContext'
import { dishImage, formatPrice, onDishImageError } from '../../utils/format'

/** Step 3 — the "Confirm your order" card before the order is placed. */
export default function ConfirmOrderCard({
  paymentLabel,
  agreed,
  onAgreedChange,
  error,
  onComplete,
  onBack,
  busy
}) {
  const { profile } = useStorefront()
  const {
    items,
    mode,
    address,
    subtotal,
    deliveryCharge,
    serviceFee,
    bagCharge,
    discount,
    coupon,
    tip,
    total
  } = useCart()

  const addressLine = [address.house, address.floor, address.road, address.town]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="confirm-wrap">
      <section className="card confirm-card">
        <h2 className="card__title">Confirm your order</h2>

        <dl className="confirm-rows">
          <div className="confirm-row">
            <dt>Payment method</dt>
            <dd>{paymentLabel}</dd>
          </div>
          <div className="confirm-row">
            <dt>{mode === 'delivery' ? 'Delivery' : 'Collection'}</dt>
            <dd>
              {mode === 'delivery'
                ? `${addressLine}${address.postcode ? `, ${address.postcode}` : ''}`
                : 'Collection from restaurant'}
            </dd>
          </div>
        </dl>

        <div className="confirm-items">
          {items.map((item) => (
            <div className="confirm-item" key={item.lineId || item.productId}>
              <img src={dishImage(item.image)} alt="" onError={onDishImageError} />
              <b>
                {item.name}
                {item.optionPath ? <small>{item.optionPath}</small> : null}
                <small>× {item.quantity}</small>
              </b>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="sum-rows">
          <div className="sum-rows__row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {mode === 'delivery' ? (
            <div className="sum-rows__row">
              <span>Standard delivery</span>
              <span>{deliveryCharge ? formatPrice(deliveryCharge) : 'Free'}</span>
            </div>
          ) : null}
          <div className="sum-rows__row">
            <span>Service fee</span>
            <span>{formatPrice(serviceFee)}</span>
          </div>
          <div className="sum-rows__row">
            <span>Bag charges</span>
            <span>{formatPrice(bagCharge)}</span>
          </div>
          {discount > 0 ? (
            <div className="sum-rows__row sum-rows__row--green">
              <span>Coupon {coupon?.code}</span>
              <span>−{formatPrice(discount)}</span>
            </div>
          ) : null}
          {tip > 0 ? (
            <div className="sum-rows__row">
              <span>Tip</span>
              <span>{formatPrice(tip)}</span>
            </div>
          ) : null}
        </div>

        <div className="confirm-total">
          <b>Total</b>
          <span>{formatPrice(total)}</span>
        </div>

        <label className="confirm-box">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => onAgreedChange(event.target.checked)}
          />
          <span>
            I confirm that my order is correct and I agree to the <b>terms and conditions</b>.
          </span>
        </label>

        {error && <p className="pp-form-error">{error}</p>}

        <button
          type="button"
          className="btn btn--primary btn--block btn--lg"
          onClick={onComplete}
          disabled={busy}
        >
          {busy ? 'Placing order…' : 'Complete Order'}
        </button>

        <button type="button" className="btn btn--ghost btn--block checkout-back" onClick={onBack}>
          Back to payment
        </button>

        <p className="pay-terms">
          Collection &amp; delivery from {profile.address.full}
        </p>
      </section>
    </div>
  )
}
