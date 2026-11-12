import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { dishImage, formatPrice, onDishImageError } from '../../utils/format'
import { couponDiscount, findCoupon } from '../../utils/coupon'
import { isApiConfigured } from '../../api/client'
import { applyCoupon as applyCouponApi, getCoupons as getCouponsApi } from '../../api/storefront'
import { mapCoupon } from '../../api/normalise'

const TIPS = [0, 1, 2, 5]

export default function OrderSummaryPanel({
  onAddMore,
  onProceed,
  ctaLabel = 'Proceed to payment',
  showCta = true,
  onScheduleClick,
  walletBalance = 0,
  walletApplied = 0,
  walletError = '',
  onApplyWallet,
  onRemoveWallet,
  amountDue
}) {
  const {
    items,
    mode,
    subtotal,
    deliveryCharge,
    serviceFee,
    bagCharge,
    discount,
    total,
    tip,
    cutlery,
    coupon,
    schedule,
    setTip,
    setCutlery,
    setCoupon
  } = useCart()
  const { isSignedIn } = useAuth()
  const { toast } = useToast()
  const [code, setCode] = useState('')
  const [walletInput, setWalletInput] = useState('')
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [couponError, setCouponError] = useState('')
  const [customTip, setCustomTip] = useState('')
  const displayTotal = amountDue != null ? amountDue : total

  useEffect(() => {
    if (!isApiConfigured() || !isSignedIn) {
      setAvailableCoupons([])
      return undefined
    }
    let cancelled = false
    getCouponsApi()
      .then((res) => {
        if (cancelled) return
        const rows = Array.isArray(res) ? res : res?.coupons || []
        setAvailableCoupons(rows.map(mapCoupon).filter((entry) => entry.code))
      })
      .catch(() => {
        if (!cancelled) setAvailableCoupons([])
      })
    return () => {
      cancelled = true
    }
  }, [isSignedIn])

  const submitCouponCode = async (rawCode) => {
    setCouponError('')
    const entered = String(rawCode || '').trim().toUpperCase()
    if (!entered) {
      setCouponError('Enter a coupon code.')
      return
    }

    // The server is the source of truth for a code's validity.
    if (isApiConfigured()) {
      try {
        const data = await applyCouponApi({ code: entered, subtotal })
        if (!data || data.valid === false) {
          setCouponError('That coupon code is not valid for this order.')
          return
        }
        const rawCoupon = data.coupon || data
        const mapped = mapCoupon(rawCoupon)
        setCoupon({ ...mapped, code: mapped.code || entered })
        setCode('')
        toast(`Coupon ${mapped.code || entered} applied`)
        return
      } catch (error) {
        if (error?.status && error.status < 500) {
          setCouponError(error.message || 'That coupon code could not be applied.')
          return
        }
        // The server could not be reached: never apply a discount the server has not checked.
        setCouponError('This coupon cannot be checked right now. Please try again.')
        return
      }
    }

    const found = findCoupon(entered)
    if (!found) {
      setCouponError('That coupon code is not valid.')
      return
    }
    if (couponDiscount(found, subtotal) <= 0) {
      setCouponError(`Minimum spend for ${found.code} is ${formatPrice(found.minSpend || 0)}.`)
      return
    }
    setCoupon(found)
    setCode('')
    toast(`Coupon ${found.code} applied`)
  }

  const applyCoupon = async (event) => {
    event.preventDefault()
    await submitCouponCode(code)
  }

  return (
    <aside className="summary">
      <h2 className="summary__title">Order Summary</h2>

      {items.map((item) => (
        <div className="summary__item" key={item.lineId || item.productId}>
          <img alt="" src={dishImage(item.image)} onError={onDishImageError} />
          <div>
            <b>{item.name}</b>
            {item.optionPath ? <small>{item.optionPath} · × {item.quantity}</small> : <small>× {item.quantity}</small>}
          </div>
          <span>{formatPrice(item.price * item.quantity)}</span>
        </div>
      ))}

      <button
        type="button"
        className="btn btn--outline btn--block"
        style={{ marginTop: 18 }}
        onClick={onAddMore}
      >
        Add more
      </button>

      <button
        type="button"
        className={`slot slot--btn${schedule?.time ? ' is-set' : ''}`}
        onClick={onScheduleClick}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5V12l3 2" strokeLinecap="round" />
        </svg>
        {schedule?.time ? `${schedule.date} · ${schedule.time}` : 'Choose schedule'}
      </button>

      <div className="coupon" style={{ marginTop: 16 }}>
        <p>Have a coupon code?</p>
        {coupon ? (
          <div className="coupon__applied">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="m5 13 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <b>{coupon.code}</b>
            <span>−{formatPrice(discount)}</span>
            <button type="button" className="link-muted" onClick={() => setCoupon(null)}>
              Remove
            </button>
          </div>
        ) : (
          <form className="coupon__row" onSubmit={applyCoupon}>
            <input
              placeholder="Enter coupon code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
            />
            <button type="submit" className="btn btn--primary">
              Apply
            </button>
          </form>
        )}
        {couponError && <p className="coupon__err">{couponError}</p>}
        {!coupon && availableCoupons.length > 0 ? (
          <div className="coupon-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {availableCoupons.map((entry) => (
              <button
                key={entry.id || entry.code}
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => submitCouponCode(entry.code)}
                title={entry.title || entry.code}
              >
                {entry.code} · {entry.discount}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {walletBalance > 0 && onApplyWallet ? (
        <div className="coupon" style={{ marginTop: 14 }}>
          <p>Use wallet balance? ({formatPrice(walletBalance)} available)</p>
          {walletApplied > 0 ? (
            <div className="coupon__applied">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="m5 13 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <b>Wallet</b>
              <span>−{formatPrice(walletApplied)}</span>
              <button type="button" className="link-muted" onClick={onRemoveWallet}>
                Remove
              </button>
            </div>
          ) : (
            <form
              className="coupon__row"
              onSubmit={(event) => {
                event.preventDefault()
                onApplyWallet(walletInput || Math.min(walletBalance, total))
                setWalletInput('')
              }}
            >
              <input
                inputMode="decimal"
                placeholder={`Up to ${formatPrice(Math.min(walletBalance, total))}`}
                value={walletInput}
                onChange={(event) => setWalletInput(event.target.value.replace(/[^\d.]/g, ''))}
              />
              <button type="submit" className="btn btn--primary">
                Apply
              </button>
            </form>
          )}
          {walletError ? <p className="coupon__err">{walletError}</p> : null}
        </div>
      ) : null}

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
        {walletApplied > 0 ? (
          <div className="sum-rows__row sum-rows__row--green">
            <span>Wallet credit</span>
            <span>−{formatPrice(walletApplied)}</span>
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 16 }}>
        <p className="pp-label">Add a tip (100% goes to staff)</p>
        <div className="filters" style={{ marginTop: 8 }}>
          {TIPS.map((value) => (
            <button
              key={value}
              type="button"
              className={`filter${tip === value ? ' is-active' : ''}`}
              onClick={() => {
                setTip(value)
                setCustomTip(value === 0 ? '' : String(value))
              }}
            >
              {value === 0 ? 'No tip' : formatPrice(value)}
            </button>
          ))}
        </div>
        <div className="pp-tip-other">
          <span>Other</span>
          <input
            inputMode="decimal"
            value={customTip}
            onChange={(event) => {
              const raw = event.target.value.replace(/[^\d.]/g, '')
              setCustomTip(raw)
              setTip(Number(raw) || 0)
            }}
          />
        </div>
      </div>

      <div className="cutlery">
        <div>
          <b>Cutlery</b>
          <small>Would you like cutlery with your order?</small>
        </div>
        <div className="seg">
          <button
            type="button"
            className={cutlery ? undefined : 'is-active'}
            onClick={() => setCutlery(false)}
          >
            No
          </button>
          <button
            type="button"
            className={cutlery ? 'is-active' : undefined}
            onClick={() => setCutlery(true)}
          >
            Yes
          </button>
        </div>
      </div>

      <div className="sum-total">
        <b>Total</b>
        <div>
          <span className="sum-total__val">{formatPrice(displayTotal)}</span>
          <small className="sum-total__note">incl. fees and tax</small>
        </div>
      </div>

      {showCta ? (
        <button
          type="button"
          className="btn btn--dark btn--block btn--lg btn--between checkout-inline-submit"
          style={{ marginTop: 16 }}
          onClick={onProceed}
        >
          <span>{ctaLabel}</span>
          <span>{formatPrice(displayTotal)}</span>
        </button>
      ) : null}
    </aside>
  )
}
